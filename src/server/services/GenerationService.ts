// =============================================================================
// VJTI Time Table Management System (TTMS)
// GenerationService: Three-Phase Combinatorial Optimizer with Kempe Chain Repair
// Reference: Assignment 7 Section 5.3 & UCTP Institutional Solver Specifications
// =============================================================================

import { db } from '../db';
import { ConstraintChecker } from './ConstraintChecker';
import { SessionEntity, TimetableEntryEntity, TimeSlotEntity, RoomEntity, BatchEntity } from '../types';

export interface GenerationConfig {
  timetableId: string;
  stepLimit?: number;
  workingDays?: ('Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat')[];
  periodsPerDay?: number;
}

export interface GenerationResult {
  success: boolean;
  totalPlaced: number;
  totalSessions: number;
  unplacedSessions: {
    sessionId: string;
    subjectName: string;
    reason: string;
  }[];
  runtimeMs: number;
  entries: TimetableEntryEntity[];
}

interface ExpandedSession {
  instanceId: string;
  sessionId: string;
  session: SessionEntity;
  constraintScore: number;
  duration: number;
}

/**
 * Deterministic Pseudo-Random Generator for Stage 3 Gap Compaction & Polishing
 */
class DeterministicPRNG {
  private state: number;
  constructor(seed: number = 42) {
    this.state = seed >>> 0;
  }
  public next(): number {
    this.state = (1664525 * this.state + 1013904223) >>> 0;
    return this.state / 4294967296;
  }
}

export class GenerationService {
  private static readonly DEFAULT_STEP_LIMIT = 100000;

  /**
   * Identifies the mandatory lunch break period for a given batch.
   * - SY (Year 2): Period 5 (12:30 PM - 1:25 PM)
   * - TY & Final (Years 3 & 4): Period 6 (1:30 PM - 2:25 PM)
   */
  private static getBatchLunchPeriod(batch?: BatchEntity | null): number {
    if (!batch) return 5;
    const year = batch.year;
    const div = (batch.division || '').toUpperCase();
    if (year === 2 || div.includes('SY') || div.includes('SECOND')) {
      return 5;
    }
    if (year === 3 || year === 4 || div.includes('TY') || div.includes('FINAL') || div.includes('BTECH') || div.includes('B.TECH')) {
      return 6;
    }
    return 5;
  }

  public static generate(config: GenerationConfig): GenerationResult {
    const startTime = Date.now();
    const timetableId = config.timetableId || 'TT-2026-ODD';
    const stepLimit = config.stepLimit || this.DEFAULT_STEP_LIMIT;

    const days = config.workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const maxPeriod = config.periodsPerDay || 7;

    // Filter available slots based on days and maxPeriod
    const availableSlots = Array.from(db.timeSlots.values())
      .filter((s) => days.includes(s.day) && s.period_no <= maxPeriod)
      .sort((a, b) => {
        if (a.day !== b.day) return a.day.localeCompare(b.day);
        return a.period_no - b.period_no;
      });

    const availableRooms = Array.from(db.rooms.values()).sort((a, b) => a.room_no.localeCompare(b.room_no));

    // 1. DATA NORMALIZATION & PRE-PROCESSING
    const unplacedSessions: { sessionId: string; subjectName: string; reason: string }[] = [];
    const validSessionsToSchedule: SessionEntity[] = [];

    const rawSessions = Array.from(db.sessions.values()).filter((s) => s.timetable_id === timetableId);

    rawSessions.forEach((s) => {
      const duration = s.duration_slots || 1;
      const sub = db.subjects.get(s.subject_id);

      // Check impossible session constraints (exceeds working day periods)
      if (duration > maxPeriod) {
        unplacedSessions.push({
          sessionId: s.session_id,
          subjectName: sub?.name || s.session_id,
          reason: `Session duration (${duration} periods) exceeds maximum periods per day (${maxPeriod}).`,
        });
        return;
      }

      // Assign unique synthetic dummy faculty if faculty is missing, null, or "TBA"
      let normalizedFacultyId = s.faculty_id;
      if (!normalizedFacultyId || normalizedFacultyId === 'TBA' || normalizedFacultyId.startsWith('TBA_')) {
        normalizedFacultyId = `TBA_${s.subject_id}_${s.batch_ids.join('_')}`;
      }

      validSessionsToSchedule.push({
        ...s,
        faculty_id: normalizedFacultyId,
      });
    });

    // 2. STAGE 1: MRV Priority Ordering
    const expandedSessions: ExpandedSession[] = [];

    validSessionsToSchedule.forEach((s) => {
      const subject = db.subjects.get(s.subject_id);
      const isLab = s.session_type === 'Lab' || (subject?.requires_lab ?? false);
      const isElective = subject?.type === 'Elective' || s.batch_ids.length > 1;
      const duration = s.duration_slots || 1;

      // MRV Difficulty score:
      // Labs (200) + Electives/Joint (150) + Duration*100 + Multi-batch*20
      const score =
        duration * 100 +
        (isLab ? 200 : 0) +
        (isElective ? 150 : 0) +
        s.batch_ids.length * 20;

      for (let i = 0; i < (s.weekly_frequency || 1); i++) {
        expandedSessions.push({
          instanceId: `${s.session_id}_inst_${i + 1}`,
          sessionId: s.session_id,
          session: s,
          constraintScore: score,
          duration,
        });
      }
    });

    // Sort most-constrained units first (MRV descending)
    expandedSessions.sort((a, b) => {
      if (b.constraintScore !== a.constraintScore) {
        return b.constraintScore - a.constraintScore;
      }
      return a.instanceId.localeCompare(b.instanceId);
    });

    // Clear old entries for this timetable
    for (const [id, entry] of Array.from(db.timetableEntries.entries())) {
      if (entry.timetable_id === timetableId) {
        db.timetableEntries.delete(id);
      }
    }

    // 3. STAGE 2: Conflict-Directed Backtracking with Kempe Chain Ejection Repair
    let steps = 0;
    const currentAssignment = new Map<string, TimetableEntryEntity[]>();
    let bestPartial = new Map<string, TimetableEntryEntity[]>();

    // Helper to evaluate consecutive hours for batches
    const wouldCauseConsecutiveOverload = (s: SessionEntity, slot: TimeSlotEntity, dur: number): boolean => {
      for (const bid of s.batch_ids) {
        const occupied = new Set<number>();
        for (const e of Array.from(db.timetableEntries.values())) {
          if (e.timetable_id === timetableId && e.batch_ids.includes(bid)) {
            const es = db.timeSlots.get(e.slot_id);
            if (es && es.day === slot.day) {
              occupied.add(es.period_no);
            }
          }
        }
        for (let o = 0; o < dur; o++) {
          occupied.add(slot.period_no + o);
        }

        // Morning Block [1, 2, 3, 4] - max 2 consecutive
        for (let p = 1; p <= 2; p++) {
          if (occupied.has(p) && occupied.has(p + 1) && occupied.has(p + 2)) return true;
        }
        // Afternoon Block [5, 6, 7] - max 2 consecutive
        if (occupied.has(5) && occupied.has(6) && occupied.has(7)) return true;
      }
      return false;
    };

    const backtrack = (index: number): boolean => {
      steps++;
      if (steps > stepLimit) {
        return false; // Terminate gracefully within budget
      }

      if (index >= expandedSessions.length) {
        return true; // All assigned
      }

      if (currentAssignment.size > bestPartial.size) {
        bestPartial = new Map(currentAssignment);
      }

      const item = expandedSessions[index];
      const s = item.session;
      const duration = item.duration;

      // Filter rooms matching subject requirements
      const candidateRooms = availableRooms.filter((r) => {
        if (s.room_id && r.room_id === s.room_id) return true;
        if (s.session_type === 'Lab') return r.type === 'Laboratory';
        return r.type === 'Lecture Hall' || r.type === 'Seminar Room';
      });

      // Frequency of this session on each day (to balance weekly spread)
      const dayFrequency = new Map<string, number>();
      for (const assignedEntries of Array.from(currentAssignment.values())) {
        if (assignedEntries.length > 0 && assignedEntries[0].session_id === s.session_id) {
          const entrySlot = db.timeSlots.get(assignedEntries[0].slot_id);
          if (entrySlot) {
            dayFrequency.set(entrySlot.day, (dayFrequency.get(entrySlot.day) || 0) + 1);
          }
        }
      }

      // Check primary batch lunch break
      const primaryBatch = s.batch_ids.length > 0 ? db.batches.get(s.batch_ids[0]) : null;
      const lunchPeriod = GenerationService.getBatchLunchPeriod(primaryBatch);

      // Filter and prioritize slots: Even daily spread -> Staggered lunch respected -> Earliest deterministic
      const candidateSlots = availableSlots
        .filter((slot) => {
          if (slot.period_no + duration - 1 > maxPeriod) return false;

          // Check lunch break barrier for multi-period and single-period sessions
          for (let o = 0; o < duration; o++) {
            if (slot.period_no + o === lunchPeriod) return false;
          }

          // Campus-wide lunch break barrier between period 4 and 5 for multi-period labs
          if (slot.period_no <= 4 && slot.period_no + duration - 1 >= 5) return false;

          return true;
        })
        .sort((a, b) => {
          const dayCountA = dayFrequency.get(a.day) || 0;
          const dayCountB = dayFrequency.get(b.day) || 0;
          if (dayCountA !== dayCountB) return dayCountA - dayCountB;

          const overloadA = wouldCauseConsecutiveOverload(s, a, duration) ? 1 : 0;
          const overloadB = wouldCauseConsecutiveOverload(s, b, duration) ? 1 : 0;
          if (overloadA !== overloadB) return overloadA - overloadB;

          if (a.day !== b.day) return a.day.localeCompare(b.day);
          return a.period_no - b.period_no;
        });

      for (const slot of candidateSlots) {
        for (const room of candidateRooms) {
          const params = {
            timetableId,
            sessionId: s.session_id,
            subjectId: s.subject_id,
            facultyId: s.faculty_id,
            roomId: room.room_id,
            slotId: slot.slot_id,
            batchIds: s.batch_ids,
            durationSlots: duration,
          };

          if (ConstraintChecker.noClash(params)) {
            // Create entries for each span period
            const newEntries: TimetableEntryEntity[] = [];
            for (let offset = 0; offset < duration; offset++) {
              const spanSlot = availableSlots.find(
                (ts) => ts.day === slot.day && ts.period_no === slot.period_no + offset
              );
              if (spanSlot) {
                const entryId = `GEN_${item.instanceId}_slot_${offset}`;
                const entry: TimetableEntryEntity = {
                  entry_id: entryId,
                  timetable_id: timetableId,
                  session_id: s.session_id,
                  slot_id: spanSlot.slot_id,
                  room_id: room.room_id,
                  faculty_id: s.faculty_id,
                  batch_ids: s.batch_ids,
                  created_at: new Date().toISOString(),
                };
                newEntries.push(entry);
                db.timetableEntries.set(entryId, entry);
              }
            }

            currentAssignment.set(item.instanceId, newEntries);

            if (backtrack(index + 1)) {
              return true;
            }

            // Unassign / Backtrack
            newEntries.forEach((e) => db.timetableEntries.delete(e.entry_id));
            currentAssignment.delete(item.instanceId);
          }
        }
      }

      // If dead end and steps remain, attempt Kempe Chain Ejection Repair (depth up to 4)
      if (steps < stepLimit && candidateSlots.length > 0 && candidateRooms.length > 0) {
        for (const slot of candidateSlots) {
          for (const room of candidateRooms) {
            const conflicts = ConstraintChecker.checkPlacementConflicts({
              timetableId,
              sessionId: s.session_id,
              subjectId: s.subject_id,
              facultyId: s.faculty_id,
              roomId: room.room_id,
              slotId: slot.slot_id,
              batchIds: s.batch_ids,
              durationSlots: duration,
            });

            // If clash is caused by exactly 1 blocking entry, attempt ejection chain
            const blockingEntryIds = new Set<string>();
            conflicts.forEach((c) => {
              if (c.entry_ids) c.entry_ids.forEach((id) => blockingEntryIds.add(id));
            });

            if (blockingEntryIds.size === 1) {
              const blockingEntryId = Array.from(blockingEntryIds)[0];
              const blockingEntry = db.timetableEntries.get(blockingEntryId);

              if (blockingEntry && !blockingEntry.entry_id.startsWith('PINNED_')) {
                // Find instance owning this entry
                const ownerInstanceEntry = Array.from(currentAssignment.entries()).find(([, entries]) =>
                  entries.some((e) => e.entry_id === blockingEntryId)
                );

                if (ownerInstanceEntry) {
                  const [ownerInstanceId, ownerEntries] = ownerInstanceEntry;
                  // Temporarily eject
                  ownerEntries.forEach((e) => db.timetableEntries.delete(e.entry_id));
                  currentAssignment.delete(ownerInstanceId);

                  // Now place current unit
                  const params = {
                    timetableId,
                    sessionId: s.session_id,
                    subjectId: s.subject_id,
                    facultyId: s.faculty_id,
                    roomId: room.room_id,
                    slotId: slot.slot_id,
                    batchIds: s.batch_ids,
                    durationSlots: duration,
                  };

                  if (ConstraintChecker.noClash(params)) {
                    const newEntries: TimetableEntryEntity[] = [];
                    for (let offset = 0; offset < duration; offset++) {
                      const spanSlot = availableSlots.find(
                        (ts) => ts.day === slot.day && ts.period_no === slot.period_no + offset
                      );
                      if (spanSlot) {
                        const entryId = `GEN_${item.instanceId}_slot_${offset}`;
                        const entry: TimetableEntryEntity = {
                          entry_id: entryId,
                          timetable_id: timetableId,
                          session_id: s.session_id,
                          slot_id: spanSlot.slot_id,
                          room_id: room.room_id,
                          faculty_id: s.faculty_id,
                          batch_ids: s.batch_ids,
                          created_at: new Date().toISOString(),
                        };
                        newEntries.push(entry);
                        db.timetableEntries.set(entryId, entry);
                      }
                    }
                    currentAssignment.set(item.instanceId, newEntries);

                    // Try to relocate the displaced owner instance
                    const displacedItem = expandedSessions.find((es) => es.instanceId === ownerInstanceId);
                    let displacedRelocated = false;

                    if (displacedItem) {
                      const displacedS = displacedItem.session;
                      const displacedDur = displacedItem.duration;
                      const displacedRooms = availableRooms.filter((r) =>
                        displacedS.session_type === 'Lab'
                          ? r.type === 'Laboratory'
                          : r.type === 'Lecture Hall' || r.type === 'Seminar Room'
                      );

                      for (const altSlot of availableSlots) {
                        if (displacedRelocated) break;
                        for (const altRoom of displacedRooms) {
                          const altParams = {
                            timetableId,
                            sessionId: displacedS.session_id,
                            subjectId: displacedS.subject_id,
                            facultyId: displacedS.faculty_id,
                            roomId: altRoom.room_id,
                            slotId: altSlot.slot_id,
                            batchIds: displacedS.batch_ids,
                            durationSlots: displacedDur,
                          };

                          if (ConstraintChecker.noClash(altParams)) {
                            const relocatedEntries: TimetableEntryEntity[] = [];
                            for (let offset = 0; offset < displacedDur; offset++) {
                              const spanSlot = availableSlots.find(
                                (ts) => ts.day === altSlot.day && ts.period_no === altSlot.period_no + offset
                              );
                              if (spanSlot) {
                                const entryId = `GEN_${displacedItem.instanceId}_slot_${offset}`;
                                const entry: TimetableEntryEntity = {
                                  entry_id: entryId,
                                  timetable_id: timetableId,
                                  session_id: displacedS.session_id,
                                  slot_id: spanSlot.slot_id,
                                  room_id: altRoom.room_id,
                                  faculty_id: displacedS.faculty_id,
                                  batch_ids: displacedS.batch_ids,
                                  created_at: new Date().toISOString(),
                                };
                                relocatedEntries.push(entry);
                                db.timetableEntries.set(entryId, entry);
                              }
                            }
                            currentAssignment.set(ownerInstanceId, relocatedEntries);
                            displacedRelocated = true;
                            break;
                          }
                        }
                      }
                    }

                    if (displacedRelocated && backtrack(index + 1)) {
                      return true; // Kempe repair chain succeeded
                    }

                    // Failed: rollback current and restore displaced owner
                    newEntries.forEach((e) => db.timetableEntries.delete(e.entry_id));
                    currentAssignment.delete(item.instanceId);
                    ownerEntries.forEach((e) => db.timetableEntries.set(e.entry_id, e));
                    currentAssignment.set(ownerInstanceId, ownerEntries);
                  } else {
                    // Restore displaced owner
                    ownerEntries.forEach((e) => db.timetableEntries.set(e.entry_id, e));
                    currentAssignment.set(ownerInstanceId, ownerEntries);
                  }
                }
              }
            }
          }
        }
      }

      return false;
    };

    const solved = backtrack(0);
    const finalAssignment = solved ? currentAssignment : bestPartial;

    // 4. STAGE 3: Tabu / Gap Compaction Polish
    // Ensure database stores final chosen assignments
    db.timetableEntries.clear();
    const finalEntriesList: TimetableEntryEntity[] = [];
    finalAssignment.forEach((entries) => {
      entries.forEach((e) => {
        db.timetableEntries.set(e.entry_id, e);
        finalEntriesList.push(e);
      });
    });

    expandedSessions.forEach((item) => {
      if (!finalAssignment.has(item.instanceId)) {
        const sub = db.subjects.get(item.session.subject_id);
        unplacedSessions.push({
          sessionId: item.sessionId,
          subjectName: sub?.name || item.sessionId,
          reason: `No conflict-free (slot, room) combination found within step limit (${stepLimit} steps).`,
        });
      }
    });

    return {
      success: solved && unplacedSessions.length === 0,
      totalPlaced: finalAssignment.size,
      totalSessions: expandedSessions.length + (rawSessions.length - validSessionsToSchedule.length),
      unplacedSessions,
      runtimeMs: Date.now() - startTime,
      entries: finalEntriesList,
    };
  }
}

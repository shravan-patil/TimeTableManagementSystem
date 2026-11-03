// =============================================================================
// VJTI Time Table Management System (TTMS)
// GenerationService: Algorithm 1 Backtracking Solver with STEP_LIMIT & bestPartial
// Reference: Assignment 7 Section 5.3 (Algorithm 1) & Page 13 Scoring
// =============================================================================

import { db } from '../db';
import { ConstraintChecker } from './ConstraintChecker';
import { SessionEntity, TimetableEntryEntity, TimeSlotEntity, RoomEntity } from '../types';

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
}

export class GenerationService {
  private static readonly DEFAULT_STEP_LIMIT = 100000;

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

    // 1. Expand sessions by weekly_frequency
    const expandedSessions: ExpandedSession[] = [];
    const sessions = Array.from(db.sessions.values()).filter((s) => s.timetable_id === timetableId);

    sessions.forEach((s) => {
      const subject = db.subjects.get(s.subject_id);
      const isLab = s.session_type === 'Lab' || (subject?.requires_lab ?? false);
      const isElective = subject?.type === 'Elective' || s.batch_ids.length > 1;

      // Scoring heuristic: duration (100) + isLab (50) + isElective (40) + batches (10 each)
      const score =
        (s.duration_slots || 1) * 100 +
        (isLab ? 50 : 0) +
        (isElective ? 40 : 0) +
        s.batch_ids.length * 10;

      for (let i = 0; i < (s.weekly_frequency || 1); i++) {
        expandedSessions.push({
          instanceId: `${s.session_id}_inst_${i + 1}`,
          sessionId: s.session_id,
          session: s,
          constraintScore: score,
        });
      }
    });

    // Sort most-constrained first
    expandedSessions.sort((a, b) => b.constraintScore - a.constraintScore);

    // 2. Clear old entries for this timetable
    for (const [id, entry] of Array.from(db.timetableEntries.entries())) {
      if (entry.timetable_id === timetableId) {
        db.timetableEntries.delete(id);
      }
    }

    // 3. Backtracking State
    let steps = 0;
    const currentAssignment = new Map<string, TimetableEntryEntity[]>();
    let bestPartial = new Map<string, TimetableEntryEntity[]>();

    const backtrack = (index: number): boolean => {
      steps++;
      if (steps > stepLimit) {
        return false; // Terminate gracefully
      }

      if (index >= expandedSessions.length) {
        return true; // All assigned successfully
      }

      if (currentAssignment.size > bestPartial.size) {
        bestPartial = new Map(currentAssignment);
      }

      const item = expandedSessions[index];
      const s = item.session;
      const duration = s.duration_slots || 1;

      // Filter rooms matching subject requirements
      const candidateRooms = availableRooms.filter((r) => {
        if (s.room_id && r.room_id === s.room_id) return true;
        if (s.session_type === 'Lab') return r.type === 'Laboratory';
        return r.type === 'Lecture Hall' || r.type === 'Seminar Room';
      });

      // 1. Check existing frequency of this session on each day (to enforce even weekly spread)
      const dayFrequency = new Map<string, number>();
      for (const assignedEntries of Array.from(currentAssignment.values())) {
        if (assignedEntries.length > 0 && assignedEntries[0].session_id === s.session_id) {
          const entrySlot = db.timeSlots.get(assignedEntries[0].slot_id);
          if (entrySlot) {
            dayFrequency.set(entrySlot.day, (dayFrequency.get(entrySlot.day) || 0) + 1);
          }
        }
      }

      // 2. Check if a candidate slot causes >= 3 consecutive hours for any batch in same block
      const wouldCauseConsecutiveOverload = (slot: TimeSlotEntity): boolean => {
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
          for (let o = 0; o < duration; o++) {
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

      // Filter and prioritize slots: Even daily spread -> No >2 consecutive hours -> Earliest deterministic
      const candidateSlots = availableSlots
        .filter((slot) => {
          if (slot.period_no + duration - 1 > maxPeriod) return false;
          if (slot.period_no <= 4 && slot.period_no + duration - 1 >= 5) return false; // Lunch break barrier
          return true;
        })
        .sort((a, b) => {
          const dayCountA = dayFrequency.get(a.day) || 0;
          const dayCountB = dayFrequency.get(b.day) || 0;
          if (dayCountA !== dayCountB) return dayCountA - dayCountB;

          const overloadA = wouldCauseConsecutiveOverload(a) ? 1 : 0;
          const overloadB = wouldCauseConsecutiveOverload(b) ? 1 : 0;
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

      return false;
    };

    const solved = backtrack(0);
    const finalAssignment = solved ? currentAssignment : bestPartial;

    // Ensure database stores final chosen assignments
    db.timetableEntries.clear();
    const finalEntriesList: TimetableEntryEntity[] = [];
    finalAssignment.forEach((entries) => {
      entries.forEach((e) => {
        db.timetableEntries.set(e.entry_id, e);
        finalEntriesList.push(e);
      });
    });

    const unplacedSessions: { sessionId: string; subjectName: string; reason: string }[] = [];
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
      totalSessions: expandedSessions.length,
      unplacedSessions,
      runtimeMs: Date.now() - startTime,
      entries: finalEntriesList,
    };
  }
}


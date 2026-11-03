// =============================================================================
// VJTI Time Table Management System (TTMS)
// ConstraintChecker: Unified Algorithm 2 (Hard & Soft Constraints)
// Reference: Assignment 7 Section 5.4 (Algorithm 2) & Table 4
// =============================================================================

import { db } from '../db';
import { ConflictDescriptor, TimetableEntryEntity, TimeSlotEntity } from '../types';

export interface PlacementCheckParams {
  timetableId: string;
  sessionId?: string;
  subjectId: string;
  facultyId: string;
  roomId: string;
  slotId: string;
  batchIds: string[];
  durationSlots?: number;
  excludeEntryId?: string;
}

export class ConstraintChecker {
  /**
   * Fast Boolean check used by the Backtracking Solver (Algorithm 1) and Drag-and-Drop
   */
  public static noClash(params: PlacementCheckParams): boolean {
    const conflicts = this.checkPlacementConflicts(params);
    return !conflicts.some((c) => c.severity === 'critical');
  }

  /**
   * Comprehensive conflict analyzer returning typed descriptors for UI & API feedback
   */
  public static checkPlacementConflicts(params: PlacementCheckParams): ConflictDescriptor[] {
    const {
      timetableId,
      facultyId,
      roomId,
      slotId,
      batchIds,
      durationSlots = 1,
      excludeEntryId,
      subjectId,
    } = params;

    const conflicts: ConflictDescriptor[] = [];
    const baseSlot = db.timeSlots.get(slotId);
    if (!baseSlot) {
      conflicts.push({
        type: 'INVALID_TIMESLOT',
        severity: 'critical',
        message: `Time slot ${slotId} does not exist in master dataset.`,
        slot_id: slotId,
        involved_entities: {},
      });
      return conflicts;
    }

    const room = db.rooms.get(roomId);
    const subject = db.subjects.get(subjectId);

    // Multi-period slot expansion (e.g. 2-hour lab)
    const spanSlots: TimeSlotEntity[] = [];
    for (let offset = 0; offset < durationSlots; offset++) {
      const periodNo = baseSlot.period_no + offset;
      if (periodNo > 7) {
        conflicts.push({
          type: 'INVALID_TIMESLOT',
          severity: 'critical',
          message: `Multi-period session extends beyond the 7 periods of the working day.`,
          slot_id: slotId,
          involved_entities: {},
        });
        return conflicts;
      }

      // Check lunch break crossing (VJTI Lunch is between Period 4 and Period 5)
      if (baseSlot.period_no <= 4 && periodNo >= 5) {
        conflicts.push({
          type: 'INVALID_TIMESLOT',
          severity: 'critical',
          message: `Multi-period session crosses the mandatory campus lunch break (13:15–14:00).`,
          slot_id: slotId,
          involved_entities: {},
        });
        return conflicts;
      }

      const slot = offset === 0 ? baseSlot : Array.from(db.timeSlots.values()).find(
        (ts) => ts.day === baseSlot.day && ts.period_no === periodNo
      );
      if (!slot) {
        conflicts.push({
          type: 'INVALID_TIMESLOT',
          severity: 'critical',
          message: `Missing slot definition for Day ${baseSlot.day} Period ${periodNo}.`,
          slot_id: slotId,
          involved_entities: {},
        });
        return conflicts;
      }
      spanSlots.push(slot);
    }

    // 1. Room Capacity Deficit Check
    if (room) {
      let totalStrength = 0;
      batchIds.forEach((bid) => {
        const b = db.batches.get(bid);
        if (b) totalStrength += b.strength;
      });

      if (totalStrength > room.capacity) {
        conflicts.push({
          type: 'ROOM_CAPACITY_DEFICIT',
          severity: 'critical',
          message: `Combined batch strength (${totalStrength} students) exceeds room ${room.room_no} capacity (${room.capacity}).`,
          slot_id: slotId,
          involved_entities: { room_id: roomId, batch_ids: batchIds },
        });
      }
    }

    // 2. Room Type Mismatch Check
    if (room && subject) {
      if (subject.requires_lab && room.type !== 'Laboratory') {
        conflicts.push({
          type: 'ROOM_TYPE_MISMATCH',
          severity: 'critical',
          message: `Practical subject "${subject.name}" requires a Laboratory, but room ${room.room_no} is a ${room.type}.`,
          slot_id: slotId,
          involved_entities: { room_id: roomId },
        });
      }
    }

    // Check each period in the span for hard clashes
    for (const slot of spanSlots) {
      // 3. Faculty Unavailability
      let unavail = db.facultyAvailability.get(`${facultyId}_${slot.slot_id}`);
      if (!unavail) {
        unavail = Array.from(db.facultyAvailability.values()).find((fa) => {
          if (fa.faculty_id !== facultyId) return false;
          const s = db.timeSlots.get(fa.slot_id);
          return s && s.day === slot.day && s.period_no === slot.period_no;
        });
      }
      if (unavail && !unavail.is_available) {
        const fac = db.faculty.get(facultyId);
        conflicts.push({
          type: 'FACULTY_UNAVAILABLE',
          severity: 'critical',
          message: `Faculty ${fac?.name || facultyId} is marked unavailable on ${slot.day} Period ${slot.period_no}.`,
          slot_id: slot.slot_id,
          involved_entities: { faculty_id: facultyId },
        });
      }

      // Check against current timetable entries
      for (const entry of Array.from(db.timetableEntries.values())) {
        if (entry.timetable_id !== timetableId) continue;
        if (excludeEntryId && entry.entry_id === excludeEntryId) continue;

        const entrySlot = db.timeSlots.get(entry.slot_id);
        const isSameTime =
          entry.slot_id === slot.slot_id ||
          (entrySlot && entrySlot.day === slot.day && entrySlot.period_no === slot.period_no);

        if (isSameTime) {
          // 4. Faculty Collision (uq_faculty_slot)
          if (entry.faculty_id === facultyId) {
            const fac = db.faculty.get(facultyId);
            conflicts.push({
              type: 'FACULTY_DOUBLE_BOOKED',
              severity: 'critical',
              message: `Faculty ${fac?.name || facultyId} is already scheduled for session ${entry.session_id} on ${slot.day} Period ${slot.period_no}.`,
              slot_id: slot.slot_id,
              entry_ids: [entry.entry_id],
              involved_entities: { faculty_id: facultyId },
            });
          }

          // 5. Room Collision (uq_room_slot)
          if (entry.room_id === roomId) {
            const r = db.rooms.get(roomId);
            conflicts.push({
              type: 'ROOM_DOUBLE_BOOKED',
              severity: 'critical',
              message: `Room ${r?.room_no || roomId} is already booked on ${slot.day} Period ${slot.period_no} for session ${entry.session_id}.`,
              slot_id: slot.slot_id,
              entry_ids: [entry.entry_id],
              involved_entities: { room_id: roomId },
            });
          }

          // 6. Batch Collision (uq_batch_slot)
          const clashingBatches = entry.batch_ids.filter((bid) => batchIds.includes(bid));
          if (clashingBatches.length > 0) {
            const batchNames = clashingBatches.map((bid) => db.batches.get(bid)?.division || bid).join(', ');
            conflicts.push({
              type: 'BATCH_DOUBLE_BOOKED',
              severity: 'critical',
              message: `Batch (${batchNames}) already has session ${entry.session_id} on ${slot.day} Period ${slot.period_no}.`,
              slot_id: slot.slot_id,
              entry_ids: [entry.entry_id],
              involved_entities: { batch_ids: clashingBatches },
            });
          }
        }
      }
    }

    return conflicts;
  }

  /**
   * Complete timetable integrity verification for publication gate (FSM Transition)
   */
  public static validateTimetable(timetableId: string): ConflictDescriptor[] {
    const conflicts: ConflictDescriptor[] = [];
    const entries = Array.from(db.timetableEntries.values()).filter((e) => e.timetable_id === timetableId);

    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        const e1 = entries[i];
        const e2 = entries[j];

        if (e1.slot_id === e2.slot_id) {
          if (e1.room_id === e2.room_id) {
            conflicts.push({
              type: 'ROOM_DOUBLE_BOOKED',
              severity: 'critical',
              message: `Duplicate room assignment for ${e1.room_id} at slot ${e1.slot_id}.`,
              slot_id: e1.slot_id,
              entry_ids: [e1.entry_id, e2.entry_id],
              involved_entities: { room_id: e1.room_id },
            });
          }

          if (e1.faculty_id === e2.faculty_id) {
            conflicts.push({
              type: 'FACULTY_DOUBLE_BOOKED',
              severity: 'critical',
              message: `Faculty ${e1.faculty_id} double-booked at slot ${e1.slot_id}.`,
              slot_id: e1.slot_id,
              entry_ids: [e1.entry_id, e2.entry_id],
              involved_entities: { faculty_id: e1.faculty_id },
            });
          }

          const clashingBatches = e1.batch_ids.filter((b) => e2.batch_ids.includes(b));
          if (clashingBatches.length > 0) {
            conflicts.push({
              type: 'BATCH_DOUBLE_BOOKED',
              severity: 'critical',
              message: `Batch collision for ${clashingBatches.join(', ')} at slot ${e1.slot_id}.`,
              slot_id: e1.slot_id,
              entry_ids: [e1.entry_id, e2.entry_id],
              involved_entities: { batch_ids: clashingBatches },
            });
          }
        }
      }
    }

    return conflicts;
  }
}


// =============================================================================
// VJTI Time Table Management System (TTMS)
// Quality Assurance Automated Test Suite (TC-01 to TC-12)
// Reference: Assignment 7 Section 1.3, 2.5, 3.7, 5.7 & SQA Plan A5
// =============================================================================

import test, { describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { db } from '../src/server/db';
import { MasterDataService } from '../src/server/services/MasterDataService';
import { ConstraintChecker } from '../src/server/services/ConstraintChecker';
import { GenerationService } from '../src/server/services/GenerationService';
import { SubstitutionService } from '../src/server/services/SubstitutionService';
import { TimetableService } from '../src/server/services/TimetableService';
import { WorkloadService } from '../src/server/services/WorkloadService';

describe('VJTI TTMS Quality Assurance Test Suite (TC-01 to TC-12)', () => {
  beforeEach(() => {
    db.reset();
  });

  // TC-01: Valid Master Data CRUD
  test('TC-01: should successfully create, retrieve, and query master data entities', () => {
    const facultyCountBefore = MasterDataService.getAllFaculty().length;
    const newFaculty = MasterDataService.createFaculty({
      department_id: 'dept-ce',
      name: 'Dr. Test Professor',
      email: 'test_prof@vjti.ac.in',
      max_weekly_load: 14,
    });

    assert.ok(newFaculty.faculty_id.startsWith('FAC-'));
    assert.equal(MasterDataService.getAllFaculty().length, facultyCountBefore + 1);

    const roomCountBefore = MasterDataService.getAllRooms().length;
    const newRoom = MasterDataService.createRoom({
      room_no: 'Test Lab 301',
      capacity: 35,
      type: 'Laboratory',
    });

    assert.ok(newRoom.room_id.startsWith('RM-'));
    assert.equal(MasterDataService.getAllRooms().length, roomCountBefore + 1);
  });

  // TC-02: Referential Integrity (ON DELETE RESTRICT)
  test('TC-02: should block deletion of rooms and faculty actively referenced in timetable entries (ON DELETE RESTRICT)', () => {
    // RM-001 is referenced in ENTRY-1
    assert.throws(
      () => {
        MasterDataService.deleteRoom('RM-001');
      },
      (err: any) => {
        return err.message.includes('ON DELETE RESTRICT');
      }
    );

    // FAC-001 is referenced in ENTRY-1 and SESS-101
    assert.throws(
      () => {
        MasterDataService.deleteFaculty('FAC-001');
      },
      (err: any) => {
        return err.message.includes('ON DELETE RESTRICT');
      }
    );
  });

  // TC-03: Solver Determinism
  test('TC-03: should deterministically produce identical schedules on repeated solver runs with identical inputs', () => {
    const run1 = GenerationService.generate({ timetableId: 'TT-2026-ODD', stepLimit: 50000 });
    const run1Signatures = run1.entries.map((e) => `${e.session_id}_${e.slot_id}_${e.room_id}`).sort();

    db.reset();

    const run2 = GenerationService.generate({ timetableId: 'TT-2026-ODD', stepLimit: 50000 });
    const run2Signatures = run2.entries.map((e) => `${e.session_id}_${e.slot_id}_${e.room_id}`).sort();

    assert.deepEqual(run1Signatures, run2Signatures);
  });

  // TC-04: Impossible Constraints Graceful Exit & bestPartial
  test('TC-04: should terminate gracefully and report unplaced sessions under impossible constraints', () => {
    // Add an impossible session that requires 10 periods per day when max is 7
    db.sessions.set('SESS-IMPOSSIBLE', {
      session_id: 'SESS-IMPOSSIBLE',
      timetable_id: 'TT-2026-ODD',
      subject_id: 'SUB-001',
      faculty_id: 'FAC-001',
      session_type: 'Lab',
      duration_slots: 8, // Exceeds max 7 periods
      weekly_frequency: 1,
      batch_ids: ['BATCH-001'],
    });

    const result = GenerationService.generate({
      timetableId: 'TT-2026-ODD',
      stepLimit: 1000,
    });

    assert.equal(result.success, false);
    assert.ok(result.unplacedSessions.length > 0);
    assert.ok(result.unplacedSessions.some((u) => u.sessionId === 'SESS-IMPOSSIBLE'));
  });

  // TC-05: Faculty Double-Booking (uq_faculty_slot)
  test('TC-05: should detect faculty double-booking collisions (UNIQUE timetable_id, faculty_id, slot_id)', () => {
    // FAC-001 is already at SLOT-1 in ENTRY-1
    const conflicts = ConstraintChecker.checkPlacementConflicts({
      timetableId: 'TT-2026-ODD',
      subjectId: 'SUB-002',
      facultyId: 'FAC-001',
      roomId: 'RM-002',
      slotId: 'SLOT-1',
      batchIds: ['BATCH-002'],
    });

    assert.ok(conflicts.some((c) => c.type === 'FACULTY_DOUBLE_BOOKED'));
  });

  // TC-06: Room Double-Booking (uq_room_slot)
  test('TC-06: should detect room double-booking collisions (UNIQUE timetable_id, room_id, slot_id)', () => {
    // RM-001 is already at SLOT-1 in ENTRY-1
    const conflicts = ConstraintChecker.checkPlacementConflicts({
      timetableId: 'TT-2026-ODD',
      subjectId: 'SUB-002',
      facultyId: 'FAC-002',
      roomId: 'RM-001',
      slotId: 'SLOT-1',
      batchIds: ['BATCH-002'],
    });

    assert.ok(conflicts.some((c) => c.type === 'ROOM_DOUBLE_BOOKED'));
  });

  // TC-07: Batch Double-Booking & Room Capacity Deficit
  test('TC-07: should detect batch collisions and room capacity deficit', () => {
    // BATCH-001 is already at SLOT-1 in ENTRY-1
    const batchClash = ConstraintChecker.checkPlacementConflicts({
      timetableId: 'TT-2026-ODD',
      subjectId: 'SUB-003',
      facultyId: 'FAC-003',
      roomId: 'RM-003',
      slotId: 'SLOT-1',
      batchIds: ['BATCH-001'],
    });
    assert.ok(batchClash.some((c) => c.type === 'BATCH_DOUBLE_BOOKED'));

    // Combined strength of BATCH-001 (72) + BATCH-002 (70) = 142 > RM-001 (80)
    const capacityClash = ConstraintChecker.checkPlacementConflicts({
      timetableId: 'TT-2026-ODD',
      subjectId: 'SUB-001',
      facultyId: 'FAC-004',
      roomId: 'RM-001', // capacity 80
      slotId: 'SLOT-15',
      batchIds: ['BATCH-001', 'BATCH-002'],
    });
    assert.ok(capacityClash.some((c) => c.type === 'ROOM_CAPACITY_DEFICIT'));
  });

  // TC-08: Multi-Period Across Lunch Break or End of Day
  test('TC-08: should reject multi-period sessions that cross lunch breaks or exceed day periods', () => {
    // Period 4 is 12:15-13:15, lunch is between P4 and P5. A 2-slot session starting at P4 crosses lunch.
    const lunchClash = ConstraintChecker.checkPlacementConflicts({
      timetableId: 'TT-2026-ODD',
      subjectId: 'SUB-004',
      facultyId: 'FAC-001',
      roomId: 'RM-004',
      slotId: 'SLOT-4', // Mon P4
      durationSlots: 2,
      batchIds: ['BATCH-001'],
    });
    assert.ok(lunchClash.some((c) => c.type === 'INVALID_TIMESLOT'));

    // A 2-slot session starting at Period 7 overflows day
    const overflowClash = ConstraintChecker.checkPlacementConflicts({
      timetableId: 'TT-2026-ODD',
      subjectId: 'SUB-004',
      facultyId: 'FAC-001',
      roomId: 'RM-004',
      slotId: 'SLOT-7', // Mon P7
      durationSlots: 2,
      batchIds: ['BATCH-001'],
    });
    assert.ok(overflowClash.some((c) => c.type === 'INVALID_TIMESLOT'));
  });

  // TC-09: Manual Move 409 Conflict Rejection
  test('TC-09: should reject manual moves that create conflicts and return false for 409 response', () => {
    // Attempt to move ENTRY-2 (Mon P2) into SLOT-1 (Mon P1) where ENTRY-1 already books RM-001 and FAC-001
    const result = TimetableService.moveEntry({
      entryId: 'ENTRY-2',
      newSlotId: 'SLOT-1',
      newRoomId: 'RM-001', // Clashes with ENTRY-1
      userId: 'u-coord',
    });

    assert.equal(result.success, false);
    assert.ok(result.conflicts && result.conflicts.length > 0);
  });

  // TC-10: State Machine FSM Transitions & Publishing Gate
  test('TC-10: should enforce state machine transitions and block finalization if critical conflicts exist', () => {
    // Intentionally create a duplicate entry collision
    db.timetableEntries.set('ENTRY-CLASH', {
      entry_id: 'ENTRY-CLASH',
      timetable_id: 'TT-2026-ODD',
      session_id: 'SESS-102',
      slot_id: 'SLOT-1', // Clashes with ENTRY-1 room RM-001
      room_id: 'RM-001',
      faculty_id: 'FAC-002',
      batch_ids: ['BATCH-002'],
      created_at: new Date().toISOString(),
    });

    const pubResult = TimetableService.publishTimetable('TT-2026-ODD', 'u-coord');
    assert.equal(pubResult.success, false);
    assert.ok(pubResult.conflicts && pubResult.conflicts.length > 0);
  });

  // TC-11: Substitute Ranking by Ascending Load Ratio
  test('TC-11: should rank eligible substitute faculty by ascending load ratio', () => {
    const entry = db.timetableEntries.get('ENTRY-1')!;
    const candidates = SubstitutionService.suggestSubstitutes(entry);

    assert.ok(candidates.length > 0);
    // Verified: First candidate is free at slot
    assert.equal(candidates[0].isFreeAtSlot, true);
    // Candidates are sorted by expert priority and ascending load ratio
    for (let i = 0; i < candidates.length - 1; i++) {
      if (candidates[i].isSubjectExpert === candidates[i + 1].isSubjectExpert) {
        assert.ok(candidates[i].loadRatio <= candidates[i + 1].loadRatio);
      }
    }
  });

  // TC-12: Fallback Auto-Reschedule Proposal
  test('TC-12: should generate an automated reschedule fallback proposal when no substitute is free', () => {
    const entry = db.timetableEntries.get('ENTRY-1')!;

    // Mark all other faculty unavailable at this slot to force fallback
    Array.from(db.faculty.values()).forEach((f) => {
      db.facultyAvailability.set(`${f.faculty_id}_${entry.slot_id}`, {
        faculty_id: f.faculty_id,
        slot_id: entry.slot_id,
        is_available: false,
      });
    });

    const candidates = SubstitutionService.suggestSubstitutes(entry);
    assert.equal(candidates.length, 0);

    const proposal = SubstitutionService.findRescheduleSlot(entry);
    assert.ok(proposal !== null);
    assert.notEqual(proposal?.slot_id, entry.slot_id);
  });
});


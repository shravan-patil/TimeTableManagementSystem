// =============================================================================
// VJTI Time Table Management System (TTMS)
// White-Box Unit Testing Suite: Basis Path Testing Method
// References: Tom McCabe Cyclomatic Complexity & SQA Unit Testing Plan
// Includes: Primary Basis Paths (A1-A4, B1-B4, C1-C10, S1-S3)
// and Micro-Branch / Compound Condition Tests (A5-A6, B5, C11-C21, S4)
// =============================================================================

import test, { describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { db } from '../src/server/db';
import { AuthService } from '../src/server/services/AuthService';
import { ConstraintChecker } from '../src/server/services/ConstraintChecker';
import { TimetableService } from '../src/server/services/TimetableService';

describe('Basis Path Testing: Module 1 - Authentication Subsystem (AuthService.authenticate)', () => {
  beforeEach(() => {
    db.reset();
  });

  // Path A1: User does not exist in database -> returns null (Unauthorized)
  test('Path A1: Non-existent user email -> Unauthorized (null)', async () => {
    const result = await AuthService.authenticate('unknown_user@vjti.ac.in', 'vjti@2026');
    assert.strictEqual(result, null, 'Authentication must fail when email does not exist.');
  });

  // Path A2: User exists, but incorrect password -> returns null (Unauthorized)
  test('Path A2: Existent user with invalid password -> Unauthorized (null)', async () => {
    const result = await AuthService.authenticate('coordinator@vjti.ac.in', 'wrong_password_123');
    assert.strictEqual(result, null, 'Authentication must fail when password does not match.');
  });

  // Path A3: User exists, password valid, role is non-faculty (e.g. coordinator) -> Authorized, faculty_id is undefined
  test('Path A3: Authorized non-faculty user (Coordinator) -> Token and valid user payload without faculty_id', async () => {
    const result = await AuthService.authenticate('coordinator@vjti.ac.in', 'vjti@2026');
    assert.ok(result !== null, 'Coordinator should authenticate successfully.');
    assert.ok(result.token, 'A valid JWT token must be returned.');
    assert.strictEqual(result.user.email, 'coordinator@vjti.ac.in');
    assert.strictEqual(result.user.role, 'coordinator');
    assert.strictEqual(result.user.faculty_id, undefined, 'Coordinator user must not have a faculty_id.');
  });

  // Path A4: User exists, password valid, role is faculty -> Authorized, resolves matching faculty_id
  test('Path A4: Authorized faculty user -> Token and valid user payload with resolved faculty_id', async () => {
    const result = await AuthService.authenticate('pmchawan@ce.vjti.ac.in', 'vjti@2026');
    assert.ok(result !== null, 'Faculty member should authenticate successfully.');
    assert.ok(result.token, 'A valid JWT token must be returned.');
    assert.strictEqual(result.user.email, 'pmchawan@ce.vjti.ac.in');
    assert.strictEqual(result.user.role, 'faculty');
    assert.strictEqual(result.user.faculty_id, 'FAC-PMC', 'Faculty member must have their faculty_id resolved.');
  });

  // TC-BPT-A5: Faculty-role user with no matching faculty record -> if (fac) false
  test('TC-BPT-A5: Faculty-role user with no matching faculty record -> Token issued, faculty_id = undefined', async () => {
    db.users.set('u-orphan-faculty', {
      user_id: 'u-orphan-faculty',
      name: 'Unregistered Faculty',
      email: 'orphan_fac@vjti.ac.in',
      password_hash: '$2a$10$wN9aEaVbE.yF961o1F3nDeGkP0BlnRzI3aC2o.y1J5rYI06Xv8Mne',
      role: 'faculty',
      department_id: 'dept-ce',
      created_at: new Date().toISOString(),
    });

    const result = await AuthService.authenticate('orphan_fac@vjti.ac.in', 'vjti@2026');
    assert.ok(result !== null, 'Authentication should succeed for valid user.');
    assert.ok(result.token);
    assert.strictEqual(result.user.role, 'faculty');
    assert.strictEqual(result.user.faculty_id, undefined, 'faculty_id must be undefined when no faculty record matches.');
  });

  // TC-BPT-A6: Faculty user matched by email only, not user_id -> covers (f.user_id === user.user_id || f.email === user.email)
  test('TC-BPT-A6: Faculty user matched by email only, not user_id -> Token with resolved faculty_id', async () => {
    // User ID is arbitrary and does NOT match 'u-pmc', but email matches FAC-PMC's email
    db.users.set('u-custom-id-999', {
      user_id: 'u-custom-id-999',
      name: 'Prof. P. M. Chawan',
      email: 'pmchawan@ce.vjti.ac.in',
      password_hash: '$2a$10$wN9aEaVbE.yF961o1F3nDeGkP0BlnRzI3aC2o.y1J5rYI06Xv8Mne',
      role: 'faculty',
      department_id: 'dept-ce',
      created_at: new Date().toISOString(),
    });

    const result = await AuthService.authenticate('pmchawan@ce.vjti.ac.in', 'vjti@2026');
    assert.ok(result !== null);
    assert.strictEqual(result.user.faculty_id, 'FAC-PMC', 'Faculty must match via email fallback in OR expression.');
  });
});

describe('Basis Path Testing: Module 1B - Access Authorization (AuthService.authorize)', () => {
  beforeEach(() => {
    db.reset();
  });

  // Path B1: Missing / null / empty token header -> returns null
  test('Path B1: Null or empty Authorization header -> returns null', () => {
    const result = AuthService.authorize(['coordinator', 'admin'], null);
    assert.strictEqual(result, null, 'Missing token header must be rejected.');
  });

  // Path B2: Tampered or invalid JWT token string -> returns null
  test('Path B2: Tampered / malformed token string -> returns null', () => {
    const result = AuthService.authorize(['coordinator'], 'Bearer invalid.tampered.jwttoken');
    assert.strictEqual(result, null, 'Invalid or expired token must be rejected.');
  });

  // Path B3: Valid token, but user role is not permitted (Unauthorized role access) -> returns null
  test('Path B3: Valid token with unauthorized role (e.g. faculty accessing coordinator route) -> returns null', async () => {
    const authRes = await AuthService.authenticate('pmchawan@ce.vjti.ac.in', 'vjti@2026');
    assert.ok(authRes !== null);

    // Faculty attempts to access administrative route restricted to coordinator/admin
    const authorized = AuthService.authorize(['coordinator', 'admin'], `Bearer ${authRes.token}`);
    assert.strictEqual(authorized, null, 'Faculty role must not be permitted on administrative routes.');
  });

  // Path B4: Valid token with authorized role -> returns decoded user payload
  test('Path B4: Valid token with authorized role -> returns decoded payload', async () => {
    const authRes = await AuthService.authenticate('coordinator@vjti.ac.in', 'vjti@2026');
    assert.ok(authRes !== null);

    const authorized = AuthService.authorize(['coordinator', 'admin'], `Bearer ${authRes.token}`);
    assert.ok(authorized !== null, 'Coordinator should be successfully authorized.');
    assert.strictEqual(authorized.role, 'coordinator');
    assert.strictEqual(authorized.email, 'coordinator@vjti.ac.in');
  });

  // TC-BPT-B5: Valid token passed without the 'Bearer ' prefix -> ternary false branch
  test('TC-BPT-B5: Valid token passed without "Bearer " prefix -> Decoded payload returned', async () => {
    const authRes = await AuthService.authenticate('coordinator@vjti.ac.in', 'vjti@2026');
    assert.ok(authRes !== null);

    // Pass bare raw token without 'Bearer ' prefix
    const bareToken = authRes.token;
    const authorized = AuthService.authorize(['coordinator', 'admin'], bareToken);
    assert.ok(authorized !== null, 'Bare token without Bearer prefix must be successfully authorized.');
    assert.strictEqual(authorized.email, 'coordinator@vjti.ac.in');
  });
});

describe('Basis Path Testing: Module 2 - Constraint Validation Engine (ConstraintChecker)', () => {
  beforeEach(() => {
    db.reset();
  });

  // Path C1: Slot ID does not exist in master dataset
  test('Path C1: Invalid slot ID -> INVALID_TIMESLOT', () => {
    const conflicts = ConstraintChecker.checkPlacementConflicts({
      timetableId: 'TT-2026-ODD',
      subjectId: 'SUB-001',
      facultyId: 'FAC-001',
      roomId: 'RM-001',
      slotId: 'SLOT-NON-EXISTENT',
      batchIds: ['BATCH-001'],
      durationSlots: 1,
    });
    assert.ok(conflicts.some((c) => c.type === 'INVALID_TIMESLOT'));
  });

  // Path C2: Multi-period session extending past period 7 of the working day
  test('Path C2: Multi-period session exceeding day limit (Period > 7) -> INVALID_TIMESLOT', () => {
    const conflicts = ConstraintChecker.checkPlacementConflicts({
      timetableId: 'TT-2026-ODD',
      subjectId: 'SUB-001',
      facultyId: 'FAC-001',
      roomId: 'RM-001',
      slotId: 'SLOT-MON-7',
      batchIds: ['BATCH-001'],
      durationSlots: 2, // Period 7 + 1 = 8 (> 7)
    });
    assert.ok(conflicts.some((c) => c.type === 'INVALID_TIMESLOT' && c.message.includes('7 periods')));
  });

  // Path C3: Multi-period session crossing campus lunch recess (Period 4 -> Period 5)
  test('Path C3: Multi-period session crossing lunch recess barrier -> INVALID_TIMESLOT', () => {
    const conflicts = ConstraintChecker.checkPlacementConflicts({
      timetableId: 'TT-2026-ODD',
      subjectId: 'SUB-001',
      facultyId: 'FAC-001',
      roomId: 'RM-001',
      slotId: 'SLOT-MON-4',
      batchIds: ['BATCH-001'],
      durationSlots: 2, // Period 4 to 5 crosses lunch break
    });
    assert.ok(conflicts.some((c) => c.type === 'INVALID_TIMESLOT' && c.message.includes('lunch break')));
  });

  // Path C4: Student batch strength exceeds assigned room capacity
  test('Path C4: Student batch count exceeds room capacity -> ROOM_CAPACITY_DEFICIT', () => {
    // RM-004 is Lab 1A with capacity 40. BATCH-BTECH-CE has strength 75.
    const conflicts = ConstraintChecker.checkPlacementConflicts({
      timetableId: 'TT-2026-ODD',
      subjectId: 'SUB-001',
      facultyId: 'FAC-001',
      roomId: 'RM-004',
      slotId: 'SLOT-FRI-6',
      batchIds: ['BATCH-BTECH-CE'], // 75 students > 40 capacity
      durationSlots: 1,
    });
    assert.ok(conflicts.some((c) => c.type === 'ROOM_CAPACITY_DEFICIT'));
  });

  // Path C5: Practical laboratory subject assigned to general lecture hall
  test('Path C5: Lab subject in non-laboratory room -> ROOM_TYPE_MISMATCH', () => {
    // SUB-004 requires_lab = true; RM-001 is a Lecture Hall
    const conflicts = ConstraintChecker.checkPlacementConflicts({
      timetableId: 'TT-2026-ODD',
      subjectId: 'SUB-004',
      facultyId: 'FAC-001',
      roomId: 'RM-001',
      slotId: 'SLOT-FRI-6',
      batchIds: ['BATCH-001'],
      durationSlots: 1,
    });
    assert.ok(conflicts.some((c) => c.type === 'ROOM_TYPE_MISMATCH'));
  });

  // Path C6: Faculty marked unavailable at specified time slot
  test('Path C6: Faculty unavailable on specified slot -> FACULTY_UNAVAILABLE', () => {
    // Mark FAC-001 unavailable on SLOT-FRI-6
    db.facultyAvailability.set('FAC-001_SLOT-FRI-6', {
      availability_id: 'FA-TEST-01',
      faculty_id: 'FAC-001',
      slot_id: 'SLOT-FRI-6',
      is_available: false,
    });

    const conflicts = ConstraintChecker.checkPlacementConflicts({
      timetableId: 'TT-2026-ODD',
      subjectId: 'SUB-001',
      facultyId: 'FAC-001',
      roomId: 'RM-001',
      slotId: 'SLOT-FRI-6',
      batchIds: ['BATCH-001'],
      durationSlots: 1,
    });
    assert.ok(conflicts.some((c) => c.type === 'FACULTY_UNAVAILABLE'));
  });

  // Path C7: Faculty double-booking collision
  test('Path C7: Faculty already teaching another class at that slot -> FACULTY_DOUBLE_BOOKED', () => {
    // FAC-001 is already teaching in ENTRY-1 at SLOT-1 (Mon P1 / SLOT-MON-1)
    const conflicts = ConstraintChecker.checkPlacementConflicts({
      timetableId: 'TT-2026-ODD',
      subjectId: 'SUB-002',
      facultyId: 'FAC-001',
      roomId: 'RM-002',
      slotId: 'SLOT-1',
      batchIds: ['BATCH-002'],
      durationSlots: 1,
    });
    assert.ok(conflicts.some((c) => c.type === 'FACULTY_DOUBLE_BOOKED'));
  });

  // Path C8: Room double-booking collision
  test('Path C8: Room already booked by another class at that slot -> ROOM_DOUBLE_BOOKED', () => {
    // RM-001 is already booked in ENTRY-1 at SLOT-1
    const conflicts = ConstraintChecker.checkPlacementConflicts({
      timetableId: 'TT-2026-ODD',
      subjectId: 'SUB-002',
      facultyId: 'FAC-002',
      roomId: 'RM-001',
      slotId: 'SLOT-1',
      batchIds: ['BATCH-002'],
      durationSlots: 1,
    });
    assert.ok(conflicts.some((c) => c.type === 'ROOM_DOUBLE_BOOKED'));
  });

  // Path C9: Student batch double-booking collision
  test('Path C9: Student batch already scheduled for another class -> BATCH_DOUBLE_BOOKED', () => {
    // BATCH-001 is already occupied in ENTRY-1 at SLOT-1
    const conflicts = ConstraintChecker.checkPlacementConflicts({
      timetableId: 'TT-2026-ODD',
      subjectId: 'SUB-003',
      facultyId: 'FAC-003',
      roomId: 'RM-003',
      slotId: 'SLOT-1',
      batchIds: ['BATCH-001'],
      durationSlots: 1,
    });
    assert.ok(conflicts.some((c) => c.type === 'BATCH_DOUBLE_BOOKED'));
  });

  // Path C10: Clean placement satisfying all constraints -> 0 conflicts
  test('Path C10: Clean valid placement satisfying all constraints -> 0 conflicts', () => {
    const conflicts = ConstraintChecker.checkPlacementConflicts({
      timetableId: 'TT-2026-ODD',
      subjectId: 'SUB-001',
      facultyId: 'FAC-001',
      roomId: 'RM-001',
      slotId: 'SLOT-FRI-6',
      batchIds: ['BATCH-001'],
      durationSlots: 1,
    });
    assert.strictEqual(conflicts.length, 0, 'Clean placement should yield zero conflicts.');
    assert.strictEqual(
      ConstraintChecker.noClash({
        timetableId: 'TT-2026-ODD',
        subjectId: 'SUB-001',
        facultyId: 'FAC-001',
        roomId: 'RM-001',
        slotId: 'SLOT-FRI-6',
        batchIds: ['BATCH-001'],
        durationSlots: 1,
      }),
      true
    );
  });

  // TC-BPT-C11: SLOT-TUE-1, dur: 2, valid room and batch -> covers ternary false (offset > 0)
  test('TC-BPT-C11: Multi-period valid placement (SLOT-TUE-1, dur: 2) -> []', () => {
    const conflicts = ConstraintChecker.checkPlacementConflicts({
      timetableId: 'TT-2026-ODD',
      subjectId: 'SUB-001',
      facultyId: 'FAC-PMC',
      roomId: 'RM-001',
      slotId: 'SLOT-TUE-1',
      batchIds: ['BATCH-001'],
      durationSlots: 2,
    });
    assert.strictEqual(conflicts.length, 0, 'Clean 2-period placement should yield zero conflicts.');
  });

  // TC-BPT-C12: Two-period span whose second slot is missing from the store -> covers !slot true
  test('TC-BPT-C12: Multi-period span with missing subsequent slot definition -> INVALID_TIMESLOT', () => {
    // Delete all slot definitions matching Tuesday Period 2 (both SLOT-TUE-2 and alias SLOT-9)
    Array.from(db.timeSlots.entries()).forEach(([id, ts]) => {
      if (ts.day === 'Tue' && ts.period_no === 2) db.timeSlots.delete(id);
    });

    const conflicts = ConstraintChecker.checkPlacementConflicts({
      timetableId: 'TT-2026-ODD',
      subjectId: 'SUB-001',
      facultyId: 'FAC-PMC',
      roomId: 'RM-001',
      slotId: 'SLOT-TUE-1',
      batchIds: ['BATCH-001'],
      durationSlots: 2,
    });

    assert.ok(conflicts.some((c) => c.type === 'INVALID_TIMESLOT' && c.message.includes('Missing slot definition')));
  });

  // TC-BPT-C13: SLOT-TUE-4, dur: 1 -> Period 4 alone, lunch && (first true, second false)
  test('TC-BPT-C13: Single-period morning slot 4 alone (SLOT-TUE-4, dur: 1) -> []', () => {
    const conflicts = ConstraintChecker.checkPlacementConflicts({
      timetableId: 'TT-2026-ODD',
      subjectId: 'SUB-001',
      facultyId: 'FAC-PMC',
      roomId: 'RM-001',
      slotId: 'SLOT-TUE-4',
      batchIds: ['BATCH-001'],
      durationSlots: 1,
    });
    assert.strictEqual(conflicts.length, 0, 'Period 4 alone does not cross lunch break.');
  });

  // TC-BPT-C14: SLOT-TUE-5, dur: 2 -> Afternoon slot, lunch && (first operand false)
  test('TC-BPT-C14: Afternoon session starting at Period 5 (SLOT-TUE-5, dur: 2) -> []', () => {
    const conflicts = ConstraintChecker.checkPlacementConflicts({
      timetableId: 'TT-2026-ODD',
      subjectId: 'SUB-001',
      facultyId: 'FAC-PMC',
      roomId: 'RM-001',
      slotId: 'SLOT-TUE-5',
      batchIds: ['BATCH-001'],
      durationSlots: 2,
    });
    assert.strictEqual(conflicts.length, 0, 'Afternoon session does not trigger lunch break crossing.');
  });

  // TC-BPT-C15: SLOT-TUE-6, dur: 2 -> Span ends exactly at period 7 (boundary of periodNo > 7)
  test('TC-BPT-C15: Span ending exactly at period 7 (SLOT-TUE-6, dur: 2) -> []', () => {
    const conflicts = ConstraintChecker.checkPlacementConflicts({
      timetableId: 'TT-2026-ODD',
      subjectId: 'SUB-001',
      facultyId: 'FAC-PMC',
      roomId: 'RM-001',
      slotId: 'SLOT-TUE-6',
      batchIds: ['BATCH-001'],
      durationSlots: 2,
    });
    assert.strictEqual(conflicts.length, 0, 'Session ending at period 7 is within valid day boundary.');
  });

  // TC-BPT-C16: Unknown roomId -> covers if (room) false
  test('TC-BPT-C16: Unknown roomId -> No capacity or type conflicts (if (room) false)', () => {
    const conflicts = ConstraintChecker.checkPlacementConflicts({
      timetableId: 'TT-2026-ODD',
      subjectId: 'SUB-001',
      facultyId: 'FAC-PMC',
      roomId: 'RM-UNKNOWN-999',
      slotId: 'SLOT-TUE-1',
      batchIds: ['BATCH-001'],
      durationSlots: 1,
    });
    assert.strictEqual(conflicts.length, 0, 'Unknown room gracefully skips room checks.');
  });

  // TC-BPT-C17: batchIds containing an unknown batch ID -> covers if (b) false
  test('TC-BPT-C17: Unknown batch ID in batchIds -> Counted as 0 strength, no error (if (b) false)', () => {
    const conflicts = ConstraintChecker.checkPlacementConflicts({
      timetableId: 'TT-2026-ODD',
      subjectId: 'SUB-001',
      facultyId: 'FAC-PMC',
      roomId: 'RM-001',
      slotId: 'SLOT-TUE-1',
      batchIds: ['BATCH-NON-EXISTENT'],
      durationSlots: 1,
    });
    assert.strictEqual(conflicts.length, 0, 'Unknown batch does not cause capacity deficit or crash.');
  });

  // TC-BPT-C18: Total strength equal to room capacity -> Boundary of > (no ROOM_CAPACITY_DEFICIT)
  test('TC-BPT-C18: Total strength exactly equal to room capacity -> No ROOM_CAPACITY_DEFICIT', () => {
    // Set a batch with strength exactly equal to RM-004 (capacity 40)
    db.batches.set('BATCH-EXACT-40', {
      batch_id: 'BATCH-EXACT-40',
      department_id: 'dept-ce',
      division: 'Div Exact 40',
      year: 3,
      strength: 40,
    });

    const conflicts = ConstraintChecker.checkPlacementConflicts({
      timetableId: 'TT-2026-ODD',
      subjectId: 'SUB-001',
      facultyId: 'FAC-PMC',
      roomId: 'RM-004', // capacity = 40
      slotId: 'SLOT-TUE-1',
      batchIds: ['BATCH-EXACT-40'],
      durationSlots: 1,
    });

    assert.ok(
      !conflicts.some((c) => c.type === 'ROOM_CAPACITY_DEFICIT'),
      'Strength equal to capacity must not trigger capacity deficit.'
    );
  });

  // TC-BPT-C19: Availability record with is_available: true -> unavail true, !is_available false
  test('TC-BPT-C19: Explicit availability record with is_available: true -> No FACULTY_UNAVAILABLE', () => {
    db.facultyAvailability.set('FAC-PMC_SLOT-TUE-1', {
      availability_id: 'FA-PMC-TUE1',
      faculty_id: 'FAC-PMC',
      slot_id: 'SLOT-TUE-1',
      is_available: true,
    });

    const conflicts = ConstraintChecker.checkPlacementConflicts({
      timetableId: 'TT-2026-ODD',
      subjectId: 'SUB-001',
      facultyId: 'FAC-PMC',
      roomId: 'RM-001',
      slotId: 'SLOT-TUE-1',
      batchIds: ['BATCH-001'],
      durationSlots: 1,
    });

    assert.ok(
      !conflicts.some((c) => c.type === 'FACULTY_UNAVAILABLE'),
      'Explicit is_available: true must not trigger unavailability conflict.'
    );
  });

  // TC-BPT-C20: Entries from another timetable, excludeEntryId, and different slot -> All ignored
  test('TC-BPT-C20: Non-matching timetable_id, excludeEntryId, and different slot -> All ignored, []', () => {
    // Entry in another timetable
    db.timetableEntries.set('OTHER-TT-ENTRY', {
      entry_id: 'OTHER-TT-ENTRY',
      timetable_id: 'TT-OTHER-999',
      session_id: 'SESS-101',
      slot_id: 'SLOT-TUE-1',
      room_id: 'RM-001',
      faculty_id: 'FAC-PMC',
      batch_ids: ['BATCH-001'],
      created_at: new Date().toISOString(),
    });

    // Excluded entry
    db.timetableEntries.set('SELF-EXCLUDE-ENTRY', {
      entry_id: 'SELF-EXCLUDE-ENTRY',
      timetable_id: 'TT-2026-ODD',
      session_id: 'SESS-101',
      slot_id: 'SLOT-TUE-1',
      room_id: 'RM-001',
      faculty_id: 'FAC-PMC',
      batch_ids: ['BATCH-001'],
      created_at: new Date().toISOString(),
    });

    const conflicts = ConstraintChecker.checkPlacementConflicts({
      timetableId: 'TT-2026-ODD',
      subjectId: 'SUB-001',
      facultyId: 'FAC-PMC',
      roomId: 'RM-001',
      slotId: 'SLOT-TUE-1',
      batchIds: ['BATCH-001'],
      durationSlots: 1,
      excludeEntryId: 'SELF-EXCLUDE-ENTRY',
    });

    assert.strictEqual(conflicts.length, 0, 'Excluded entry and foreign timetable entries must be ignored.');
  });

  // TC-BPT-C21: durationSlots: 0 -> zero loop iterations
  test('TC-BPT-C21: durationSlots: 0 -> Zero loop iterations, no collision scan, []', () => {
    const conflicts = ConstraintChecker.checkPlacementConflicts({
      timetableId: 'TT-2026-ODD',
      subjectId: 'SUB-001',
      facultyId: 'FAC-PMC',
      roomId: 'RM-001',
      slotId: 'SLOT-TUE-1',
      batchIds: ['BATCH-001'],
      durationSlots: 0,
    });

    assert.strictEqual(conflicts.length, 0, 'Zero duration slots results in empty conflict list.');
  });
});

describe('Basis Path Testing: Module 3 - Timetable State Machine & Publishing Gate', () => {
  beforeEach(() => {
    db.reset();
  });

  // Path S1: Timetable does not exist -> throws Error
  test('Path S1: Non-existent timetable ID -> Throws error', () => {
    assert.throws(
      () => {
        TimetableService.publishTimetable('TT-NON-EXISTENT', 'u-coord');
      },
      (err: any) => err.message.includes('not found')
    );
  });

  // Path S2: Timetable has critical conflict -> Publication blocked with conflicts returned
  test('Path S2: Timetable with critical conflicts -> Publication blocked (success: false)', () => {
    // Force a conflict by placing two entries into RM-001 at SLOT-FRI-1
    db.timetableEntries.set('COLLISION-1', {
      entry_id: 'COLLISION-1',
      timetable_id: 'TT-2026-ODD',
      session_id: 'SESS-101',
      slot_id: 'SLOT-FRI-1',
      room_id: 'RM-001',
      faculty_id: 'FAC-001',
      batch_ids: ['BATCH-001'],
      created_at: new Date().toISOString(),
    });
    db.timetableEntries.set('COLLISION-2', {
      entry_id: 'COLLISION-2',
      timetable_id: 'TT-2026-ODD',
      session_id: 'SESS-102',
      slot_id: 'SLOT-FRI-1',
      room_id: 'RM-001', // Duplicate room booking
      faculty_id: 'FAC-002',
      batch_ids: ['BATCH-002'],
      created_at: new Date().toISOString(),
    });

    const result = TimetableService.publishTimetable('TT-2026-ODD', 'u-coord');
    assert.strictEqual(result.success, false, 'Publication must be blocked when critical clashes exist.');
    assert.ok(result.conflicts && result.conflicts.length > 0);
  });

  // Path S3: Timetable in Draft state with zero conflicts -> Successfully transitions to Published
  test('Path S3: Clean timetable in Draft state -> Published successfully (success: true)', () => {
    // Ensure timetable is in Draft state with clean entries
    const tt = db.timetables.get('TT-2026-ODD');
    assert.ok(tt);
    tt.status = 'Draft';

    const result = TimetableService.publishTimetable('TT-2026-ODD', 'u-coord');
    assert.strictEqual(result.success, true, 'Clean timetable must publish successfully.');
    assert.strictEqual(result.timetable?.status, 'Published');
    assert.ok(result.timetable?.published_at);
  });

  // TC-BPT-S4: Timetable already 'Published', no clashes -> Idempotent publishing returns success: true
  test('TC-BPT-S4: Timetable already "Published" with zero clashes -> Returns success: true (Idempotent)', () => {
    const tt = db.timetables.get('TT-2026-ODD');
    assert.ok(tt);
    assert.strictEqual(tt.status, 'Published');

    const result = TimetableService.publishTimetable('TT-2026-ODD', 'u-coord');
    assert.strictEqual(result.success, true, 'Re-publishing an already clean published timetable must succeed.');
    assert.strictEqual(result.timetable?.status, 'Published');
  });
});

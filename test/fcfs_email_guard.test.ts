// =============================================================================
// VJTI Time Table Management System (TTMS)
// Test Suite: Email Sandbox Guard & FCFS Open Lecture Claim System
// =============================================================================

import test, { describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { db } from '../src/server/db';
import { EmailService, ALLOWED_REAL_EMAILS } from '../src/server/services/EmailService';
import { SubstitutionService } from '../src/server/services/SubstitutionService';
import { TimetableService } from '../src/server/services/TimetableService';
import { initialTimeSlots } from '../src/data/dummyData';

describe('Task 1 & Task 2: Email Sanitization & Sandbox Safety Guard', () => {
  beforeEach(() => {
    db.reset();
    EmailService.clearOutboxLogs();
  });

  test('Sandbox Guard: Whitelisted emails are permitted (SIMULATED / SENT)', async () => {
    const res = await EmailService.sendEmail({
      to: ['tanishparekh03@gmail.com', 'tanishparekh59@gmail.com'],
      subject: 'Test Whitelist Delivery',
      html: '<p>Test Whitelist</p>',
    });

    assert.strictEqual(res.sent.length, 2);
    assert.strictEqual(res.suppressed.length, 0);

    const logs = EmailService.getOutboxLogs();
    assert.strictEqual(logs.length, 2);
    assert.ok(logs.every((l) => l.status === 'SIMULATED' || l.status === 'SENT'));
  });

  test('Sandbox Guard: Dummy faculty emails (@dummy.ttms.local) are strictly suppressed', async () => {
    const res = await EmailService.sendEmail({
      to: ['vbnikam@dummy.ttms.local', 'coordinator@dummy.ttms.local', 'random_faculty@vjti.ac.in'],
      subject: 'Suppressed Alert',
      html: '<p>Should never send</p>',
    });

    assert.strictEqual(res.sent.length, 0);
    assert.strictEqual(res.suppressed.length, 3);

    const logs = EmailService.getOutboxLogs();
    assert.strictEqual(logs.length, 3);
    assert.ok(logs.every((l) => l.status === 'SANDBOX_SUPPRESSED'));
  });

  test('Automated Notifications: Timetable publish triggers broadcast with sandbox suppression', () => {
    EmailService.clearOutboxLogs();
    const result = TimetableService.publishTimetable('TT-2026-ODD', 'u-coord');
    assert.strictEqual(result.success, true);

    const logs = EmailService.getOutboxLogs();
    assert.ok(logs.length > 0, 'Outbox logs must record notification dispatches.');

    // Ensure real emails received simulation/sent
    const whitelistedLogs = logs.filter((l) => ALLOWED_REAL_EMAILS.has(l.to.toLowerCase()));
    assert.ok(whitelistedLogs.length >= 2, 'Both PMC faculty and Student should be targeted.');
    assert.ok(whitelistedLogs.every((l) => l.status === 'SIMULATED' || l.status === 'SENT'));

    // Ensure dummy addresses were suppressed
    const suppressedLogs = logs.filter((l) => l.to.endsWith('@dummy.ttms.local'));
    assert.ok(suppressedLogs.length > 0);
    assert.ok(suppressedLogs.every((l) => l.status === 'SANDBOX_SUPPRESSED'));
  });
});

describe('Task 3: First-Come, First-Served (FCFS) Open Claim System', () => {
  beforeEach(() => {
    db.reset();
    EmailService.clearOutboxLogs();
  });

  test('Leave reporting creates OPEN_FOR_CLAIM substitution opportunities', () => {
    const leaveAnalysis = SubstitutionService.reportLeave(
      'FAC-PMC',
      '2026-10-20',
      '2026-10-21',
      'IEEE Conference'
    );

    assert.ok(leaveAnalysis.leave);
    assert.strictEqual(leaveAnalysis.leave.status, 'Reported');

    const openSubs = SubstitutionService.getOpenSubstitutions('FAC-VBN');
    assert.ok(openSubs.length > 0, 'Open substitutions should be available on the board.');
    assert.strictEqual(openSubs[0].status, 'OPEN_FOR_CLAIM');
    assert.strictEqual(openSubs[0].original_faculty_id, 'FAC-PMC');
  });

  test('Atomic FCFS Claim: First faculty succeeds, second receives HTTP 409 Conflict', () => {
    SubstitutionService.reportLeave('FAC-PMC', '2026-10-20', '2026-10-21', 'Medical Leave');
    const openSubs = SubstitutionService.getOpenSubstitutions('FAC-VBN');
    assert.ok(openSubs.length > 0);

    const targetSub = openSubs[0];

    // First faculty (FAC-VBN) claims the lecture
    const firstClaim = SubstitutionService.claimOpenSubstitution({
      subId: targetSub.sub_id,
      facultyId: 'FAC-VBN',
    });

    assert.strictEqual(firstClaim.success, true);
    assert.strictEqual(firstClaim.status, 200);
    assert.strictEqual(firstClaim.substitution?.status, 'CLAIMED');
    assert.strictEqual(firstClaim.substitution?.substitute_faculty_id, 'FAC-VBN');

    // Second faculty (FAC-MRS) attempts to claim the same lecture concurrently
    const secondClaim = SubstitutionService.claimOpenSubstitution({
      subId: targetSub.sub_id,
      facultyId: 'FAC-MRS',
    });

    assert.strictEqual(secondClaim.success, false);
    assert.strictEqual(secondClaim.status, 409, 'Subsequent claim must return 409 Conflict.');
    assert.ok(secondClaim.error?.includes('already been claimed'));
  });

  test('FCFS Eligibility: Faculty cannot claim their own lecture while on leave', () => {
    SubstitutionService.reportLeave('FAC-PMC', '2026-10-20', '2026-10-21', 'Personal Duty');
    const openSubs = SubstitutionService.getOpenSubstitutions('FAC-PMC');
    assert.ok(openSubs.length > 0);

    // Should be marked as ineligible for the absent faculty
    assert.strictEqual(openSubs[0].is_eligible, false);
    assert.ok(openSubs[0].conflict_reason?.includes('own lecture'));

    const claimRes = SubstitutionService.claimOpenSubstitution({
      subId: openSubs[0].sub_id,
      facultyId: 'FAC-PMC',
    });

    assert.strictEqual(claimRes.success, false);
    assert.strictEqual(claimRes.status, 400);
  });
});

describe('Task 4: Time Slot Period Continuity & Alignment', () => {
  test('Period 6 is 13:30 - 14:25 and Period 7 is 14:30 - 15:25 in dummyData and db', () => {
    const p6 = initialTimeSlots.find((s) => s.Day === 'Mon' && s.Period_No === 6);
    const p7 = initialTimeSlots.find((s) => s.Day === 'Mon' && s.Period_No === 7);

    assert.ok(p6);
    assert.strictEqual(p6.Start_Time, '13:30');
    assert.strictEqual(p6.End_Time, '14:25');

    assert.ok(p7);
    assert.strictEqual(p7.Start_Time, '14:30');
    assert.strictEqual(p7.End_Time, '15:25');

    // Check in db.timeSlots
    const dbP6 = db.timeSlots.get('SLOT-MON-6');
    const dbP7 = db.timeSlots.get('SLOT-MON-7');

    assert.ok(dbP6);
    assert.strictEqual(dbP6.start_time, '13:30');
    assert.strictEqual(dbP6.end_time, '14:25');

    assert.ok(dbP7);
    assert.strictEqual(dbP7.start_time, '14:30');
    assert.strictEqual(dbP7.end_time, '15:25');
  });
});


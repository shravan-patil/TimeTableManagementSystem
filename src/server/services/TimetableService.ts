// =============================================================================
// VJTI Time Table Management System (TTMS)
// TimetableService: FSM State Machine, Manual Entry Moves (409 Rejection), Publishing
// Reference: Assignment 7 Section 3.4 & 4.5
// =============================================================================

import { db } from '../db';
import { ConstraintChecker } from './ConstraintChecker';
import { EmailService } from './EmailService';
import { TimetableEntity, TimetableEntryEntity, ConflictDescriptor } from '../types';

export class TimetableService {
  /**
   * Manual Entry Move / Edit with HTTP 409 Conflict rejection (TC-09)
   */
  public static moveEntry(params: {
    entryId: string;
    newSlotId: string;
    newRoomId?: string;
    userId: string;
    reason?: string;
  }): { success: boolean; entry?: TimetableEntryEntity; conflicts?: ConflictDescriptor[] } {
    const entry = db.timetableEntries.get(params.entryId);
    if (!entry) {
      throw new Error(`Timetable entry ${params.entryId} not found.`);
    }

    const sess = db.sessions.get(entry.session_id);
    if (!sess) {
      throw new Error(`Session ${entry.session_id} not found.`);
    }

    const targetRoomId = params.newRoomId || entry.room_id;

    // Check constraints before committing
    const checkParams = {
      timetableId: entry.timetable_id,
      sessionId: entry.session_id,
      subjectId: sess.subject_id,
      facultyId: entry.faculty_id,
      roomId: targetRoomId,
      slotId: params.newSlotId,
      batchIds: entry.batch_ids,
      excludeEntryId: entry.entry_id,
    };

    const conflicts = ConstraintChecker.checkPlacementConflicts(checkParams);
    const criticalConflicts = conflicts.filter((c) => c.severity === 'critical');

    if (criticalConflicts.length > 0) {
      return {
        success: false,
        conflicts: criticalConflicts,
      };
    }

    // Apply move
    const oldSlot = entry.slot_id;
    entry.slot_id = params.newSlotId;
    entry.room_id = targetRoomId;

    // Record change log
    const logId = `LOG-${Date.now()}`;
    db.changeLogs.set(logId, {
      log_id: logId,
      timetable_id: entry.timetable_id,
      change_type: 'Manual Edit',
      description: `Entry ${entry.entry_id} moved from slot ${oldSlot} to slot ${params.newSlotId} (Room: ${targetRoomId}).`,
      reason: params.reason || 'Manual timetable optimization',
      changed_by: params.userId,
      changed_on: new Date().toISOString(),
    });

    // Trigger automated notification email to affected students and faculty (Task 2)
    const oldSlotObj = db.timeSlots.get(oldSlot);
    const newSlotObj = db.timeSlots.get(params.newSlotId);
    const facultyObj = db.faculty.get(entry.faculty_id);
    const roomObj = db.rooms.get(targetRoomId);
    const subjectObj = db.subjects.get(sess.subject_id);
    const batchNames = entry.batch_ids
      .map((bId) => db.batches.get(bId)?.division || bId)
      .join(', ');

    const recipients = new Set<string>();
    recipients.add('tanishparekh59@gmail.com');
    if (facultyObj?.email) recipients.add(facultyObj.email);
    Array.from(db.users.values())
      .filter((u) => u.role === 'student' && (!u.department_id || u.department_id === facultyObj?.department_id))
      .forEach((u) => recipients.add(u.email));

    const subjectName = subjectObj?.name || sess.subject_id;
    const emailSubject = `[VJTI TTMS Alert] Timetable Updated for ${batchNames} - ${subjectName}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px;">
        <div style="background-color: #1e3a8a; color: white; padding: 12px 16px; border-radius: 6px; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 18px;">VJTI TTMS: Timetable Reschedule Alert</h2>
        </div>
        <p>Dear Faculty and Students,</p>
        <p>Please note that a timetable adjustment has been finalized for <strong>${batchNames}</strong>.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
          <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 8px; font-weight: bold; width: 35%;">Subject:</td>
            <td style="padding: 8px;">${subjectName} (${subjectObj?.code || 'N/A'})</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 8px; font-weight: bold;">Previous Slot:</td>
            <td style="padding: 8px; color: #dc2626;">${oldSlotObj?.day || ''} Period ${oldSlotObj?.period_no || ''} (${oldSlotObj?.start_time || ''} - ${oldSlotObj?.end_time || ''})</td>
          </tr>
          <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 8px; font-weight: bold;">New Slot:</td>
            <td style="padding: 8px; color: #16a34a; font-weight: bold;">${newSlotObj?.day || ''} Period ${newSlotObj?.period_no || ''} (${newSlotObj?.start_time || ''} - ${newSlotObj?.end_time || ''})</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 8px; font-weight: bold;">Room:</td>
            <td style="padding: 8px;">${roomObj?.room_no || targetRoomId}</td>
          </tr>
          <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 8px; font-weight: bold;">Faculty:</td>
            <td style="padding: 8px;">${facultyObj?.name || entry.faculty_id}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">Reason:</td>
            <td style="padding: 8px;">${params.reason || 'Manual timetable optimization'}</td>
          </tr>
        </table>
        <p style="margin-top: 16px; font-size: 13px; color: #64748b;">
          This is an automated system notification from VJTI TTMS.
        </p>
      </div>
    `;

    void EmailService.sendEmail({
      to: Array.from(recipients),
      subject: emailSubject,
      html: emailHtml,
    });

    return {
      success: true,
      entry,
    };
  }

  /**
   * Publish Timetable with 0-clash gate (TC-10)
   */
  public static publishTimetable(
    timetableId: string,
    userId: string
  ): { success: boolean; timetable?: TimetableEntity; conflicts?: ConflictDescriptor[] } {
    const tt = db.timetables.get(timetableId);
    if (!tt) {
      throw new Error(`Timetable ${timetableId} not found.`);
    }

    // Verify no critical clashes exist in the entire timetable
    const conflicts = ConstraintChecker.validateTimetable(timetableId);
    const critical = conflicts.filter((c) => c.severity === 'critical');

    if (critical.length > 0) {
      return {
        success: false,
        conflicts: critical,
      };
    }

    // Transition status to Published
    tt.status = 'Published';
    tt.published_at = new Date().toISOString();

    // Log to audit trail
    const logId = `LOG-${Date.now()}`;
    db.changeLogs.set(logId, {
      log_id: logId,
      timetable_id: timetableId,
      change_type: 'Generated',
      description: `Timetable ${timetableId} officially published to campus.`,
      reason: 'Semester schedule release',
      changed_by: userId,
      changed_on: new Date().toISOString(),
    });

    // Broadcast notification to all users
    Array.from(db.users.values()).forEach((u) => {
      const notifId = `NOTIF-${Date.now()}-${u.user_id}`;
      db.notifications.set(notifId, {
        notif_id: notifId,
        log_id: logId,
        recipient_id: u.user_id,
        message: `Department Timetable (${timetableId}) has been finalized and published.`,
        is_read: false,
        sent_on: new Date().toISOString(),
      });
    });

    // Broadcast email notification to students and faculty (Task 2)
    const pubRecipients = new Set<string>();
    pubRecipients.add('tanishparekh59@gmail.com');
    pubRecipients.add('tanishparekh03@gmail.com');
    Array.from(db.users.values()).forEach((u) => pubRecipients.add(u.email));

    const pubSubject = `[VJTI TTMS Alert] Timetable (${timetableId}) Finalized & Published`;
    const pubHtml = `
      <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px;">
        <div style="background-color: #16a34a; color: white; padding: 12px 16px; border-radius: 6px; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 18px;">VJTI TTMS: Official Timetable Published</h2>
        </div>
        <p>Dear Faculty and Students,</p>
        <p>The academic timetable (<strong>${timetableId}</strong>) has been finalized with 0 critical clashes and officially published to the campus portal.</p>
        <p>Please check your student / faculty dashboard for your updated weekly schedule.</p>
        <p style="margin-top: 24px; font-size: 13px; color: #64748b;">
          VJTI Department of Computer Engineering & Information Technology
        </p>
      </div>
    `;

    void EmailService.sendEmail({
      to: Array.from(pubRecipients),
      subject: pubSubject,
      html: pubHtml,
    });

    return {
      success: true,
      timetable: tt,
    };
  }

  /**
   * Public (No-Login) schedule query
   */
  public static getPublicSchedule(filters?: {
    batchId?: string;
    facultyId?: string;
    roomId?: string;
  }) {
    const publishedTT = Array.from(db.timetables.values()).find(
      (t) => t.status === 'Published' || t.status === 'Draft' // Allow draft preview for testing
    );

    if (!publishedTT) return [];

    let entries = Array.from(db.timetableEntries.values()).filter(
      (e) => e.timetable_id === publishedTT.timetable_id
    );

    if (filters?.batchId) {
      entries = entries.filter((e) => e.batch_ids.includes(filters.batchId!));
    }
    if (filters?.facultyId) {
      entries = entries.filter((e) => e.faculty_id === filters.facultyId);
    }
    if (filters?.roomId) {
      entries = entries.filter((e) => e.room_id === filters.roomId);
    }

    return entries.map((e) => {
      const sess = db.sessions.get(e.session_id);
      const sub = sess ? db.subjects.get(sess.subject_id) : null;
      const fac = db.faculty.get(e.faculty_id);
      const room = db.rooms.get(e.room_id);
      const slot = db.timeSlots.get(e.slot_id);

      return {
        entry_id: e.entry_id,
        subject_name: sub?.name || 'Class',
        subject_code: sub?.code || '',
        subject_type: sub?.type || 'Theory',
        faculty_name: fac?.name || e.faculty_id,
        room_no: room?.room_no || e.room_id,
        day: slot?.day || 'Mon',
        period_no: slot?.period_no || 1,
        start_time: slot?.start_time || '09:00',
        end_time: slot?.end_time || '10:00',
        batch_ids: e.batch_ids,
        is_combined: e.batch_ids.length > 1,
      };
    });
  }
}


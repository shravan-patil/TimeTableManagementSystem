// =============================================================================
// VJTI Time Table Management System (TTMS)
// SubstitutionService: Algorithm 3 Smart Substitution & Auto-Reschedule Fallback
// Reference: Assignment 7 Section 5.5 (Algorithm 3)
// =============================================================================

import { db } from '../db';
import { ConstraintChecker } from './ConstraintChecker';
import { EmailService } from './EmailService';
import {
  LeaveRequestEntity,
  SubstitutionEntity,
  SubstituteCandidate,
  RescheduleProposal,
  TimetableEntryEntity,
} from '../types';

export interface LeaveImpactAnalysis {
  leave: LeaveRequestEntity;
  impactedEntries: {
    entry: TimetableEntryEntity;
    subjectName: string;
    slotDetails?: {
      day: string;
      period_no: number;
      start_time: string;
      end_time: string;
    };
    candidates: SubstituteCandidate[];
    rescheduleProposal?: RescheduleProposal | null;
  }[];
}

export class SubstitutionService {
  public static reportLeave(
    facultyId: string,
    fromDate: string,
    toDate: string,
    reason: string
  ): LeaveImpactAnalysis {
    const leaveId = `LEAVE-${Date.now()}`;
    const leave: LeaveRequestEntity = {
      leave_id: leaveId,
      faculty_id: facultyId,
      from_date: fromDate,
      to_date: toDate,
      reason,
      status: 'Reported',
      created_at: new Date().toISOString(),
    };
    db.leaveRequests.set(leaveId, leave);

    const absentFaculty = db.faculty.get(facultyId);

    // Identify impacted entries scheduled for this faculty (with alias matching)
    const impactedEntries = Array.from(db.timetableEntries.values()).filter((e) => {
      if (e.faculty_id === facultyId) return true;
      if (absentFaculty?.user_id) {
        const entryFac = db.faculty.get(e.faculty_id);
        if (entryFac && entryFac.user_id === absentFaculty.user_id) return true;
      }
      return false;
    });

    const analysisDetails = impactedEntries.map((entry) => {
      const sess = db.sessions.get(entry.session_id);
      const sub = sess ? db.subjects.get(sess.subject_id) : null;
      const slot = db.timeSlots.get(entry.slot_id);

      // Task 3: Create OPEN_FOR_CLAIM substitution record for FCFS claim
      const subId = `SUB-OPEN-${Date.now()}-${entry.entry_id}`;
      const openSub: SubstitutionEntity = {
        sub_id: subId,
        leave_id: leaveId,
        entry_id: entry.entry_id,
        substitute_faculty_id: null,
        rescheduled_slot_id: null,
        rescheduled_room_id: null,
        sub_date: fromDate,
        action: 'Substituted',
        status: 'OPEN_FOR_CLAIM',
        logged_at: new Date().toISOString(),
      };
      db.substitutions.set(subId, openSub);

      const candidates = this.suggestSubstitutes(entry);
      let rescheduleProposal: RescheduleProposal | null = null;

      if (candidates.length === 0) {
        rescheduleProposal = this.findRescheduleSlot(entry);
      }

      return {
        entry,
        subjectName: sub?.name || entry.session_id,
        slotDetails: slot,
        candidates,
        rescheduleProposal,
      };
    });

    // Broadcast FCFS open lecture alerts to all eligible faculty
    if (impactedEntries.length > 0) {
      const facultyRecipients = new Set<string>();
      facultyRecipients.add('tanishparekh03@gmail.com');
      Array.from(db.faculty.values()).forEach((f) => {
        if (f.faculty_id !== facultyId && f.email) {
          facultyRecipients.add(f.email);
        }
      });

      Array.from(db.faculty.values()).forEach((f) => {
        if (f.faculty_id !== facultyId && f.user_id) {
          const notifId = `NOTIF-${Date.now()}-${f.user_id}`;
          db.notifications.set(notifId, {
            notif_id: notifId,
            recipient_id: f.user_id,
            message: `New open lecture(s) available for claim from ${absentFaculty?.name || 'Faculty'} (${fromDate} to ${toDate}).`,
            is_read: false,
            sent_on: new Date().toISOString(),
          });
        }
      });

      const openSubSubject = `[VJTI TTMS Alert] Open Lecture(s) Available for Claim (FCFS)`;
      const openSubHtml = `
        <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px;">
          <div style="background-color: #2563eb; color: white; padding: 12px 16px; border-radius: 6px; margin-bottom: 20px;">
            <h2 style="margin: 0; font-size: 18px;">VJTI TTMS: Open Lecture Available for Claim</h2>
          </div>
          <p>Dear Faculty,</p>
          <p>Prof. <strong>${absentFaculty?.name || 'A faculty member'}</strong> has reported leave from <strong>${fromDate}</strong> to <strong>${toDate}</strong>.</p>
          <p>Affected lectures are now open on the <strong>Faculty Portal (First-Come, First-Served)</strong>.</p>
          <p>Please log in to your Faculty Portal to review eligibility and claim open slots.</p>
          <p style="margin-top: 24px; font-size: 13px; color: #64748b;">
            VJTI Department of Computer Engineering & Information Technology
          </p>
        </div>
      `;

      void EmailService.sendEmail({
        to: Array.from(facultyRecipients),
        subject: openSubSubject,
        html: openSubHtml,
      });
    }

    return {
      leave,
      impactedEntries: analysisDetails,
    };
  }

  public static suggestSubstitutes(entry: TimetableEntryEntity): SubstituteCandidate[] {
    const sess = db.sessions.get(entry.session_id);
    if (!sess) return [];

    // Calculate weekly assigned hours for each faculty
    const loadMap = new Map<string, number>();
    for (const e of Array.from(db.timetableEntries.values())) {
      loadMap.set(e.faculty_id, (loadMap.get(e.faculty_id) || 0) + 1);
    }

    // Faculty members already occupied in this slot
    const targetSlot = db.timeSlots.get(entry.slot_id);
    const occupiedFacultyInSlot = new Set(
      Array.from(db.timetableEntries.values())
        .filter((e) => {
          if (e.entry_id === entry.entry_id) return false;
          if (e.slot_id === entry.slot_id) return true;
          const eSlot = db.timeSlots.get(e.slot_id);
          return (
            eSlot &&
            targetSlot &&
            eSlot.day === targetSlot.day &&
            eSlot.period_no === targetSlot.period_no
          );
        })
        .map((e) => e.faculty_id)
    );

    // Subject experts from faculty_subjects
    const qualifiedFacultyIds = new Set(
      Array.from(db.facultySubjects.values())
        .filter((fs) => fs.subject_id === sess.subject_id)
        .map((fs) => fs.faculty_id)
    );

    const candidates: SubstituteCandidate[] = [];

    for (const f of Array.from(db.faculty.values())) {
      if (f.faculty_id === entry.faculty_id) continue; // Skip absent faculty

      const isSubjectExpert = qualifiedFacultyIds.has(f.faculty_id);
      const isBusy = occupiedFacultyInSlot.has(f.faculty_id);
      let unavail = db.facultyAvailability.get(`${f.faculty_id}_${entry.slot_id}`);
      if (!unavail && targetSlot) {
        unavail = Array.from(db.facultyAvailability.values()).find((fa) => {
          if (fa.faculty_id !== f.faculty_id) return false;
          const s = db.timeSlots.get(fa.slot_id);
          return s && s.day === targetSlot.day && s.period_no === targetSlot.period_no;
        });
      }
      const isUnavailable = unavail ? !unavail.is_available : false;
      const isFreeAtSlot = !isBusy && !isUnavailable;

      const currentLoad = loadMap.get(f.faculty_id) || 0;
      const maxLoad = f.max_weekly_load;
      const loadRatio = Number((currentLoad / maxLoad).toFixed(2));

      // Algorithm 3 scoring: Must be free at slot to be recommended
      if (isFreeAtSlot) {
        let score = (1.0 - loadRatio) * 50;
        let reason = `Available (${currentLoad}/${maxLoad} hrs).`;

        if (isSubjectExpert) {
          score += 50;
          reason = `Subject Matter Expert & Free (${currentLoad}/${maxLoad} hrs).`;
        }

        candidates.push({
          faculty_id: f.faculty_id,
          name: f.name,
          isSubjectExpert,
          currentWeeklyLoad: currentLoad,
          maxWeeklyLoad: maxLoad,
          loadRatio,
          isFreeAtSlot,
          matchScore: Math.round(score),
          matchReason: reason,
        });
      }
    }

    // Rank candidates by ascending load ratio (least-loaded first)
    candidates.sort((a, b) => {
      if (a.isSubjectExpert !== b.isSubjectExpert) {
        return a.isSubjectExpert ? -1 : 1; // Prioritize subject experts
      }
      return a.loadRatio - b.loadRatio; // Then least loaded
    });

    return candidates;
  }

  public static findRescheduleSlot(entry: TimetableEntryEntity): RescheduleProposal | null {
    const sess = db.sessions.get(entry.session_id);
    if (!sess) return null;

    const allSlots = Array.from(db.timeSlots.values()).sort((a, b) => {
      if (a.day !== b.day) return a.day.localeCompare(b.day);
      return a.period_no - b.period_no;
    });

    for (const slot of allSlots) {
      if (slot.slot_id === entry.slot_id) continue;

      const params = {
        timetableId: entry.timetable_id,
        sessionId: entry.session_id,
        subjectId: sess.subject_id,
        facultyId: entry.faculty_id,
        roomId: entry.room_id,
        slotId: slot.slot_id,
        batchIds: entry.batch_ids,
        excludeEntryId: entry.entry_id,
      };

      if (ConstraintChecker.noClash(params)) {
        const room = db.rooms.get(entry.room_id);
        return {
          slot_id: slot.slot_id,
          day: slot.day,
          period_no: slot.period_no,
          start_time: slot.start_time,
          end_time: slot.end_time,
          room_id: entry.room_id,
          room_no: room?.room_no || entry.room_id,
          reason: `Earliest clash-free slot for faculty, batch, and room.`,
        };
      }
    }

    return null;
  }

  public static confirmSubstitution(params: {
    leaveId: string;
    entryId: string;
    substituteFacultyId?: string;
    rescheduledSlotId?: string;
    rescheduledRoomId?: string;
    action: 'Substituted' | 'Rescheduled';
    subDate: string;
    coordinatorUserId: string;
  }): SubstitutionEntity {
    const subId = `SUB-${Date.now()}`;
    const sub: SubstitutionEntity = {
      sub_id: subId,
      leave_id: params.leaveId,
      entry_id: params.entryId,
      substitute_faculty_id: params.substituteFacultyId,
      rescheduled_slot_id: params.rescheduledSlotId,
      rescheduled_room_id: params.rescheduledRoomId,
      sub_date: params.subDate,
      action: params.action,
      status: 'Approved',
      logged_at: new Date().toISOString(),
    };
    db.substitutions.set(subId, sub);

    // Apply substitution or reschedule to active entry
    const entry = db.timetableEntries.get(params.entryId);
    if (entry) {
      if (params.action === 'Substituted' && params.substituteFacultyId) {
        entry.faculty_id = params.substituteFacultyId;
      } else if (params.action === 'Rescheduled' && params.rescheduledSlotId) {
        entry.slot_id = params.rescheduledSlotId;
        if (params.rescheduledRoomId) {
          entry.room_id = params.rescheduledRoomId;
        }
      }
    }

    // Log to Change Log Audit Trail
    const logId = `LOG-${Date.now()}`;
    db.changeLogs.set(logId, {
      log_id: logId,
      timetable_id: entry?.timetable_id || 'TT-2026-ODD',
      change_type: params.action === 'Substituted' ? 'Substitution' : 'Reschedule',
      description: `${params.action} applied to Entry ${params.entryId} on ${params.subDate}.`,
      reason: `Leave resolution for leave request ${params.leaveId}`,
      changed_by: params.coordinatorUserId,
      changed_on: new Date().toISOString(),
    });

    // Notify involved parties
    if (params.substituteFacultyId) {
      const fac = db.faculty.get(params.substituteFacultyId);
      if (fac?.user_id) {
        const notifId = `NOTIF-${Date.now()}`;
        db.notifications.set(notifId, {
          notif_id: notifId,
          log_id: logId,
          recipient_id: fac.user_id,
          message: `You have been assigned as substitute for class ${entry?.session_id} on ${params.subDate}.`,
          is_read: false,
          sent_on: new Date().toISOString(),
        });
      }
    }

    return sub;
  }

  /**
   * Atomic FCFS Claim for Open Substitutions (Task 3)
   */
  public static claimOpenSubstitution(params: {
    subId: string;
    facultyId: string;
  }): { success: boolean; error?: string; status: number; substitution?: SubstitutionEntity } {
    const sub = db.substitutions.get(params.subId);
    if (!sub) {
      return { success: false, error: 'Substitution record not found.', status: 404 };
    }

    // Atomic race condition check
    if (sub.status !== 'OPEN_FOR_CLAIM') {
      return {
        success: false,
        error: 'This lecture has already been claimed by another faculty member.',
        status: 409,
      };
    }

    const claimingFaculty = db.faculty.get(params.facultyId);
    if (!claimingFaculty) {
      return { success: false, error: 'Claiming faculty record not found.', status: 404 };
    }

    const leave = db.leaveRequests.get(sub.leave_id);
    if (leave) {
      const leaveFaculty = db.faculty.get(leave.faculty_id);
      if (
        leave.faculty_id === params.facultyId ||
        (leaveFaculty && claimingFaculty.user_id && leaveFaculty.user_id === claimingFaculty.user_id)
      ) {
        return { success: false, error: 'You cannot claim your own lecture while on leave.', status: 400 };
      }
    }

    const entry = db.timetableEntries.get(sub.entry_id);
    if (!entry) {
      return { success: false, error: 'Associated timetable entry not found.', status: 404 };
    }

    const targetSlot = db.timeSlots.get(entry.slot_id);
    // Double booking check for claiming faculty
    const hasClash = Array.from(db.timetableEntries.values()).some((e) => {
      if (e.entry_id === entry.entry_id) return false;
      if (e.faculty_id !== params.facultyId) return false;
      if (e.slot_id === entry.slot_id) return true;
      const eSlot = db.timeSlots.get(e.slot_id);
      return eSlot && targetSlot && eSlot.day === targetSlot.day && eSlot.period_no === targetSlot.period_no;
    });

    if (hasClash) {
      return {
        success: false,
        error: 'Schedule conflict: You are already assigned to teach in this time slot.',
        status: 409,
      };
    }

    // Availability check
    let unavail = db.facultyAvailability.get(`${params.facultyId}_${entry.slot_id}`);
    if (!unavail && targetSlot) {
      unavail = Array.from(db.facultyAvailability.values()).find((fa) => {
        if (fa.faculty_id !== params.facultyId) return false;
        const s = db.timeSlots.get(fa.slot_id);
        return s && s.day === targetSlot.day && s.period_no === targetSlot.period_no;
      });
    }
    if (unavail && !unavail.is_available) {
      return {
        success: false,
        error: 'Unavailable: You have marked yourself unavailable in this time slot.',
        status: 409,
      };
    }

    // Atomic state transition
    sub.status = 'CLAIMED';
    sub.substitute_faculty_id = params.facultyId;
    entry.faculty_id = params.facultyId;

    // Log to Change Log Audit Trail
    const logId = `LOG-${Date.now()}`;
    db.changeLogs.set(logId, {
      log_id: logId,
      timetable_id: entry.timetable_id,
      change_type: 'Substitution',
      description: `Lecture ${entry.entry_id} on ${sub.sub_date} claimed by ${claimingFaculty.name} via FCFS claim board.`,
      reason: `FCFS claim for leave request ${sub.leave_id}`,
      changed_by: claimingFaculty.user_id || claimingFaculty.faculty_id,
      changed_on: new Date().toISOString(),
    });

    // In-app notifications
    const claimNotifId = `NOTIF-${Date.now()}-claim`;
    db.notifications.set(claimNotifId, {
      notif_id: claimNotifId,
      log_id: logId,
      recipient_id: claimingFaculty.user_id || claimingFaculty.faculty_id,
      message: `You successfully claimed substitution for entry ${entry.entry_id} on ${sub.sub_date}.`,
      is_read: false,
      sent_on: new Date().toISOString(),
    });

    const origFaculty = leave ? db.faculty.get(leave.faculty_id) : null;
    if (origFaculty?.user_id) {
      const origNotifId = `NOTIF-${Date.now()}-orig`;
      db.notifications.set(origNotifId, {
        notif_id: origNotifId,
        log_id: logId,
        recipient_id: origFaculty.user_id,
        message: `Your lecture on ${sub.sub_date} has been claimed by ${claimingFaculty.name}.`,
        is_read: false,
        sent_on: new Date().toISOString(),
      });
    }

    // Automated Email Broadcast to affected students & faculty (Task 2 & 3)
    const sess = db.sessions.get(entry.session_id);
    const subObj = sess ? db.subjects.get(sess.subject_id) : null;
    const roomObj = db.rooms.get(entry.room_id);
    const batchNames = entry.batch_ids.map((bId) => db.batches.get(bId)?.division || bId).join(', ');
    const subjectName = subObj?.name || entry.session_id;

    const studentRecipients = new Set<string>();
    studentRecipients.add('tanishparekh59@gmail.com');
    if (claimingFaculty.email) studentRecipients.add(claimingFaculty.email);
    if (origFaculty?.email) studentRecipients.add(origFaculty.email);
    Array.from(db.users.values())
      .filter((u) => u.role === 'student' && (!u.department_id || u.department_id === claimingFaculty.department_id))
      .forEach((u) => studentRecipients.add(u.email));

    const claimEmailSubject = `[VJTI TTMS Alert] Substitution Confirmed for ${batchNames} - ${subjectName}`;
    const claimEmailHtml = `
      <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px;">
        <div style="background-color: #0d9488; color: white; padding: 12px 16px; border-radius: 6px; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 18px;">VJTI TTMS: Lecture Substitution Confirmed</h2>
        </div>
        <p>Dear Faculty and Students,</p>
        <p>A substitution has been confirmed under the FCFS open lecture claim system for <strong>${batchNames}</strong>.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
          <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 8px; font-weight: bold; width: 35%;">Subject:</td>
            <td style="padding: 8px;">${subjectName} (${subObj?.code || 'N/A'})</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 8px; font-weight: bold;">Date & Slot:</td>
            <td style="padding: 8px;">${sub.sub_date} (${targetSlot?.day || ''} Period ${targetSlot?.period_no || ''}: ${targetSlot?.start_time || ''} - ${targetSlot?.end_time || ''})</td>
          </tr>
          <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 8px; font-weight: bold;">Substitute Faculty:</td>
            <td style="padding: 8px; color: #0d9488; font-weight: bold;">${claimingFaculty.name}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 8px; font-weight: bold;">Original Faculty:</td>
            <td style="padding: 8px;">${origFaculty?.name || 'On Leave'}</td>
          </tr>
          <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 8px; font-weight: bold;">Room:</td>
            <td style="padding: 8px;">${roomObj?.room_no || entry.room_id}</td>
          </tr>
        </table>
        <p style="margin-top: 16px; font-size: 13px; color: #64748b;">
          This is an automated system notification from VJTI TTMS.
        </p>
      </div>
    `;

    void EmailService.sendEmail({
      to: Array.from(studentRecipients),
      subject: claimEmailSubject,
      html: claimEmailHtml,
    });

    return {
      success: true,
      status: 200,
      substitution: sub,
    };
  }

  /**
   * Get all open substitutions with eligibility badges for a faculty member
   */
  public static getOpenSubstitutions(forFacultyId?: string) {
    const openSubs = Array.from(db.substitutions.values()).filter(
      (s) => s.status === 'OPEN_FOR_CLAIM'
    );

    return openSubs.map((sub) => {
      const entry = db.timetableEntries.get(sub.entry_id);
      const sess = entry ? db.sessions.get(entry.session_id) : null;
      const subObj = sess ? db.subjects.get(sess.subject_id) : null;
      const slot = entry ? db.timeSlots.get(entry.slot_id) : null;
      const room = entry ? db.rooms.get(entry.room_id) : null;
      const leave = db.leaveRequests.get(sub.leave_id);
      const originalFaculty = leave
        ? db.faculty.get(leave.faculty_id)
        : entry
        ? db.faculty.get(entry.faculty_id)
        : null;
      const batchNames =
        entry?.batch_ids.map((b) => db.batches.get(b)?.division || b).join(', ') || 'N/A';

      let isEligible = true;
      let conflictReason: string | undefined = undefined;

      if (forFacultyId) {
        const queryingFac = db.faculty.get(forFacultyId);
        const leaveFac = leave ? db.faculty.get(leave.faculty_id) : null;
        const isOwnLecture =
          leave?.faculty_id === forFacultyId ||
          (leaveFac && queryingFac && leaveFac.user_id && leaveFac.user_id === queryingFac.user_id);

        if (isOwnLecture) {
          isEligible = false;
          conflictReason = 'Your own lecture (on leave)';
        } else if (entry && slot) {
          const hasClash = Array.from(db.timetableEntries.values()).some((e) => {
            if (e.entry_id === entry.entry_id) return false;
            if (e.faculty_id !== forFacultyId) return false;
            if (e.slot_id === entry.slot_id) return true;
            const eSlot = db.timeSlots.get(e.slot_id);
            return eSlot && eSlot.day === slot.day && eSlot.period_no === slot.period_no;
          });

          if (hasClash) {
            isEligible = false;
            conflictReason = 'Double-booking clash (already teaching in this slot)';
          } else {
            let unavail = db.facultyAvailability.get(`${forFacultyId}_${entry.slot_id}`);
            if (!unavail) {
              unavail = Array.from(db.facultyAvailability.values()).find((fa) => {
                if (fa.faculty_id !== forFacultyId) return false;
                const s = db.timeSlots.get(fa.slot_id);
                return s && s.day === slot.day && s.period_no === slot.period_no;
              });
            }
            if (unavail && !unavail.is_available) {
              isEligible = false;
              conflictReason = 'Marked unavailable for this time slot';
            }
          }
        }
      }

      return {
        sub_id: sub.sub_id,
        leave_id: sub.leave_id,
        entry_id: sub.entry_id,
        sub_date: sub.sub_date,
        subject_name: subObj?.name || 'Class',
        subject_code: subObj?.code || '',
        subject_type: subObj?.type || 'Theory',
        batch_names: batchNames,
        room_no: room?.room_no || 'TBA',
        day: slot?.day || 'Mon',
        period_no: slot?.period_no || 1,
        start_time: slot?.start_time || '09:00',
        end_time: slot?.end_time || '10:00',
        original_faculty_name: originalFaculty?.name || 'Faculty',
        original_faculty_id: originalFaculty?.faculty_id || '',
        is_eligible: isEligible,
        conflict_reason: conflictReason,
        status: sub.status,
      };
    });
  }
}


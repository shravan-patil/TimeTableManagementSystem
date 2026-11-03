// =============================================================================
// VJTI Time Table Management System (TTMS)
// SubstitutionService: Algorithm 3 Smart Substitution & Auto-Reschedule Fallback
// Reference: Assignment 7 Section 5.5 (Algorithm 3)
// =============================================================================

import { db } from '../db';
import { ConstraintChecker } from './ConstraintChecker';
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

    // Identify impacted entries scheduled for this faculty
    const impactedEntries = Array.from(db.timetableEntries.values()).filter(
      (e) => e.faculty_id === facultyId
    );

    const analysisDetails = impactedEntries.map((entry) => {
      const sess = db.sessions.get(entry.session_id);
      const sub = sess ? db.subjects.get(sess.subject_id) : null;
      const slot = db.timeSlots.get(entry.slot_id);

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
}


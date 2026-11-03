import {
  Session,
  ConflictItem,
  Faculty,
  Room,
  Batch,
  Subject,
  FacultyAvailability,
  TimeSlot,
} from '../types/ttms';

export interface MasterDataContext {
  faculty: Faculty[];
  rooms: Room[];
  batches: Batch[];
  subjects: Subject[];
  timeSlots: TimeSlot[];
  facultyAvailability: FacultyAvailability[];
}

/**
 * Checks whether a faculty ID is a synthetic/dummy faculty placeholder.
 * Dummy faculty IDs (e.g. TBA, TBA_*, DUMMY_*) never trigger double-booking conflicts.
 */
export function isDummyFaculty(facultyId?: string | null): boolean {
  if (!facultyId) return true;
  return facultyId === 'TBA' || facultyId.startsWith('TBA_') || facultyId.startsWith('DUMMY_');
}

/**
 * Determines the designated mandatory lunch break period for a cohort.
 * - SY B.Tech (Year 2): Slot Period 5 (12:30 PM - 1:25 PM)
 * - TY & Final B.Tech (Year 3 & 4): Slot Period 6 (1:30 PM - 2:25 PM / 14:30)
 */
export function getBatchLunchPeriod(batch?: Batch | null, defaultLunchPeriod: number = 5): number {
  if (!batch) return defaultLunchPeriod;
  const year = batch.Year;
  const div = (batch.Division || '').toUpperCase();
  if (year === 2 || div.includes('SY') || div.includes('SECOND')) {
    return 5;
  }
  if (year === 3 || year === 4 || div.includes('TY') || div.includes('FINAL') || div.includes('BTECH') || div.includes('B.TECH')) {
    return 6;
  }
  return defaultLunchPeriod;
}

/**
 * Checks if two subjects belong to the same parallel elective basket (e.g. PE-I, PE-III, PE-IV, MDM, Honors)
 * or are parallel lab practicals for sub-batches of the same cohort.
 */
export function areParallelElectivesOrLabs(
  s1: Session,
  s2: Session,
  subjects: Subject[]
): boolean {
  if (s1.Subject_ID === s2.Subject_ID) return false;

  const sub1 = subjects.find((s) => s.Subject_ID === s1.Subject_ID);
  const sub2 = subjects.find((s) => s.Subject_ID === s2.Subject_ID);
  if (!sub1 || !sub2) return false;

  // If both are parallel practical labs in different rooms with different faculty
  if (
    (sub1.Subject_Type === 'Practical' || sub1.Requires_Lab) &&
    (sub2.Subject_Type === 'Practical' || sub2.Requires_Lab)
  ) {
    if (s1.Room_ID !== s2.Room_ID && s1.Faculty_ID !== s2.Faculty_ID) {
      return true; // Parallel sub-batch practical lab block
    }
  }

  // Check parallel elective tracks
  const getBasket = (name: string): string | null => {
    const n = name.toUpperCase();
    if (n.includes('PE III') || n.includes('PE-III')) return 'PE_III';
    if (n.includes('PE IV') || n.includes('PE-IV')) return 'PE_IV';
    if (n.includes('PE I') || n.includes('PE-I')) return 'PE_I';
    if (n.includes('MDM V') || n.includes('MDM 5') || n.includes('MDM-V')) return 'MDM_V';
    if (n.includes('MDM III') || n.includes('MDM 3') || n.includes('MDM-III')) return 'MDM_III';
    if (n.includes('MDM I') || n.includes('MDM 1') || n.includes('MDM-I')) return 'MDM_I';
    if (n.includes('HONORS') || n.includes('HON:')) return 'HONORS';
    return null;
  };

  const b1 = getBasket(sub1.Subject_Name);
  const b2 = getBasket(sub2.Subject_Name);
  if (b1 !== null && b1 === b2 && s1.Room_ID !== s2.Room_ID && s1.Faculty_ID !== s2.Faculty_ID) {
    return true; // Synchronized parallel elective track
  }

  return false;
}

/**
 * Checks if two batch IDs have a parent/child conflict (e.g. parent division vs sub-batch).
 */
export function areBatchesConflicting(
  bId1: string,
  bId2: string,
  batchMap: Map<string, Batch>
): boolean {
  if (bId1 === bId2) return true;

  const b1 = batchMap.get(bId1);
  const b2 = batchMap.get(bId2);

  const p1 = b1?.Parent_Batch_ID || (bId1.includes('-') && bId1.split('-').length > 3 ? bId1.substring(0, bId1.lastIndexOf('-')) : null);
  const p2 = b2?.Parent_Batch_ID || (bId2.includes('-') && bId2.split('-').length > 3 ? bId2.substring(0, bId2.lastIndexOf('-')) : null);

  if (p1 === bId2 || p2 === bId1) {
    return true;
  }

  return false;
}

/**
 * Detect all conflicts across active sessions
 */
export function detectAllConflicts(
  sessions: Session[],
  context: MasterDataContext
): ConflictItem[] {
  const conflicts: ConflictItem[] = [];
  const { faculty, rooms, batches, subjects, timeSlots, facultyAvailability } = context;

  const facultyMap = new Map(faculty.map((f) => [f.Faculty_ID, f]));
  const roomMap = new Map(rooms.map((r) => [r.Room_ID, r]));
  const batchMap = new Map(batches.map((b) => [b.Batch_ID, b]));
  const subjectMap = new Map(subjects.map((s) => [s.Subject_ID, s]));
  const slotMap = new Map(timeSlots.map((ts) => [ts.Slot_ID, ts]));

  // Index sessions by Slot_ID for pairwise checking
  const slotToSessions = new Map<string, Session[]>();
  sessions.forEach((s) => {
    const list = slotToSessions.get(s.Slot_ID) || [];
    list.push(s);
    slotToSessions.set(s.Slot_ID, list);
  });

  slotToSessions.forEach((slotSessions, slotId) => {
    const slot = slotMap.get(slotId);
    const day = slot?.Day || 'Mon';
    const periodNo = slot?.Period_No || 1;

    // 1. Check Faculty Double-Booking (H1)
    const facultySeen = new Map<string, Session[]>();
    slotSessions.forEach((s) => {
      if (isDummyFaculty(s.Faculty_ID)) return;
      const existing = facultySeen.get(s.Faculty_ID) || [];
      existing.push(s);
      facultySeen.set(s.Faculty_ID, existing);
    });

    facultySeen.forEach((dupes, facId) => {
      const first = dupes[0];
      const isJointSession = dupes.every(
        (d) => d.Subject_ID === first.Subject_ID && d.Room_ID === first.Room_ID
      );

      if (dupes.length > 1 && !isJointSession) {
        const facName = facultyMap.get(facId)?.Faculty_Name || facId;
        const subNames = dupes.map((d) => subjectMap.get(d.Subject_ID)?.Subject_Name || d.Subject_ID).join(' & ');
        conflicts.push({
          id: `CONF_FAC_${slotId}_${facId}`,
          type: 'FACULTY_DOUBLE_BOOKED',
          severity: 'critical',
          title: `Faculty Double-Booked: ${facName}`,
          description: `${facName} is assigned to multiple classes simultaneously (${subNames}) on ${day} Period ${periodNo}.`,
          slotId,
          day,
          periodNo,
          sessionIds: dupes.map((d) => d.Session_ID),
          involvedEntities: { facultyId: facId },
        });
      }
    });

    // 2. Check Room Double-Booking (H2)
    const roomSeen = new Map<string, Session[]>();
    slotSessions.forEach((s) => {
      const existing = roomSeen.get(s.Room_ID) || [];
      existing.push(s);
      roomSeen.set(s.Room_ID, existing);
    });

    roomSeen.forEach((dupes, rmId) => {
      const first = dupes[0];
      const isJointSession = dupes.every(
        (d) =>
          d.Subject_ID === first.Subject_ID &&
          (d.Faculty_ID === first.Faculty_ID || isDummyFaculty(d.Faculty_ID))
      );

      if (dupes.length > 1 && !isJointSession) {
        const roomName = roomMap.get(rmId)?.Room_No || rmId;
        conflicts.push({
          id: `CONF_RM_${slotId}_${rmId}`,
          type: 'ROOM_DOUBLE_BOOKED',
          severity: 'critical',
          title: `Room Clash: ${roomName}`,
          description: `Room ${roomName} is double-booked for multiple sessions on ${day} Period ${periodNo}.`,
          slotId,
          day,
          periodNo,
          sessionIds: dupes.map((d) => d.Session_ID),
          involvedEntities: { roomId: rmId },
        });
      }
    });

    // 3. Check Batch Double-Booking (H3)
    for (let i = 0; i < slotSessions.length; i++) {
      for (let j = i + 1; j < slotSessions.length; j++) {
        const s1 = slotSessions[i];
        const s2 = slotSessions[j];

        if (s1.Batch_ID === s2.Batch_ID) {
          // Exempt parallel elective tracks and parallel lab blocks
          if (areParallelElectivesOrLabs(s1, s2, subjects)) {
            continue;
          }

          const batchName = batchMap.get(s1.Batch_ID)?.Division || s1.Batch_ID;
          conflicts.push({
            id: `CONF_BAT_${slotId}_${s1.Batch_ID}_${s1.Session_ID}_${s2.Session_ID}`,
            type: 'BATCH_DOUBLE_BOOKED',
            severity: 'critical',
            title: `Batch Double-Booked: ${batchName}`,
            description: `Division ${batchName} is scheduled for more than one class on ${day} Period ${periodNo}.`,
            slotId,
            day,
            periodNo,
            sessionIds: [s1.Session_ID, s2.Session_ID],
            involvedEntities: { batchId: s1.Batch_ID },
          });
        } else if (areBatchesConflicting(s1.Batch_ID, s2.Batch_ID, batchMap)) {
          conflicts.push({
            id: `CONF_BAT_SUB_${slotId}_${s1.Session_ID}_${s2.Session_ID}`,
            type: 'BATCH_DOUBLE_BOOKED',
            severity: 'critical',
            title: `Parent Division / Sub-Batch Collision`,
            description: `Parent division lecture collides with active sub-batch lab on ${day} Period ${periodNo}.`,
            slotId,
            day,
            periodNo,
            sessionIds: [s1.Session_ID, s2.Session_ID],
            involvedEntities: { batchId: s1.Batch_ID },
          });
        }
      }
    }

    // 4. Single-Session Constraints
    slotSessions.forEach((s) => {
      const rm = roomMap.get(s.Room_ID);
      const bt = batchMap.get(s.Batch_ID);
      const sub = subjectMap.get(s.Subject_ID);
      const fac = facultyMap.get(s.Faculty_ID);

      // Staggered Lunch Break Violation
      if (bt) {
        const cohortLunch = getBatchLunchPeriod(bt);
        if (periodNo === cohortLunch) {
          conflicts.push({
            id: `CONF_LUNCH_${s.Session_ID}`,
            type: 'FACULTY_UNAVAILABLE',
            severity: 'critical',
            title: `Lunch Break Violation: ${bt.Division}`,
            description: `Session scheduled during mandatory campus lunch break for ${bt.Division} on ${day} Period ${periodNo}.`,
            slotId,
            day,
            periodNo,
            sessionIds: [s.Session_ID],
            involvedEntities: { batchId: s.Batch_ID },
          });
        }
      }

      // Room Type Mismatch
      if (s.Session_Type === 'Lab' && rm && rm.Room_Type !== 'Laboratory') {
        conflicts.push({
          id: `CONF_TYPE_${s.Session_ID}`,
          type: 'ROOM_TYPE_MISMATCH',
          severity: 'critical',
          title: `Room Type Incompatible: ${sub?.Subject_Name}`,
          description: `Practical lab session ${sub?.Subject_Name} is assigned to non-lab room "${rm.Room_No}" (${rm.Room_Type}).`,
          slotId,
          day,
          periodNo,
          sessionIds: [s.Session_ID],
          involvedEntities: { roomId: s.Room_ID, subjectId: s.Subject_ID },
        });
      }

      // Capacity Exceeded (full lecture batch)
      if (rm && bt && bt.Strength > rm.Capacity) {
        // If it's a full batch lecture and not a split elective
        const isElective = sub?.Subject_Type === 'Elective' || (sub?.Subject_Name || '').includes('PE ');
        if (s.Session_Type === 'Lecture' && !isElective) {
          conflicts.push({
            id: `CONF_CAP_${s.Session_ID}`,
            type: 'CAPACITY_EXCEEDED',
            severity: 'warning',
            title: `Room Capacity Deficit: ${rm.Room_No}`,
            description: `Batch ${bt.Division} (${bt.Strength} students) exceeds room ${rm.Room_No} capacity (${rm.Capacity}).`,
            slotId,
            day,
            periodNo,
            sessionIds: [s.Session_ID],
            involvedEntities: { roomId: s.Room_ID, batchId: s.Batch_ID },
          });
        }
      }

      // Faculty Availability
      if (!isDummyFaculty(s.Faculty_ID)) {
        const unavail = facultyAvailability.find(
          (fa) => fa.Faculty_ID === s.Faculty_ID && fa.Slot_ID === s.Slot_ID && !fa.Is_Available
        );
        if (unavail) {
          conflicts.push({
            id: `CONF_UNAVAIL_${s.Session_ID}`,
            type: 'FACULTY_UNAVAILABLE',
            severity: 'critical',
            title: `Faculty Unavailable: ${fac?.Faculty_Name}`,
            description: `${fac?.Faculty_Name} has marked themselves unavailable on ${day} Period ${periodNo}.`,
            slotId,
            day,
            periodNo,
            sessionIds: [s.Session_ID],
            involvedEntities: { facultyId: s.Faculty_ID },
          });
        }
      }
    });
  });

  // 5. Faculty Workload Overload Check
  const facultyLoad = new Map<string, number>();
  sessions.forEach((s) => {
    if (isDummyFaculty(s.Faculty_ID)) return;
    const current = facultyLoad.get(s.Faculty_ID) || 0;
    facultyLoad.set(s.Faculty_ID, current + 1);
  });

  facultyLoad.forEach((hours, facId) => {
    const fac = facultyMap.get(facId);
    if (fac && hours > fac.Max_Weekly_Load) {
      conflicts.push({
        id: `CONF_LOAD_${facId}`,
        type: 'FACULTY_OVERLOAD',
        severity: 'warning',
        title: `Faculty Workload Exceeded: ${fac.Faculty_Name}`,
        description: `${fac.Faculty_Name} assigned ${hours} hrs/week, exceeding policy limit of ${fac.Max_Weekly_Load} hrs/week.`,
        slotId: '',
        day: 'Mon',
        periodNo: 0,
        sessionIds: [],
        involvedEntities: { facultyId: facId },
      });
    }
  });

  return conflicts;
}

/**
 * Validates a single new or modified session against all other sessions
 */
export function validateSessionEdit(
  proposedSession: Session,
  allSessions: Session[],
  context: MasterDataContext
): { isValid: boolean; messages: string[] } {
  const otherSessions = allSessions.filter((s) => s.Session_ID !== proposedSession.Session_ID);
  const hypotheticalSessions = [...otherSessions, proposedSession];

  const conflicts = detectAllConflicts(hypotheticalSessions, context);
  const relevantConflicts = conflicts.filter((c) =>
    c.sessionIds.includes(proposedSession.Session_ID) ||
    c.involvedEntities.facultyId === proposedSession.Faculty_ID ||
    c.involvedEntities.roomId === proposedSession.Room_ID
  );

  const messages = relevantConflicts.map((c) => `${c.title}: ${c.description}`);
  return {
    isValid: messages.length === 0,
    messages,
  };
}

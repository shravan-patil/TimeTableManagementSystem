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
 * Detect all conflicts across the current active sessions based on:
 * 1. UNIQUE(Timetable_ID, Faculty_ID, Slot_ID)
 * 2. UNIQUE(Timetable_ID, Room_ID, Slot_ID)
 * 3. UNIQUE(Timetable_ID, Batch_ID, Slot_ID)
 * 4. Room capacity vs Batch strength
 * 5. Room type vs Session type (Labs require Laboratory)
 * 6. Faculty Availability constraints
 * 7. Faculty Max Weekly Load limits
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

  // Check slot-level clashes
  slotToSessions.forEach((slotSessions, slotId) => {
    const slot = slotMap.get(slotId);
    const day = slot?.Day || 'Mon';
    const periodNo = slot?.Period_No || 1;

    // 1. Check Faculty Double-Booking
    const facultySeen = new Map<string, Session[]>();
    slotSessions.forEach((s) => {
      const existing = facultySeen.get(s.Faculty_ID) || [];
      existing.push(s);
      facultySeen.set(s.Faculty_ID, existing);
    });

    facultySeen.forEach((dupes, facId) => {
      if (dupes.length > 1) {
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

    // 2. Check Room Double-Booking
    const roomSeen = new Map<string, Session[]>();
    slotSessions.forEach((s) => {
      const existing = roomSeen.get(s.Room_ID) || [];
      existing.push(s);
      roomSeen.set(s.Room_ID, existing);
    });

    roomSeen.forEach((dupes, rmId) => {
      if (dupes.length > 1) {
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

    // 3. Check Batch Double-Booking
    const batchSeen = new Map<string, Session[]>();
    slotSessions.forEach((s) => {
      const existing = batchSeen.get(s.Batch_ID) || [];
      existing.push(s);
      batchSeen.set(s.Batch_ID, existing);
    });

    batchSeen.forEach((dupes, bId) => {
      // If sessions are of type Lecture or non-split, duplicate batch is a clash
      if (dupes.length > 1) {
        const batchName = batchMap.get(bId)?.Division || bId;
        conflicts.push({
          id: `CONF_BAT_${slotId}_${bId}`,
          type: 'BATCH_DOUBLE_BOOKED',
          severity: 'critical',
          title: `Batch Double-Booked: ${batchName}`,
          description: `Division ${batchName} is scheduled for more than one class on ${day} Period ${periodNo}.`,
          slotId,
          day,
          periodNo,
          sessionIds: dupes.map((d) => d.Session_ID),
          involvedEntities: { batchId: bId },
        });
      }
    });

    // 4. Check Single-Session constraints (Capacity, Room Type, Availability)
    slotSessions.forEach((s) => {
      const rm = roomMap.get(s.Room_ID);
      const bt = batchMap.get(s.Batch_ID);
      const sub = subjectMap.get(s.Subject_ID);
      const fac = facultyMap.get(s.Faculty_ID);

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

      // Capacity Exceeded
      if (rm && bt && bt.Strength > rm.Capacity) {
        // for full batch lecture
        if (s.Session_Type === 'Lecture') {
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
    });
  });

  // 5. Check Faculty Workload Overload (FR-8)
  const facultyLoad = new Map<string, number>();
  sessions.forEach((s) => {
    const current = facultyLoad.get(s.Faculty_ID) || 0;
    facultyLoad.set(s.Faculty_ID, current + 1); // 1 period = 1 load hour
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
 * and returns specific error messages if any conflict is introduced.
 */
export function validateSessionEdit(
  proposedSession: Session,
  allSessions: Session[],
  context: MasterDataContext
): { isValid: boolean; messages: string[] } {
  // Exclude current session being modified
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


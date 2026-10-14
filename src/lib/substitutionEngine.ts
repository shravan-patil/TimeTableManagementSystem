import {
  Faculty,
  FacultyAvailability,
  FacultySubject,
  LeaveRequest,
  Session,
  Substitution,
  TimeSlot,
  Subject,
  DayOfWeek,
} from '../types/ttms';

export interface SubstituteCandidate {
  faculty: Faculty;
  currentLoad: number;
  maxLoad: number;
  isSubjectExpert: boolean;
  isFreeAtSlot: boolean;
  score: number; // 0 - 100 ranking score
  recommendationReason: string;
}

export interface AffectedSessionDetails {
  session: Session;
  subjectName: string;
  slotDetails: TimeSlot | undefined;
  candidates: SubstituteCandidate[];
}

/**
 * Finds all sessions affected by a faculty member taking leave on specific dates
 */
export function getAffectedSessionsForLeave(
  leave: LeaveRequest,
  sessions: Session[],
  timeSlots: TimeSlot[],
  subjects: Subject[],
  faculty: Faculty[],
  facultySubjects: FacultySubject[],
  facultyAvailability: FacultyAvailability[]
): AffectedSessionDetails[] {
  // Convert leave date to DayOfWeek for recurring weekly schedule check
  const leaveDateObj = new Date(leave.From_Date);
  const dayIndex = leaveDateObj.getDay(); // 0 is Sun, 1 is Mon, ...
  const dayMap: Record<number, DayOfWeek> = {
    1: 'Mon',
    2: 'Tue',
    3: 'Wed',
    4: 'Thu',
    5: 'Fri',
    6: 'Sat',
  };
  const targetDay = dayMap[dayIndex] || 'Mon';

  const slotMap = new Map(timeSlots.map((ts) => [ts.Slot_ID, ts]));
  const subjectMap = new Map(subjects.map((s) => [s.Subject_ID, s]));

  // Find sessions taught by this faculty on that day
  const affected = sessions.filter((s) => {
    if (s.Faculty_ID !== leave.Faculty_ID) return false;
    const slot = slotMap.get(s.Slot_ID);
    return slot?.Day === targetDay;
  });

  return affected.map((session) => {
    const slot = slotMap.get(session.Slot_ID);
    const sub = subjectMap.get(session.Subject_ID);
    const candidates = findEligibleSubstitutes(
      session,
      sessions,
      timeSlots,
      faculty,
      facultySubjects,
      facultyAvailability
    );

    return {
      session,
      subjectName: sub?.Subject_Name || session.Subject_ID,
      slotDetails: slot,
      candidates,
    };
  });
}

/**
 * Intelligent Substitute Recommendation Engine (Process 5.0, FR-11)
 * Queries faculty who:
 * 1. Can teach this subject (Faculty_Subject)
 * 2. Are free in this slot (no other session)
 * 3. Not marked unavailable
 * 4. Have capacity within Max_Weekly_Load
 */
export function findEligibleSubstitutes(
  session: Session,
  allSessions: Session[],
  timeSlots: TimeSlot[],
  facultyList: Faculty[],
  facultySubjects: FacultySubject[],
  facultyAvailability: FacultyAvailability[]
): SubstituteCandidate[] {
  // Calculate running load for each faculty
  const loadMap = new Map<string, number>();
  allSessions.forEach((s) => {
    loadMap.set(s.Faculty_ID, (loadMap.get(s.Faculty_ID) || 0) + 1);
  });

  // Sessions at the same slot
  const occupiedFacultyAtSlot = new Set(
    allSessions
      .filter((s) => s.Slot_ID === session.Slot_ID && s.Session_ID !== session.Session_ID)
      .map((s) => s.Faculty_ID)
  );

  // Qualified faculty for this subject
  const qualifiedFacultyIds = new Set(
    facultySubjects
      .filter((fs) => fs.Subject_ID === session.Subject_ID)
      .map((fs) => fs.Faculty_ID)
  );

  const candidates: SubstituteCandidate[] = [];

  for (const f of facultyList) {
    if (f.Faculty_ID === session.Faculty_ID) continue; // Skip the faculty on leave

    const isSubjectExpert = qualifiedFacultyIds.has(f.Faculty_ID);
    const isSlotOccupied = occupiedFacultyAtSlot.has(f.Faculty_ID);
    const isUnavail = facultyAvailability.some(
      (fa) => fa.Faculty_ID === f.Faculty_ID && fa.Slot_ID === session.Slot_ID && !fa.Is_Available
    );
    const isFreeAtSlot = !isSlotOccupied && !isUnavail;

    const currentLoad = loadMap.get(f.Faculty_ID) || 0;
    const hasCapacity = currentLoad < f.Max_Weekly_Load;

    // Calculate score
    let score = 0;
    let reason = '';

    if (isSubjectExpert && isFreeAtSlot && hasCapacity) {
      score = 95 - currentLoad; // Highest priority, favor lower load
      reason = 'Subject Expert, slot free & within weekly load limit.';
    } else if (isSubjectExpert && isFreeAtSlot && !hasCapacity) {
      score = 70;
      reason = 'Subject Expert & free, but currently at/over max weekly load limit.';
    } else if (!isSubjectExpert && isFreeAtSlot && hasCapacity) {
      score = 55;
      reason = 'Free at slot with spare capacity, but from related specialization.';
    } else if (!isFreeAtSlot) {
      score = 10;
      reason = 'Occupied with another scheduled class or marked unavailable in this slot.';
    }

    candidates.push({
      faculty: f,
      currentLoad,
      maxLoad: f.Max_Weekly_Load,
      isSubjectExpert,
      isFreeAtSlot,
      score,
      recommendationReason: reason,
    });
  }

  // Sort descending by score
  return candidates.sort((a, b) => b.score - a.score);
}


// =============================================================================
// VJTI Time Table Management System (TTMS)
// Server Types & Relational Domain Interfaces (3NF)
// Reference: Assignment 7 Section 2 & 5
// =============================================================================

export type UserRole = 'coordinator' | 'faculty' | 'student' | 'admin';

export type SubjectType = 'Theory' | 'Practical' | 'Elective';

export type RoomType = 'Lecture Hall' | 'Laboratory' | 'Seminar Room';

export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';

export type TimetableStatus =
  | 'Draft'
  | 'Under_Review'
  | 'Finalized'
  | 'Published'
  | 'Revised'
  | 'Archived';

export type LeaveStatus = 'Reported' | 'Processed' | 'Cancelled';

export type SubstitutionAction = 'Substituted' | 'Rescheduled';

export type ChangeType =
  | 'Substitution'
  | 'Reschedule'
  | 'Room change'
  | 'Manual Edit'
  | 'Generated';

export interface UserEntity {
  user_id: string;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  department_id?: string;
  created_at: string;
}

export interface DepartmentEntity {
  department_id: string;
  name: string;
  code: string;
  created_at: string;
}

export interface AcademicTermEntity {
  term_id: string;
  name: string;
  department_id: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export interface FacultyEntity {
  faculty_id: string;
  user_id?: string;
  department_id: string;
  name: string;
  email: string;
  max_weekly_load: number;
}

export interface SubjectEntity {
  subject_id: string;
  department_id: string;
  code: string;
  name: string;
  type: SubjectType;
  credits: number;
  hours_per_week: number;
  requires_lab: boolean;
}

export interface FacultySubjectEntity {
  faculty_id: string;
  subject_id: string;
}

export interface BatchEntity {
  batch_id: string;
  department_id: string;
  division: string;
  year: number;
  strength: number;
  parent_batch_id?: string | null;
}

export interface RoomEntity {
  room_id: string;
  room_no: string;
  capacity: number;
  type: RoomType;
}

export interface TimeSlotEntity {
  slot_id: string;
  day: DayOfWeek;
  period_no: number;
  start_time: string;
  end_time: string;
}

export interface FacultyAvailabilityEntity {
  availability_id?: string;
  faculty_id: string;
  slot_id: string;
  is_available: boolean;
}

export interface TimetableEntity {
  timetable_id: string;
  term_id: string;
  version_no: number;
  status: TimetableStatus;
  created_by: string;
  created_at: string;
  published_at?: string | null;
}

export interface SessionEntity {
  session_id: string;
  timetable_id: string;
  subject_id: string;
  faculty_id: string;
  room_id?: string;
  session_type: 'Lecture' | 'Lab';
  duration_slots: number;
  weekly_frequency: number;
  batch_ids: string[];
}

export interface TimetableEntryEntity {
  entry_id: string;
  timetable_id: string;
  session_id: string;
  slot_id: string;
  room_id: string;
  faculty_id: string;
  batch_ids: string[];
  created_at: string;
}

export interface LeaveRequestEntity {
  leave_id: string;
  faculty_id: string;
  from_date: string;
  to_date: string;
  reason: string;
  status: LeaveStatus;
  created_at: string;
}

export interface SubstitutionEntity {
  sub_id: string;
  leave_id: string;
  entry_id: string;
  substitute_faculty_id?: string | null;
  rescheduled_slot_id?: string | null;
  rescheduled_room_id?: string | null;
  sub_date: string;
  action: SubstitutionAction;
  status: 'Pending' | 'Approved' | 'Rejected' | 'OPEN_FOR_CLAIM' | 'CLAIMED';
  logged_at: string;
}

export interface ChangeLogEntity {
  log_id: string;
  timetable_id: string;
  change_type: ChangeType;
  description: string;
  reason: string;
  changed_by: string;
  changed_on: string;
}

export interface NotificationEntity {
  notif_id: string;
  log_id?: string;
  recipient_id: string;
  message: string;
  is_read: boolean;
  sent_on: string;
}

// -----------------------------------------------------------------------------
// Conflict Engine Types (Algorithm 2)
// -----------------------------------------------------------------------------
export type ConflictType =
  | 'FACULTY_DOUBLE_BOOKED'
  | 'ROOM_DOUBLE_BOOKED'
  | 'BATCH_DOUBLE_BOOKED'
  | 'ROOM_CAPACITY_DEFICIT'
  | 'FACULTY_UNAVAILABLE'
  | 'INVALID_TIMESLOT'
  | 'FACULTY_OVERLOAD'
  | 'STUDENT_FATIGUE'
  | 'CONSECUTIVE_TEACHING_OVERLOAD'
  | 'ROOM_TYPE_MISMATCH';

export type ConflictSeverity = 'critical' | 'warning';

export interface ConflictDescriptor {
  type: ConflictType;
  severity: ConflictSeverity;
  message: string;
  slot_id?: string;
  entry_ids?: string[];
  involved_entities: {
    faculty_id?: string;
    room_id?: string;
    batch_ids?: string[];
    session_id?: string;
  };
}

// -----------------------------------------------------------------------------
// Substitution Engine Types (Algorithm 3)
// -----------------------------------------------------------------------------
export interface SubstituteCandidate {
  faculty_id: string;
  name: string;
  isSubjectExpert: boolean;
  currentWeeklyLoad: number;
  maxWeeklyLoad: number;
  loadRatio: number;
  isFreeAtSlot: boolean;
  matchScore: number;
  matchReason: string;
}

export interface RescheduleProposal {
  slot_id: string;
  day: DayOfWeek;
  period_no: number;
  start_time: string;
  end_time: string;
  room_id: string;
  room_no: string;
  reason: string;
}

// -----------------------------------------------------------------------------
// Auth & JWT Context
// -----------------------------------------------------------------------------
export interface AuthTokenPayload {
  user_id: string;
  name: string;
  email: string;
  role: UserRole;
  faculty_id?: string;
  department_id?: string;
}


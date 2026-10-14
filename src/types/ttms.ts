// Data Model Types matching TTMS Requirement Analysis & Data Dictionary

export type UserRole = 'Coordinator' | 'Faculty' | 'Student';

export interface User {
  User_ID: string;
  User_Name: string;
  Role: UserRole;
  Password_Hash: string;
  Email: string;
}

export interface Faculty {
  Faculty_ID: string;
  Faculty_Name: string;
  Department: string;
  Max_Weekly_Load: number; // in hours/periods
  Email: string;
}

export type SubjectType = 'Theory' | 'Practical' | 'Elective';

export interface Subject {
  Subject_ID: string;
  Subject_Name: string;
  Subject_Type: SubjectType;
  Hours_Per_Week: number;
  Credits: number;
  Requires_Lab?: boolean;
}

export interface Batch {
  Batch_ID: string;
  Division: string; // e.g., 'Div A', 'Div B', 'B1', 'B2'
  Year: number;     // 2 = SY, 3 = TY, 4 = B.Tech
  Strength: number;
  Department: string;
}

export type RoomType = 'Lecture Hall' | 'Laboratory' | 'Seminar Room';

export interface Room {
  Room_ID: string;
  Room_No: string;
  Room_Type: RoomType;
  Capacity: number;
}

export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';

export interface TimeSlot {
  Slot_ID: string;
  Day: DayOfWeek;
  Period_No: number; // 1 to 7
  Start_Time: string;
  End_Time: string;
}

export interface FacultySubject {
  Faculty_ID: string;
  Subject_ID: string;
}

export interface FacultyAvailability {
  Faculty_ID: string;
  Slot_ID: string;
  Is_Available: boolean;
}

export type TimetableStatus =
  | 'Draft Generated'
  | 'Under Review'
  | 'Finalized'
  | 'Published'
  | 'Revised'
  | 'Archived';

export interface Timetable {
  Timetable_ID: string;
  Academic_Term: string; // e.g. "2026-27 Odd"
  Version_No: number;
  Status: TimetableStatus;
  Created_By: string;
  Created_On: string;
  Published_On?: string | null;
}

export type SessionType = 'Lecture' | 'Lab';

export interface Session {
  Session_ID: string;
  Timetable_ID: string;
  Subject_ID: string;
  Faculty_ID: string;
  Batch_ID: string;
  Room_ID: string;
  Slot_ID: string;
  Session_Type: SessionType;
}

export type LeaveStatus = 'Reported' | 'Processed' | 'Cancelled';

export interface LeaveRequest {
  Leave_ID: string;
  Faculty_ID: string;
  From_Date: string;
  To_Date: string;
  Reason: string;
  Status: LeaveStatus;
}

export type SubstitutionAction = 'Substituted' | 'Rescheduled';
export type SubstitutionStatus = 'Suggested' | 'Confirmed' | 'Closed';

export interface Substitution {
  Sub_ID: string;
  Leave_ID: string;
  Session_ID: string;
  Substitute_Faculty_ID?: string | null;
  Sub_Date: string;
  Action: SubstitutionAction;
  Status: SubstitutionStatus;
}

export type ChangeType = 'Substitution' | 'Reschedule' | 'Room change' | 'Manual Edit' | 'Generated';

export interface ChangeLog {
  Log_ID: string;
  Timetable_ID: string;
  Change_Type: ChangeType;
  Description: string;
  Reason: string;
  Changed_By: string;
  Changed_On: string;
}

export interface Notification {
  Notif_ID: string;
  Log_ID?: string | null;
  Recipient_ID: string;
  Message: string;
  Sent_On: string;
  Is_Read: boolean;
}

// Conflict Identification Models
export type ConflictType =
  | 'FACULTY_DOUBLE_BOOKED'
  | 'ROOM_DOUBLE_BOOKED'
  | 'BATCH_DOUBLE_BOOKED'
  | 'CAPACITY_EXCEEDED'
  | 'ROOM_TYPE_MISMATCH'
  | 'FACULTY_OVERLOAD'
  | 'FACULTY_UNAVAILABLE';

export interface ConflictItem {
  id: string;
  type: ConflictType;
  severity: 'critical' | 'warning';
  title: string;
  description: string;
  slotId: string;
  day: DayOfWeek;
  periodNo: number;
  sessionIds: string[];
  involvedEntities: {
    facultyId?: string;
    roomId?: string;
    batchId?: string;
    subjectId?: string;
  };
}

// Scheduling Configuration Parameters
export interface SchedulingConfig {
  academicTerm: string;
  workingDays: DayOfWeek[];
  periodsPerDay: number;
  periodDurationMins: number;
  startTime: string; // e.g. "09:00"
  lunchBreakPeriod: number; // e.g. 4
  allowSplitPracticals: boolean;
  balanceFacultyWorkload: boolean;
  fixedCommonElectivePeriod?: {
    day: DayOfWeek;
    periodNo: number;
    subjectId: string;
  };
}


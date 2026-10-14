import {
  User,
  Faculty,
  Subject,
  Batch,
  Room,
  TimeSlot,
  FacultySubject,
  FacultyAvailability,
  Timetable,
  Session,
  LeaveRequest,
  Substitution,
  ChangeLog,
  Notification,
  DayOfWeek,
} from '../types/ttms';

export const initialUsers: User[] = [
  {
    User_ID: 'USR_01',
    User_Name: 'Dr. V. M. Phalle (Coordinator)',
    Role: 'Coordinator',
    Password_Hash: 'hash_coord_123',
    Email: 'vmphalle@ceit.vjti.ac.in',
  },
  {
    User_ID: 'USR_02',
    User_Name: 'Prof. S. R. Patil',
    Role: 'Faculty',
    Password_Hash: 'hash_fac_456',
    Email: 'srpatil@ceit.vjti.ac.in',
  },
  {
    User_ID: 'USR_03',
    User_Name: 'Tanish Parekh',
    Role: 'Student',
    Password_Hash: 'hash_stud_789',
    Email: 'thparekh_b24@it.vjti.ac.in',
  },
];

export const initialFaculty: Faculty[] = [
  {
    Faculty_ID: 'FAC_01',
    Faculty_Name: 'Dr. V. M. Phalle',
    Department: 'Computer Engineering & IT',
    Max_Weekly_Load: 12,
    Email: 'vmphalle@ceit.vjti.ac.in',
  },
  {
    Faculty_ID: 'FAC_02',
    Faculty_Name: 'Prof. S. R. Patil',
    Department: 'Computer Engineering & IT',
    Max_Weekly_Load: 16,
    Email: 'srpatil@ceit.vjti.ac.in',
  },
  {
    Faculty_ID: 'FAC_03',
    Faculty_Name: 'Prof. T. H. Parekh',
    Department: 'Computer Engineering & IT',
    Max_Weekly_Load: 16,
    Email: 'thparekh@ceit.vjti.ac.in',
  },
  {
    Faculty_ID: 'FAC_04',
    Faculty_Name: 'Dr. R. K. Iyer',
    Department: 'Computer Engineering & IT',
    Max_Weekly_Load: 14,
    Email: 'rkiyer@ceit.vjti.ac.in',
  },
  {
    Faculty_ID: 'FAC_05',
    Faculty_Name: 'Prof. S. S. Patil',
    Department: 'Computer Engineering & IT',
    Max_Weekly_Load: 16,
    Email: 'sspatil@ceit.vjti.ac.in',
  },
  {
    Faculty_ID: 'FAC_06',
    Faculty_Name: 'Prof. A. B. Joshi',
    Department: 'Computer Engineering & IT',
    Max_Weekly_Load: 14,
    Email: 'abjoshi@ceit.vjti.ac.in',
  },
  {
    Faculty_ID: 'FAC_07',
    Faculty_Name: 'Prof. N. S. Prabhu',
    Department: 'Computer Engineering & IT',
    Max_Weekly_Load: 16,
    Email: 'nsprabhu@ceit.vjti.ac.in',
  },
];

export const initialSubjects: Subject[] = [
  {
    Subject_ID: 'SUB_01',
    Subject_Name: 'Software Engineering',
    Subject_Type: 'Theory',
    Hours_Per_Week: 3,
    Credits: 3,
  },
  {
    Subject_ID: 'SUB_02',
    Subject_Name: 'Database Management Systems',
    Subject_Type: 'Theory',
    Hours_Per_Week: 3,
    Credits: 3,
  },
  {
    Subject_ID: 'SUB_03',
    Subject_Name: 'DBMS Laboratory',
    Subject_Type: 'Practical',
    Hours_Per_Week: 2,
    Credits: 1,
    Requires_Lab: true,
  },
  {
    Subject_ID: 'SUB_04',
    Subject_Name: 'Computer Networks',
    Subject_Type: 'Theory',
    Hours_Per_Week: 3,
    Credits: 3,
  },
  {
    Subject_ID: 'SUB_05',
    Subject_Name: 'Computer Networks Lab',
    Subject_Type: 'Practical',
    Hours_Per_Week: 2,
    Credits: 1,
    Requires_Lab: true,
  },
  {
    Subject_ID: 'SUB_06',
    Subject_Name: 'Artificial Intelligence',
    Subject_Type: 'Theory',
    Hours_Per_Week: 3,
    Credits: 3,
  },
  {
    Subject_ID: 'SUB_07',
    Subject_Name: 'AI & Data Science Lab',
    Subject_Type: 'Practical',
    Hours_Per_Week: 2,
    Credits: 1,
    Requires_Lab: true,
  },
  {
    Subject_ID: 'SUB_08',
    Subject_Name: 'Cloud Computing Architecture',
    Subject_Type: 'Elective',
    Hours_Per_Week: 3,
    Credits: 3,
  },
];

export const initialBatches: Batch[] = [
  {
    Batch_ID: 'BAT_01',
    Division: 'TY IT - Div A',
    Year: 3,
    Strength: 72,
    Department: 'Information Technology',
  },
  {
    Batch_ID: 'BAT_02',
    Division: 'TY IT - Div B',
    Year: 3,
    Strength: 70,
    Department: 'Information Technology',
  },
  {
    Batch_ID: 'BAT_03',
    Division: 'SY IT - Div A',
    Year: 2,
    Strength: 75,
    Department: 'Information Technology',
  },
];

export const initialRooms: Room[] = [
  {
    Room_ID: 'RM_01',
    Room_No: 'LH-101 (Main Building)',
    Room_Type: 'Lecture Hall',
    Capacity: 80,
  },
  {
    Room_ID: 'RM_02',
    Room_No: 'LH-102 (Main Building)',
    Room_Type: 'Lecture Hall',
    Capacity: 80,
  },
  {
    Room_ID: 'RM_03',
    Room_No: 'LH-201 (IT Block)',
    Room_Type: 'Lecture Hall',
    Capacity: 100,
  },
  {
    Room_ID: 'RM_04',
    Room_No: 'Lab-CC1 (Network & OS Lab)',
    Room_Type: 'Laboratory',
    Capacity: 40,
  },
  {
    Room_ID: 'RM_05',
    Room_No: 'Lab-CC2 (Database & Web Lab)',
    Room_Type: 'Laboratory',
    Capacity: 40,
  },
  {
    Room_ID: 'RM_06',
    Room_No: 'Lab-AI (High Perf Computing)',
    Room_Type: 'Laboratory',
    Capacity: 40,
  },
  {
    Room_ID: 'RM_07',
    Room_No: 'Seminar Hall SH-1',
    Room_Type: 'Seminar Room',
    Capacity: 120,
  },
];

export const DAYS: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const initialTimeSlots: TimeSlot[] = [
  // Period 1
  { Slot_ID: 'SLOT_M1', Day: 'Mon', Period_No: 1, Start_Time: '09:00', End_Time: '10:00' },
  { Slot_ID: 'SLOT_M2', Day: 'Mon', Period_No: 2, Start_Time: '10:00', End_Time: '11:00' },
  { Slot_ID: 'SLOT_M3', Day: 'Mon', Period_No: 3, Start_Time: '11:15', End_Time: '12:15' },
  { Slot_ID: 'SLOT_M4', Day: 'Mon', Period_No: 4, Start_Time: '12:15', End_Time: '13:15' },
  { Slot_ID: 'SLOT_M5', Day: 'Mon', Period_No: 5, Start_Time: '14:00', End_Time: '15:00' },
  { Slot_ID: 'SLOT_M6', Day: 'Mon', Period_No: 6, Start_Time: '15:00', End_Time: '16:00' },

  // Tue
  { Slot_ID: 'SLOT_T1', Day: 'Tue', Period_No: 1, Start_Time: '09:00', End_Time: '10:00' },
  { Slot_ID: 'SLOT_T2', Day: 'Tue', Period_No: 2, Start_Time: '10:00', End_Time: '11:00' },
  { Slot_ID: 'SLOT_T3', Day: 'Tue', Period_No: 3, Start_Time: '11:15', End_Time: '12:15' },
  { Slot_ID: 'SLOT_T4', Day: 'Tue', Period_No: 4, Start_Time: '12:15', End_Time: '13:15' },
  { Slot_ID: 'SLOT_T5', Day: 'Tue', Period_No: 5, Start_Time: '14:00', End_Time: '15:00' },
  { Slot_ID: 'SLOT_T6', Day: 'Tue', Period_No: 6, Start_Time: '15:00', End_Time: '16:00' },

  // Wed
  { Slot_ID: 'SLOT_W1', Day: 'Wed', Period_No: 1, Start_Time: '09:00', End_Time: '10:00' },
  { Slot_ID: 'SLOT_W2', Day: 'Wed', Period_No: 2, Start_Time: '10:00', End_Time: '11:00' },
  { Slot_ID: 'SLOT_W3', Day: 'Wed', Period_No: 3, Start_Time: '11:15', End_Time: '12:15' },
  { Slot_ID: 'SLOT_W4', Day: 'Wed', Period_No: 4, Start_Time: '12:15', End_Time: '13:15' },
  { Slot_ID: 'SLOT_W5', Day: 'Wed', Period_No: 5, Start_Time: '14:00', End_Time: '15:00' },
  { Slot_ID: 'SLOT_W6', Day: 'Wed', Period_No: 6, Start_Time: '15:00', End_Time: '16:00' },

  // Thu
  { Slot_ID: 'SLOT_TH1', Day: 'Thu', Period_No: 1, Start_Time: '09:00', End_Time: '10:00' },
  { Slot_ID: 'SLOT_TH2', Day: 'Thu', Period_No: 2, Start_Time: '10:00', End_Time: '11:00' },
  { Slot_ID: 'SLOT_TH3', Day: 'Thu', Period_No: 3, Start_Time: '11:15', End_Time: '12:15' },
  { Slot_ID: 'SLOT_TH4', Day: 'Thu', Period_No: 4, Start_Time: '12:15', End_Time: '13:15' },
  { Slot_ID: 'SLOT_TH5', Day: 'Thu', Period_No: 5, Start_Time: '14:00', End_Time: '15:00' },
  { Slot_ID: 'SLOT_TH6', Day: 'Thu', Period_No: 6, Start_Time: '15:00', End_Time: '16:00' },

  // Fri
  { Slot_ID: 'SLOT_F1', Day: 'Fri', Period_No: 1, Start_Time: '09:00', End_Time: '10:00' },
  { Slot_ID: 'SLOT_F2', Day: 'Fri', Period_No: 2, Start_Time: '10:00', End_Time: '11:00' },
  { Slot_ID: 'SLOT_F3', Day: 'Fri', Period_No: 3, Start_Time: '11:15', End_Time: '12:15' },
  { Slot_ID: 'SLOT_F4', Day: 'Fri', Period_No: 4, Start_Time: '12:15', End_Time: '13:15' },
  { Slot_ID: 'SLOT_F5', Day: 'Fri', Period_No: 5, Start_Time: '14:00', End_Time: '15:00' },
  { Slot_ID: 'SLOT_F6', Day: 'Fri', Period_No: 6, Start_Time: '15:00', End_Time: '16:00' },

  // Sat (half day)
  { Slot_ID: 'SLOT_S1', Day: 'Sat', Period_No: 1, Start_Time: '09:00', End_Time: '10:00' },
  { Slot_ID: 'SLOT_S2', Day: 'Sat', Period_No: 2, Start_Time: '10:00', End_Time: '11:00' },
  { Slot_ID: 'SLOT_S3', Day: 'Sat', Period_No: 3, Start_Time: '11:15', End_Time: '12:15' },
  { Slot_ID: 'SLOT_S4', Day: 'Sat', Period_No: 4, Start_Time: '12:15', End_Time: '13:15' },
];

export const initialFacultySubjects: FacultySubject[] = [
  { Faculty_ID: 'FAC_01', Subject_ID: 'SUB_01' }, // Dr. Phalle -> Software Eng
  { Faculty_ID: 'FAC_02', Subject_ID: 'SUB_02' }, // Prof. Patil -> DBMS
  { Faculty_ID: 'FAC_02', Subject_ID: 'SUB_03' }, // Prof. Patil -> DBMS Lab
  { Faculty_ID: 'FAC_03', Subject_ID: 'SUB_01' }, // Prof. Parekh -> Software Eng
  { Faculty_ID: 'FAC_03', Subject_ID: 'SUB_08' }, // Prof. Parekh -> Cloud Computing
  { Faculty_ID: 'FAC_04', Subject_ID: 'SUB_04' }, // Dr. Iyer -> Networks
  { Faculty_ID: 'FAC_04', Subject_ID: 'SUB_05' }, // Dr. Iyer -> Networks Lab
  { Faculty_ID: 'FAC_05', Subject_ID: 'SUB_06' }, // Prof. S. Patil -> AI
  { Faculty_ID: 'FAC_05', Subject_ID: 'SUB_07' }, // Prof. S. Patil -> AI Lab
  { Faculty_ID: 'FAC_06', Subject_ID: 'SUB_02' }, // Prof. Joshi -> DBMS (Alternate)
  { Faculty_ID: 'FAC_06', Subject_ID: 'SUB_03' }, // Prof. Joshi -> DBMS Lab (Alternate)
  { Faculty_ID: 'FAC_07', Subject_ID: 'SUB_04' }, // Prof. Prabhu -> Networks (Alternate)
  { Faculty_ID: 'FAC_07', Subject_ID: 'SUB_08' }, // Prof. Prabhu -> Cloud Computing
];

export const initialFacultyAvailability: FacultyAvailability[] = [
  // Dr. Iyer unavailable on Friday afternoon (SLOT_F5, SLOT_F6)
  { Faculty_ID: 'FAC_04', Slot_ID: 'SLOT_F5', Is_Available: false },
  { Faculty_ID: 'FAC_04', Slot_ID: 'SLOT_F6', Is_Available: false },
  // Dr. Phalle committee duty on Wednesday morning (SLOT_W1)
  { Faculty_ID: 'FAC_01', Slot_ID: 'SLOT_W1', Is_Available: false },
];

export const initialTimetable: Timetable = {
  Timetable_ID: 'TT_2026_ODD_01',
  Academic_Term: '2026–27 Odd Term',
  Version_No: 1,
  Status: 'Draft Generated',
  Created_By: 'USR_01',
  Created_On: '2026-10-10',
  Published_On: null,
};

// Initial populated sessions for TY IT - Div A & Div B
export const initialSessions: Session[] = [
  // Monday - Div A
  {
    Session_ID: 'SES_001',
    Timetable_ID: 'TT_2026_ODD_01',
    Subject_ID: 'SUB_01', // Software Eng
    Faculty_ID: 'FAC_01', // Dr. Phalle
    Batch_ID: 'BAT_01',   // TY IT - Div A
    Room_ID: 'RM_01',     // LH-101
    Slot_ID: 'SLOT_M1',
    Session_Type: 'Lecture',
  },
  {
    Session_ID: 'SES_002',
    Timetable_ID: 'TT_2026_ODD_01',
    Subject_ID: 'SUB_02', // DBMS
    Faculty_ID: 'FAC_02', // Prof. S.R. Patil
    Batch_ID: 'BAT_01',
    Room_ID: 'RM_01',
    Slot_ID: 'SLOT_M2',
    Session_Type: 'Lecture',
  },
  {
    Session_ID: 'SES_003',
    Timetable_ID: 'TT_2026_ODD_01',
    Subject_ID: 'SUB_04', // Networks
    Faculty_ID: 'FAC_04', // Dr. Iyer
    Batch_ID: 'BAT_01',
    Room_ID: 'RM_01',
    Slot_ID: 'SLOT_M3',
    Session_Type: 'Lecture',
  },
  {
    Session_ID: 'SES_004',
    Timetable_ID: 'TT_2026_ODD_01',
    Subject_ID: 'SUB_06', // AI
    Faculty_ID: 'FAC_05', // Prof. S.S. Patil
    Batch_ID: 'BAT_01',
    Room_ID: 'RM_01',
    Slot_ID: 'SLOT_M4',
    Session_Type: 'Lecture',
  },
  {
    Session_ID: 'SES_005',
    Timetable_ID: 'TT_2026_ODD_01',
    Subject_ID: 'SUB_03', // DBMS Lab
    Faculty_ID: 'FAC_02',
    Batch_ID: 'BAT_01',
    Room_ID: 'RM_05',     // Lab-CC2
    Slot_ID: 'SLOT_M5',
    Session_Type: 'Lab',
  },
  {
    Session_ID: 'SES_006',
    Timetable_ID: 'TT_2026_ODD_01',
    Subject_ID: 'SUB_03', // DBMS Lab slot 2
    Faculty_ID: 'FAC_02',
    Batch_ID: 'BAT_01',
    Room_ID: 'RM_05',
    Slot_ID: 'SLOT_M6',
    Session_Type: 'Lab',
  },

  // Tuesday - Div A
  {
    Session_ID: 'SES_007',
    Timetable_ID: 'TT_2026_ODD_01',
    Subject_ID: 'SUB_04', // Networks
    Faculty_ID: 'FAC_04',
    Batch_ID: 'BAT_01',
    Room_ID: 'RM_01',
    Slot_ID: 'SLOT_T1',
    Session_Type: 'Lecture',
  },
  {
    Session_ID: 'SES_008',
    Timetable_ID: 'TT_2026_ODD_01',
    Subject_ID: 'SUB_01', // Software Eng
    Faculty_ID: 'FAC_01',
    Batch_ID: 'BAT_01',
    Room_ID: 'RM_01',
    Slot_ID: 'SLOT_T2',
    Session_Type: 'Lecture',
  },
  {
    Session_ID: 'SES_009',
    Timetable_ID: 'TT_2026_ODD_01',
    Subject_ID: 'SUB_08', // Elective - Cloud Computing (Common)
    Faculty_ID: 'FAC_03',
    Batch_ID: 'BAT_01',
    Room_ID: 'RM_07',     // Seminar Hall
    Slot_ID: 'SLOT_T3',
    Session_Type: 'Lecture',
  },
  {
    Session_ID: 'SES_010',
    Timetable_ID: 'TT_2026_ODD_01',
    Subject_ID: 'SUB_02', // DBMS
    Faculty_ID: 'FAC_02',
    Batch_ID: 'BAT_01',
    Room_ID: 'RM_01',
    Slot_ID: 'SLOT_T4',
    Session_Type: 'Lecture',
  },

  // Wednesday - Div A
  {
    Session_ID: 'SES_011',
    Timetable_ID: 'TT_2026_ODD_01',
    Subject_ID: 'SUB_06', // AI
    Faculty_ID: 'FAC_05',
    Batch_ID: 'BAT_01',
    Room_ID: 'RM_01',
    Slot_ID: 'SLOT_W2',
    Session_Type: 'Lecture',
  },
  {
    Session_ID: 'SES_012',
    Timetable_ID: 'TT_2026_ODD_01',
    Subject_ID: 'SUB_01', // Software Eng
    Faculty_ID: 'FAC_01',
    Batch_ID: 'BAT_01',
    Room_ID: 'RM_01',
    Slot_ID: 'SLOT_W3',
    Session_Type: 'Lecture',
  },
  {
    Session_ID: 'SES_013',
    Timetable_ID: 'TT_2026_ODD_01',
    Subject_ID: 'SUB_05', // Networks Lab
    Faculty_ID: 'FAC_04',
    Batch_ID: 'BAT_01',
    Room_ID: 'RM_04',     // Lab-CC1
    Slot_ID: 'SLOT_W5',
    Session_Type: 'Lab',
  },
  {
    Session_ID: 'SES_014',
    Timetable_ID: 'TT_2026_ODD_01',
    Subject_ID: 'SUB_05', // Networks Lab slot 2
    Faculty_ID: 'FAC_04',
    Batch_ID: 'BAT_01',
    Room_ID: 'RM_04',
    Slot_ID: 'SLOT_W6',
    Session_Type: 'Lab',
  },

  // Monday - Div B (Parallel Sessions in Room LH-102)
  {
    Session_ID: 'SES_015',
    Timetable_ID: 'TT_2026_ODD_01',
    Subject_ID: 'SUB_02', // DBMS
    Faculty_ID: 'FAC_06', // Prof. Joshi
    Batch_ID: 'BAT_02',   // TY IT - Div B
    Room_ID: 'RM_02',     // LH-102
    Slot_ID: 'SLOT_M1',
    Session_Type: 'Lecture',
  },
  {
    Session_ID: 'SES_016',
    Timetable_ID: 'TT_2026_ODD_01',
    Subject_ID: 'SUB_01', // Software Eng
    Faculty_ID: 'FAC_03', // Prof. Parekh
    Batch_ID: 'BAT_02',
    Room_ID: 'RM_02',
    Slot_ID: 'SLOT_M2',
    Session_Type: 'Lecture',
  },
  {
    Session_ID: 'SES_017',
    Timetable_ID: 'TT_2026_ODD_01',
    Subject_ID: 'SUB_06', // AI
    Faculty_ID: 'FAC_05', // Prof. Patil
    Batch_ID: 'BAT_02',
    Room_ID: 'RM_02',
    Slot_ID: 'SLOT_M3',
    Session_Type: 'Lecture',
  },
];

export const initialLeaveRequests: LeaveRequest[] = [
  {
    Leave_ID: 'LEV_001',
    Faculty_ID: 'FAC_04', // Dr. Iyer
    From_Date: '2026-10-20',
    To_Date: '2026-10-20',
    Reason: 'Attending IEEE International Conference at IIT Bombay',
    Status: 'Reported',
  },
];

export const initialSubstitutions: Substitution[] = [
  {
    Sub_ID: 'SUB_REC_001',
    Leave_ID: 'LEV_001',
    Session_ID: 'SES_007', // Networks session on Tue Slot 1
    Substitute_Faculty_ID: 'FAC_07', // Prof. Prabhu (Eligible for Networks)
    Sub_Date: '2026-10-20',
    Action: 'Substituted',
    Status: 'Suggested',
  },
];

export const initialChangeLogs: ChangeLog[] = [
  {
    Log_ID: 'LOG_001',
    Timetable_ID: 'TT_2026_ODD_01',
    Change_Type: 'Generated',
    Description: 'Initial automated draft timetable generated by Constraint Engine v1.0',
    Reason: 'Semester kick-off timetable generation',
    Changed_By: 'Dr. V. M. Phalle',
    Changed_On: '2026-10-10 10:15:30',
  },
];

export const initialNotifications: Notification[] = [
  {
    Notif_ID: 'NOTIF_001',
    Log_ID: 'LOG_001',
    Recipient_ID: 'ALL_FACULTY',
    Message: 'Draft Timetable for 2026–27 Odd Term is now available for committee review.',
    Sent_On: '2026-10-10 10:20:00',
    Is_Read: false,
  },
];


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
    User_ID: 'u-coord',
    User_Name: 'Dr. V. M. Phalle (Coordinator)',
    Role: 'Coordinator',
    Password_Hash: '$2a$10$wN9aEaVbE.yF961o1F3nDeGkP0BlnRzI3aC2o.y1J5rYI06Xv8Mne',
    Email: 'coordinator@dummy.ttms.local',
  },
  {
    User_ID: 'u-pmc',
    User_Name: 'Prof. P. M. Chawan',
    Role: 'Faculty',
    Password_Hash: '$2a$10$wN9aEaVbE.yF961o1F3nDeGkP0BlnRzI3aC2o.y1J5rYI06Xv8Mne',
    Email: 'tanishparekh03@gmail.com',
  },
  {
    User_ID: 'u-rp',
    User_Name: 'Prof. Riddhi Patil',
    Role: 'Faculty',
    Password_Hash: '$2a$10$wN9aEaVbE.yF961o1F3nDeGkP0BlnRzI3aC2o.y1J5rYI06Xv8Mne',
    Email: 'rpatil@dummy.ttms.local',
  },
  {
    User_ID: 'u-stud',
    User_Name: 'Tanish Parekh (VJTI Student)',
    Role: 'Student',
    Password_Hash: '$2a$10$wN9aEaVbE.yF961o1F3nDeGkP0BlnRzI3aC2o.y1J5rYI06Xv8Mne',
    Email: 'tanishparekh59@gmail.com',
  },
];

// 31 Institutional Faculty from VJTI CE & IT Departments (Sanitized + 1 Real Whitelisted Email)
export const initialFaculty: Faculty[] = [
  { Faculty_ID: 'FAC-PMC', Faculty_Name: 'Prof. P. M. Chawan', Department: 'Computer Engineering', Max_Weekly_Load: 16, Email: 'tanishparekh03@gmail.com' },
  { Faculty_ID: 'FAC-VBN', Faculty_Name: 'Dr. V. B. Nikam', Department: 'Computer Engineering', Max_Weekly_Load: 14, Email: 'vbnikam@dummy.ttms.local' },
  { Faculty_ID: 'FAC-MRS', Faculty_Name: 'Dr. M. R. Shirole', Department: 'Computer Engineering', Max_Weekly_Load: 14, Email: 'mrshirole@dummy.ttms.local' },
  { Faculty_ID: 'FAC-MMC', Faculty_Name: 'Dr. M. M. Chandane', Department: 'Computer Engineering', Max_Weekly_Load: 16, Email: 'mmchandane@dummy.ttms.local' },
  { Faculty_ID: 'FAC-SCS', Faculty_Name: 'Prof. S. C. Shrawne', Department: 'Computer Engineering', Max_Weekly_Load: 16, Email: 'scshrawne@dummy.ttms.local' },
  { Faculty_ID: 'FAC-VKS', Faculty_Name: 'Dr. V. K. Sambhe', Department: 'Computer Engineering', Max_Weekly_Load: 14, Email: 'vksambhe@dummy.ttms.local' },
  { Faculty_ID: 'FAC-SSU', Faculty_Name: 'Dr. S. S. Udmale', Department: 'Computer Engineering', Max_Weekly_Load: 14, Email: 'ssudmale@dummy.ttms.local' },
  { Faculty_ID: 'FAC-STS', Faculty_Name: 'Dr. S. T. Shingade', Department: 'Computer Engineering', Max_Weekly_Load: 16, Email: 'stshingade@dummy.ttms.local' },
  { Faculty_ID: 'FAC-MUK', Faculty_Name: 'Prof. M. U. Kulkarni', Department: 'Computer Engineering', Max_Weekly_Load: 16, Email: 'mukulkarni@dummy.ttms.local' },
  { Faculty_ID: 'FAC-KKJ', Faculty_Name: 'Prof. K. K. Joshi', Department: 'Computer Engineering', Max_Weekly_Load: 16, Email: 'kkjoshi@dummy.ttms.local' },
  { Faculty_ID: 'FAC-VJN', Faculty_Name: 'Dr. Varshapriya J N', Department: 'Computer Engineering', Max_Weekly_Load: 14, Email: 'vjn@dummy.ttms.local' },
  { Faculty_ID: 'FAC-SSS', Faculty_Name: 'Dr. S. S. Suratkar', Department: 'Computer Engineering', Max_Weekly_Load: 14, Email: 'sssuratkar@dummy.ttms.local' },
  { Faculty_ID: 'FAC-VDD', Faculty_Name: 'Prof. V. D. Dhore', Department: 'Computer Engineering', Max_Weekly_Load: 16, Email: 'vddhore@dummy.ttms.local' },
  { Faculty_ID: 'FAC-SAK', Faculty_Name: 'Prof. S. A. Khedkar', Department: 'Computer Engineering', Max_Weekly_Load: 16, Email: 'sakhedkar@dummy.ttms.local' },
  { Faculty_ID: 'FAC-SSL', Faculty_Name: 'Prof. S. S. Lachure', Department: 'Computer Engineering', Max_Weekly_Load: 16, Email: 'sslachure@dummy.ttms.local' },
  { Faculty_ID: 'FAC-SGK', Faculty_Name: 'Dr. Sopan G. Kolte', Department: 'Computer Engineering', Max_Weekly_Load: 14, Email: 'sgkolte@dummy.ttms.local' },
  { Faculty_ID: 'FAC-NAS', Faculty_Name: 'Dr. Noshin A. Sabuwala', Department: 'Computer Engineering', Max_Weekly_Load: 14, Email: 'nasabuwala@dummy.ttms.local' },
  { Faculty_ID: 'FAC-NS',  Faculty_Name: 'Dr. Neha Singh', Department: 'Computer Engineering', Max_Weekly_Load: 14, Email: 'nsingh@dummy.ttms.local' },
  { Faculty_ID: 'FAC-RS',  Faculty_Name: 'Dr. Ritika Singh', Department: 'Computer Engineering', Max_Weekly_Load: 14, Email: 'rsingh@dummy.ttms.local' },
  { Faculty_ID: 'FAC-SB',  Faculty_Name: 'Prof. Shreekant Bedekar', Department: 'Computer Engineering', Max_Weekly_Load: 16, Email: 'sbedekar@dummy.ttms.local' },
  { Faculty_ID: 'FAC-IM',  Faculty_Name: 'Prof. Isaivani Mathiyalagam', Department: 'Information Technology', Max_Weekly_Load: 16, Email: 'imathiyalagam@dummy.ttms.local' },
  { Faculty_ID: 'FAC-PSS', Faculty_Name: 'Prof. Prachi S Shinde', Department: 'Information Technology', Max_Weekly_Load: 16, Email: 'psshinde@dummy.ttms.local' },
  { Faculty_ID: 'FAC-HCD', Faculty_Name: 'Prof. Harshala C Dalal', Department: 'Information Technology', Max_Weekly_Load: 16, Email: 'hcdalal@dummy.ttms.local' },
  { Faculty_ID: 'FAC-RP',  Faculty_Name: 'Prof. Riddhi Patil', Department: 'Information Technology', Max_Weekly_Load: 16, Email: 'rpatil@dummy.ttms.local' },
  { Faculty_ID: 'FAC-PS',  Faculty_Name: 'Prof. Prajakta Salunkhe', Department: 'Information Technology', Max_Weekly_Load: 16, Email: 'psalunkhe@dummy.ttms.local' },
  { Faculty_ID: 'FAC-AK',  Faculty_Name: 'Prof. Akhhil Kulal', Department: 'Information Technology', Max_Weekly_Load: 16, Email: 'akulal@dummy.ttms.local' },
  { Faculty_ID: 'FAC-AM',  Faculty_Name: 'Prof. Akshay Mhalaskar', Department: 'Information Technology', Max_Weekly_Load: 16, Email: 'amhalaskar@dummy.ttms.local' },
  { Faculty_ID: 'FAC-PV',  Faculty_Name: 'Prof. Pragati Vaishnav', Department: 'Information Technology', Max_Weekly_Load: 16, Email: 'pvaishnav@dummy.ttms.local' },
  { Faculty_ID: 'FAC-SD',  Faculty_Name: 'Prof. Saurabh Dalvi', Department: 'Information Technology', Max_Weekly_Load: 16, Email: 'sdalvi@dummy.ttms.local' },
  { Faculty_ID: 'FAC-MKS', Faculty_Name: 'Prof. Mandar K. Sase', Department: 'Information Technology', Max_Weekly_Load: 16, Email: 'msase@dummy.ttms.local' },
  { Faculty_ID: 'FAC-AN',  Faculty_Name: 'Prof. Ankit Nimbolkar', Department: 'Information Technology', Max_Weekly_Load: 16, Email: 'animbolkar@dummy.ttms.local' },
];

// 56 Accredited Subjects across SY, TY, Final Year B.Tech CE & IT
export const initialSubjects: Subject[] = [
  // Final B.Tech
  { Subject_ID: 'SUB-OEII',     Subject_Name: 'Open Elective II', Subject_Type: 'Elective', Hours_Per_Week: 3, Credits: 3, Requires_Lab: false },
  { Subject_ID: 'SUB-DM-BTECH', Subject_Name: 'Data Management', Subject_Type: 'Theory', Hours_Per_Week: 3, Credits: 3, Requires_Lab: false },
  { Subject_ID: 'SUB-PANS',     Subject_Name: 'PE III: Predictive Analytics & Network Security', Subject_Type: 'Elective', Hours_Per_Week: 3, Credits: 3, Requires_Lab: false },
  { Subject_ID: 'SUB-ST',       Subject_Name: 'PE III: Software Testing', Subject_Type: 'Elective', Hours_Per_Week: 3, Credits: 3, Requires_Lab: false },
  { Subject_ID: 'SUB-DL',       Subject_Name: 'PE IV: Deep Learning', Subject_Type: 'Elective', Hours_Per_Week: 3, Credits: 3, Requires_Lab: false },
  { Subject_ID: 'SUB-QC',       Subject_Name: 'PE IV: Quantum Computing', Subject_Type: 'Elective', Hours_Per_Week: 3, Credits: 3, Requires_Lab: false },
  { Subject_ID: 'SUB-MDMV-DS',  Subject_Name: 'MDM V: Data Science', Subject_Type: 'Theory', Hours_Per_Week: 3, Credits: 3, Requires_Lab: false },
  { Subject_ID: 'SUB-MDMV-AI',  Subject_Name: 'MDM V: AIML', Subject_Type: 'Theory', Hours_Per_Week: 3, Credits: 3, Requires_Lab: false },
  { Subject_ID: 'SUB-CPAD-LAB', Subject_Name: 'Cross Platform App Development Lab', Subject_Type: 'Practical', Hours_Per_Week: 2, Credits: 1, Requires_Lab: true },
  { Subject_ID: 'SUB-PANS-LAB', Subject_Name: 'PE III: PANS Lab', Subject_Type: 'Practical', Hours_Per_Week: 2, Credits: 1, Requires_Lab: true },
  { Subject_ID: 'SUB-ST-LAB',   Subject_Name: 'PE III: ST Lab', Subject_Type: 'Practical', Hours_Per_Week: 2, Credits: 1, Requires_Lab: true },
  { Subject_ID: 'SUB-DL-LAB',   Subject_Name: 'PE IV: DL Lab', Subject_Type: 'Practical', Hours_Per_Week: 2, Credits: 1, Requires_Lab: true },
  { Subject_ID: 'SUB-QC-LAB',   Subject_Name: 'PE IV: QC Lab', Subject_Type: 'Practical', Hours_Per_Week: 2, Credits: 1, Requires_Lab: true },
  { Subject_ID: 'SUB-HON-BC',   Subject_Name: 'Honors: Blockchain', Subject_Type: 'Theory', Hours_Per_Week: 3, Credits: 3, Requires_Lab: false },
  { Subject_ID: 'SUB-HON-ARVR', Subject_Name: 'Honors: AR/VR', Subject_Type: 'Theory', Hours_Per_Week: 3, Credits: 3, Requires_Lab: false },
  { Subject_ID: 'SUB-PROJECT',  Subject_Name: 'Major Project', Subject_Type: 'Practical', Hours_Per_Week: 4, Credits: 2, Requires_Lab: false },

  // TY B.Tech (CE)
  { Subject_ID: 'SUB-CC-CE',     Subject_Name: 'Compiler Construction', Subject_Type: 'Theory', Hours_Per_Week: 3, Credits: 3, Requires_Lab: false },
  { Subject_ID: 'SUB-ML-CE',     Subject_Name: 'Machine Learning (CE)', Subject_Type: 'Theory', Hours_Per_Week: 3, Credits: 3, Requires_Lab: false },
  { Subject_ID: 'SUB-CN-CE',     Subject_Name: 'Computer Networks (CE)', Subject_Type: 'Theory', Hours_Per_Week: 3, Credits: 3, Requires_Lab: false },
  { Subject_ID: 'SUB-PC-CE',     Subject_Name: 'Parallel Computing (CE)', Subject_Type: 'Theory', Hours_Per_Week: 3, Credits: 3, Requires_Lab: false },
  { Subject_ID: 'SUB-HCI-CE',    Subject_Name: 'Human Computer Interaction', Subject_Type: 'Theory', Hours_Per_Week: 2, Credits: 2, Requires_Lab: false },
  { Subject_ID: 'SUB-MDM3-ML',   Subject_Name: 'MDM III: ML with Python', Subject_Type: 'Theory', Hours_Per_Week: 3, Credits: 3, Requires_Lab: false },
  { Subject_ID: 'SUB-PE1-IP',    Subject_Name: 'PE I: Image Processing', Subject_Type: 'Elective', Hours_Per_Week: 3, Credits: 3, Requires_Lab: false },
  { Subject_ID: 'SUB-PE1-OT',    Subject_Name: 'PE I: Optimization Techniques', Subject_Type: 'Elective', Hours_Per_Week: 3, Credits: 3, Requires_Lab: false },
  { Subject_ID: 'SUB-ML-LAB-CE', Subject_Name: 'Machine Learning Lab (CE)', Subject_Type: 'Practical', Hours_Per_Week: 2, Credits: 1, Requires_Lab: true },
  { Subject_ID: 'SUB-CN-LAB-CE', Subject_Name: 'Computer Network Lab (CE)', Subject_Type: 'Practical', Hours_Per_Week: 2, Credits: 1, Requires_Lab: true },
  { Subject_ID: 'SUB-PC-LAB-CE', Subject_Name: 'Parallel Programming Lab (CE)', Subject_Type: 'Practical', Hours_Per_Week: 2, Credits: 1, Requires_Lab: true },

  // TY B.Tech (IT)
  { Subject_ID: 'SUB-ML-IT',     Subject_Name: 'Machine Learning (IT)', Subject_Type: 'Theory', Hours_Per_Week: 3, Credits: 3, Requires_Lab: false },
  { Subject_ID: 'SUB-SE-IT',     Subject_Name: 'Software Engineering', Subject_Type: 'Theory', Hours_Per_Week: 3, Credits: 3, Requires_Lab: false },
  { Subject_ID: 'SUB-PC-IT',     Subject_Name: 'Parallel Computing (IT)', Subject_Type: 'Theory', Hours_Per_Week: 3, Credits: 3, Requires_Lab: false },
  { Subject_ID: 'SUB-CC-IT',     Subject_Name: 'Cloud Computing', Subject_Type: 'Theory', Hours_Per_Week: 3, Credits: 3, Requires_Lab: false },
  { Subject_ID: 'SUB-CY-IT',     Subject_Name: 'Cryptography', Subject_Type: 'Theory', Hours_Per_Week: 2, Credits: 2, Requires_Lab: false },
  { Subject_ID: 'SUB-MDM3-DLNN', Subject_Name: 'MDM III: DLNN', Subject_Type: 'Theory', Hours_Per_Week: 3, Credits: 3, Requires_Lab: false },
  { Subject_ID: 'SUB-PE1-HCI',   Subject_Name: 'PE I: HCI (IT)', Subject_Type: 'Elective', Hours_Per_Week: 3, Credits: 3, Requires_Lab: false },
  { Subject_ID: 'SUB-ML-LAB-IT', Subject_Name: 'Machine Learning Lab (IT)', Subject_Type: 'Practical', Hours_Per_Week: 2, Credits: 1, Requires_Lab: true },
  { Subject_ID: 'SUB-SE-LAB-IT', Subject_Name: 'Software Engineering Lab (IT)', Subject_Type: 'Practical', Hours_Per_Week: 2, Credits: 1, Requires_Lab: true },
  { Subject_ID: 'SUB-PP-LAB-IT', Subject_Name: 'Parallel Programming Lab (IT)', Subject_Type: 'Practical', Hours_Per_Week: 2, Credits: 1, Requires_Lab: true },

  // SY B.Tech
  { Subject_ID: 'SUB-MCE',       Subject_Name: 'Mathematics for Computer Engineers', Subject_Type: 'Theory', Hours_Per_Week: 3, Credits: 3, Requires_Lab: false },
  { Subject_ID: 'SUB-DS-CE',     Subject_Name: 'Discrete Structure', Subject_Type: 'Theory', Hours_Per_Week: 4, Credits: 4, Requires_Lab: false },
  { Subject_ID: 'SUB-DAA-CE',    Subject_Name: 'Design & Analysis of Algorithm (CE)', Subject_Type: 'Theory', Hours_Per_Week: 3, Credits: 3, Requires_Lab: false },
  { Subject_ID: 'SUB-OS-CE',     Subject_Name: 'Operating System (CE)', Subject_Type: 'Theory', Hours_Per_Week: 3, Credits: 3, Requires_Lab: false },
  { Subject_ID: 'SUB-MDM1-DS',   Subject_Name: 'MDM I: Data Science', Subject_Type: 'Theory', Hours_Per_Week: 2, Credits: 2, Requires_Lab: false },
  { Subject_ID: 'SUB-ALGO-LAB-CE', Subject_Name: 'Algorithm Lab (CE)', Subject_Type: 'Practical', Hours_Per_Week: 2, Credits: 1, Requires_Lab: true },
  { Subject_ID: 'SUB-OS-LAB-CE', Subject_Name: 'Operating System Lab (CE)', Subject_Type: 'Practical', Hours_Per_Week: 2, Credits: 1, Requires_Lab: true },
  { Subject_ID: 'SUB-PDL-LAB-CE', Subject_Name: 'Program Development Lab (CE)', Subject_Type: 'Practical', Hours_Per_Week: 2, Credits: 1, Requires_Lab: true },
  { Subject_ID: 'SUB-OST-LAB-CE', Subject_Name: 'Open Source Technology Lab (CE)', Subject_Type: 'Practical', Hours_Per_Week: 2, Credits: 1, Requires_Lab: true },
  { Subject_ID: 'SUB-DM-IT',     Subject_Name: 'Discrete Mathematics (IT)', Subject_Type: 'Theory', Hours_Per_Week: 4, Credits: 4, Requires_Lab: false },
  { Subject_ID: 'SUB-DAA-IT',    Subject_Name: 'Design & Analysis of Algorithm (IT)', Subject_Type: 'Theory', Hours_Per_Week: 3, Credits: 3, Requires_Lab: false },
  { Subject_ID: 'SUB-OS-IT',     Subject_Name: 'Operating System (IT)', Subject_Type: 'Theory', Hours_Per_Week: 3, Credits: 3, Requires_Lab: false },
  { Subject_ID: 'SUB-MDM1-AIML', Subject_Name: 'MDM I: AIML', Subject_Type: 'Theory', Hours_Per_Week: 2, Credits: 2, Requires_Lab: false },
  { Subject_ID: 'SUB-ALGO-LAB-IT', Subject_Name: 'Algorithm Lab (IT)', Subject_Type: 'Practical', Hours_Per_Week: 2, Credits: 1, Requires_Lab: true },
  { Subject_ID: 'SUB-OS-LAB-IT', Subject_Name: 'Operating System Lab (IT)', Subject_Type: 'Practical', Hours_Per_Week: 2, Credits: 1, Requires_Lab: true },
  { Subject_ID: 'SUB-PDL-LAB-IT', Subject_Name: 'Program Development Lab (IT)', Subject_Type: 'Practical', Hours_Per_Week: 2, Credits: 1, Requires_Lab: true },
  { Subject_ID: 'SUB-OST-LAB-IT', Subject_Name: 'Open Source Technology Lab (IT)', Subject_Type: 'Practical', Hours_Per_Week: 2, Credits: 1, Requires_Lab: true },
  { Subject_ID: 'SUB-MIL',       Subject_Name: 'Modern Indian Languages', Subject_Type: 'Theory', Hours_Per_Week: 2, Credits: 2, Requires_Lab: false },
  { Subject_ID: 'SUB-UHV',       Subject_Name: 'Universal Human Values', Subject_Type: 'Theory', Hours_Per_Week: 2, Credits: 2, Requires_Lab: false },
];

// 6 Student Divisions / Batches
export const initialBatches: Batch[] = [
  { Batch_ID: 'BATCH-BTECH-CE', Division: 'B.Tech CE (Final Year)', Year: 4, Strength: 75, Department: 'Computer Engineering' },
  { Batch_ID: 'BATCH-BTECH-IT', Division: 'B.Tech IT (Final Year)', Year: 4, Strength: 75, Department: 'Information Technology' },
  { Batch_ID: 'BATCH-TY-CE',    Division: 'TY B.Tech (CE)', Year: 3, Strength: 72, Department: 'Computer Engineering' },
  { Batch_ID: 'BATCH-TY-IT',    Division: 'TY B.Tech (IT)', Year: 3, Strength: 70, Department: 'Information Technology' },
  { Batch_ID: 'BATCH-SY-CE',    Division: 'SY B.Tech (CE)', Year: 2, Strength: 74, Department: 'Computer Engineering' },
  { Batch_ID: 'BATCH-SY-IT',    Division: 'SY B.Tech (IT)', Year: 2, Strength: 72, Department: 'Information Technology' },
];

// 18 Physical Rooms & Laboratories from VJTI Campus
export const initialRooms: Room[] = [
  { Room_ID: 'RM-AL001', Room_No: 'AL 001', Room_Type: 'Lecture Hall', Capacity: 80 },
  { Room_ID: 'RM-AL004', Room_No: 'AL 004', Room_Type: 'Lecture Hall', Capacity: 80 },
  { Room_ID: 'RM-AL201', Room_No: 'AL 201', Room_Type: 'Lecture Hall', Capacity: 80 },
  { Room_ID: 'RM-AL202', Room_No: 'AL 202', Room_Type: 'Lecture Hall', Capacity: 80 },
  { Room_ID: 'RM-AL207', Room_No: 'AL 207', Room_Type: 'Lecture Hall', Capacity: 80 },
  { Room_ID: 'RM-AL302', Room_No: 'AL 302', Room_Type: 'Lecture Hall', Capacity: 80 },
  { Room_ID: 'RM-LAB1A', Room_No: 'Lab 1A', Room_Type: 'Laboratory', Capacity: 40 },
  { Room_ID: 'RM-LAB1B', Room_No: 'Lab 1B', Room_Type: 'Laboratory', Capacity: 40 },
  { Room_ID: 'RM-LABIL', Room_No: 'Lab IL', Room_Type: 'Laboratory', Capacity: 40 },
  { Room_ID: 'RM-LAB2A', Room_No: 'Lab 2A', Room_Type: 'Laboratory', Capacity: 40 },
  { Room_ID: 'RM-LAB2B', Room_No: 'Lab 2B', Room_Type: 'Laboratory', Capacity: 40 },
  { Room_ID: 'RM-LAB2C', Room_No: 'Lab 2C', Room_Type: 'Laboratory', Capacity: 40 },
  { Room_ID: 'RM-LAB3A', Room_No: 'Lab 3A', Room_Type: 'Laboratory', Capacity: 40 },
  { Room_ID: 'RM-LAB3B', Room_No: 'Lab 3B', Room_Type: 'Laboratory', Capacity: 40 },
  { Room_ID: 'RM-LABNL', Room_No: 'Networking Lab (NL)', Room_Type: 'Laboratory', Capacity: 40 },
  { Room_ID: 'RM-INTERNET', Room_No: 'Internet Lab', Room_Type: 'Laboratory', Capacity: 60 },
  { Room_ID: 'RM-ARVR',  Room_No: 'AR/VR Lab', Room_Type: 'Laboratory', Capacity: 40 },
  { Room_ID: 'RM-DL003', Room_No: 'DL 003 Seminar Room', Room_Type: 'Seminar Room', Capacity: 60 },
];

export const DAYS: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Standard VJTI Daily Period Slot Structure (Periods 1 to 7)
export const initialTimeSlots: TimeSlot[] = [
  // Monday
  { Slot_ID: 'SLOT-MON-1', Day: 'Mon', Period_No: 1, Start_Time: '08:30', End_Time: '09:25' },
  { Slot_ID: 'SLOT-MON-2', Day: 'Mon', Period_No: 2, Start_Time: '09:30', End_Time: '10:25' },
  { Slot_ID: 'SLOT-MON-3', Day: 'Mon', Period_No: 3, Start_Time: '10:30', End_Time: '11:25' },
  { Slot_ID: 'SLOT-MON-4', Day: 'Mon', Period_No: 4, Start_Time: '11:30', End_Time: '12:25' },
  { Slot_ID: 'SLOT-MON-5', Day: 'Mon', Period_No: 5, Start_Time: '12:30', End_Time: '13:25' },
  { Slot_ID: 'SLOT-MON-6', Day: 'Mon', Period_No: 6, Start_Time: '13:30', End_Time: '14:25' },
  { Slot_ID: 'SLOT-MON-7', Day: 'Mon', Period_No: 7, Start_Time: '14:30', End_Time: '15:25' },

  // Tuesday
  { Slot_ID: 'SLOT-TUE-1', Day: 'Tue', Period_No: 1, Start_Time: '08:30', End_Time: '09:25' },
  { Slot_ID: 'SLOT-TUE-2', Day: 'Tue', Period_No: 2, Start_Time: '09:30', End_Time: '10:25' },
  { Slot_ID: 'SLOT-TUE-3', Day: 'Tue', Period_No: 3, Start_Time: '10:30', End_Time: '11:25' },
  { Slot_ID: 'SLOT-TUE-4', Day: 'Tue', Period_No: 4, Start_Time: '11:30', End_Time: '12:25' },
  { Slot_ID: 'SLOT-TUE-5', Day: 'Tue', Period_No: 5, Start_Time: '12:30', End_Time: '13:25' },
  { Slot_ID: 'SLOT-TUE-6', Day: 'Tue', Period_No: 6, Start_Time: '13:30', End_Time: '14:25' },
  { Slot_ID: 'SLOT-TUE-7', Day: 'Tue', Period_No: 7, Start_Time: '14:30', End_Time: '15:25' },

  // Wednesday
  { Slot_ID: 'SLOT-WED-1', Day: 'Wed', Period_No: 1, Start_Time: '08:30', End_Time: '09:25' },
  { Slot_ID: 'SLOT-WED-2', Day: 'Wed', Period_No: 2, Start_Time: '09:30', End_Time: '10:25' },
  { Slot_ID: 'SLOT-WED-3', Day: 'Wed', Period_No: 3, Start_Time: '10:30', End_Time: '11:25' },
  { Slot_ID: 'SLOT-WED-4', Day: 'Wed', Period_No: 4, Start_Time: '11:30', End_Time: '12:25' },
  { Slot_ID: 'SLOT-WED-5', Day: 'Wed', Period_No: 5, Start_Time: '12:30', End_Time: '13:25' },
  { Slot_ID: 'SLOT-WED-6', Day: 'Wed', Period_No: 6, Start_Time: '13:30', End_Time: '14:25' },
  { Slot_ID: 'SLOT-WED-7', Day: 'Wed', Period_No: 7, Start_Time: '14:30', End_Time: '15:25' },

  // Thursday
  { Slot_ID: 'SLOT-THU-1', Day: 'Thu', Period_No: 1, Start_Time: '08:30', End_Time: '09:25' },
  { Slot_ID: 'SLOT-THU-2', Day: 'Thu', Period_No: 2, Start_Time: '09:30', End_Time: '10:25' },
  { Slot_ID: 'SLOT-THU-3', Day: 'Thu', Period_No: 3, Start_Time: '10:30', End_Time: '11:25' },
  { Slot_ID: 'SLOT-THU-4', Day: 'Thu', Period_No: 4, Start_Time: '11:30', End_Time: '12:25' },
  { Slot_ID: 'SLOT-THU-5', Day: 'Thu', Period_No: 5, Start_Time: '12:30', End_Time: '13:25' },
  { Slot_ID: 'SLOT-THU-6', Day: 'Thu', Period_No: 6, Start_Time: '13:30', End_Time: '14:25' },
  { Slot_ID: 'SLOT-THU-7', Day: 'Thu', Period_No: 7, Start_Time: '14:30', End_Time: '15:25' },

  // Friday
  { Slot_ID: 'SLOT-FRI-1', Day: 'Fri', Period_No: 1, Start_Time: '08:30', End_Time: '09:25' },
  { Slot_ID: 'SLOT-FRI-2', Day: 'Fri', Period_No: 2, Start_Time: '09:30', End_Time: '10:25' },
  { Slot_ID: 'SLOT-FRI-3', Day: 'Fri', Period_No: 3, Start_Time: '10:30', End_Time: '11:25' },
  { Slot_ID: 'SLOT-FRI-4', Day: 'Fri', Period_No: 4, Start_Time: '11:30', End_Time: '12:25' },
  { Slot_ID: 'SLOT-FRI-5', Day: 'Fri', Period_No: 5, Start_Time: '12:30', End_Time: '13:25' },
  { Slot_ID: 'SLOT-FRI-6', Day: 'Fri', Period_No: 6, Start_Time: '13:30', End_Time: '14:25' },
  { Slot_ID: 'SLOT-FRI-7', Day: 'Fri', Period_No: 7, Start_Time: '14:30', End_Time: '15:25' },

  // Saturday (Half day)
  { Slot_ID: 'SLOT-SAT-1', Day: 'Sat', Period_No: 1, Start_Time: '08:30', End_Time: '09:25' },
  { Slot_ID: 'SLOT-SAT-2', Day: 'Sat', Period_No: 2, Start_Time: '09:30', End_Time: '10:25' },
  { Slot_ID: 'SLOT-SAT-3', Day: 'Sat', Period_No: 3, Start_Time: '10:30', End_Time: '11:25' },
  { Slot_ID: 'SLOT-SAT-4', Day: 'Sat', Period_No: 4, Start_Time: '11:30', End_Time: '12:25' },
];

// Real Faculty-Subject Eligibility across all 31 Institutional Faculty members
export const initialFacultySubjects: FacultySubject[] = [
  // Final Year B.Tech Subjects
  { Faculty_ID: 'FAC-RP',  Subject_ID: 'SUB-DM-BTECH' },
  { Faculty_ID: 'FAC-RS',  Subject_ID: 'SUB-DM-BTECH' },
  { Faculty_ID: 'FAC-NS',  Subject_ID: 'SUB-DM-BTECH' },
  { Faculty_ID: 'FAC-VJN', Subject_ID: 'SUB-PANS' },
  { Faculty_ID: 'FAC-VJN', Subject_ID: 'SUB-PANS-LAB' },
  { Faculty_ID: 'FAC-SB',  Subject_ID: 'SUB-ST' },
  { Faculty_ID: 'FAC-SB',  Subject_ID: 'SUB-ST-LAB' },
  { Faculty_ID: 'FAC-HCD', Subject_ID: 'SUB-DL' },
  { Faculty_ID: 'FAC-HCD', Subject_ID: 'SUB-DL-LAB' },
  { Faculty_ID: 'FAC-AK',  Subject_ID: 'SUB-DL' },
  { Faculty_ID: 'FAC-AK',  Subject_ID: 'SUB-DL-LAB' },
  { Faculty_ID: 'FAC-STS', Subject_ID: 'SUB-QC' },
  { Faculty_ID: 'FAC-STS', Subject_ID: 'SUB-QC-LAB' },
  { Faculty_ID: 'FAC-PV',  Subject_ID: 'SUB-MDMV-DS' },
  { Faculty_ID: 'FAC-PV',  Subject_ID: 'SUB-CPAD-LAB' },
  { Faculty_ID: 'FAC-PV',  Subject_ID: 'SUB-OEII' },
  { Faculty_ID: 'FAC-AM',  Subject_ID: 'SUB-CPAD-LAB' },
  { Faculty_ID: 'FAC-AM',  Subject_ID: 'SUB-HON-BC' },
  { Faculty_ID: 'FAC-SSL', Subject_ID: 'SUB-HON-ARVR' },
  { Faculty_ID: 'FAC-PS',  Subject_ID: 'SUB-MDMV-AI' },
  { Faculty_ID: 'FAC-PMC', Subject_ID: 'SUB-PROJECT' },

  // TY B.Tech CE Subjects
  { Faculty_ID: 'FAC-AN',  Subject_ID: 'SUB-CC-CE' },
  { Faculty_ID: 'FAC-SCS', Subject_ID: 'SUB-ML-CE' },
  { Faculty_ID: 'FAC-SCS', Subject_ID: 'SUB-ML-LAB-CE' },
  { Faculty_ID: 'FAC-MMC', Subject_ID: 'SUB-CN-CE' },
  { Faculty_ID: 'FAC-MMC', Subject_ID: 'SUB-CN-LAB-CE' },
  { Faculty_ID: 'FAC-MKS', Subject_ID: 'SUB-PC-CE' },
  { Faculty_ID: 'FAC-MKS', Subject_ID: 'SUB-PC-LAB-CE' },
  { Faculty_ID: 'FAC-SSS', Subject_ID: 'SUB-HCI-CE' },
  { Faculty_ID: 'FAC-SSU', Subject_ID: 'SUB-MDM3-ML' },
  { Faculty_ID: 'FAC-VKS', Subject_ID: 'SUB-PE1-IP' },
  { Faculty_ID: 'FAC-KKJ', Subject_ID: 'SUB-PE1-OT' },

  // TY B.Tech IT Subjects
  { Faculty_ID: 'FAC-IM',  Subject_ID: 'SUB-ML-IT' },
  { Faculty_ID: 'FAC-IM',  Subject_ID: 'SUB-ML-LAB-IT' },
  { Faculty_ID: 'FAC-MRS', Subject_ID: 'SUB-SE-IT' },
  { Faculty_ID: 'FAC-PS',  Subject_ID: 'SUB-SE-LAB-IT' },
  { Faculty_ID: 'FAC-PSS', Subject_ID: 'SUB-PC-IT' },
  { Faculty_ID: 'FAC-PSS', Subject_ID: 'SUB-PP-LAB-IT' },
  { Faculty_ID: 'FAC-VBN', Subject_ID: 'SUB-CC-IT' },
  { Faculty_ID: 'FAC-PS',  Subject_ID: 'SUB-CY-IT' },
  { Faculty_ID: 'FAC-IM',  Subject_ID: 'SUB-MDM3-DLNN' },
  { Faculty_ID: 'FAC-AK',  Subject_ID: 'SUB-PE1-HCI' },

  // SY B.Tech CE Subjects
  { Faculty_ID: 'FAC-SGK', Subject_ID: 'SUB-MCE' },
  { Faculty_ID: 'FAC-NAS', Subject_ID: 'SUB-DS-CE' },
  { Faculty_ID: 'FAC-MUK', Subject_ID: 'SUB-DAA-CE' },
  { Faculty_ID: 'FAC-MUK', Subject_ID: 'SUB-ALGO-LAB-CE' },
  { Faculty_ID: 'FAC-VDD', Subject_ID: 'SUB-OS-CE' },
  { Faculty_ID: 'FAC-VDD', Subject_ID: 'SUB-OS-LAB-CE' },
  { Faculty_ID: 'FAC-SAK', Subject_ID: 'SUB-MDM1-DS' },
  { Faculty_ID: 'FAC-SD',  Subject_ID: 'SUB-PDL-LAB-CE' },
  { Faculty_ID: 'FAC-SSS', Subject_ID: 'SUB-OST-LAB-CE' },
  { Faculty_ID: 'FAC-NS',  Subject_ID: 'SUB-MIL' },
  { Faculty_ID: 'FAC-SGK', Subject_ID: 'SUB-UHV' },

  // SY B.Tech IT Subjects
  { Faculty_ID: 'FAC-SAK', Subject_ID: 'SUB-MCE' },
  { Faculty_ID: 'FAC-RP',  Subject_ID: 'SUB-DM-IT' },
  { Faculty_ID: 'FAC-SSL', Subject_ID: 'SUB-DAA-IT' },
  { Faculty_ID: 'FAC-SSL', Subject_ID: 'SUB-ALGO-LAB-IT' },
  { Faculty_ID: 'FAC-SD',  Subject_ID: 'SUB-OS-IT' },
  { Faculty_ID: 'FAC-SD',  Subject_ID: 'SUB-OS-LAB-IT' },
  { Faculty_ID: 'FAC-SAK', Subject_ID: 'SUB-MDM1-AIML' },
  { Faculty_ID: 'FAC-RP',  Subject_ID: 'SUB-PDL-LAB-IT' },
  { Faculty_ID: 'FAC-PSS', Subject_ID: 'SUB-OST-LAB-IT' },
  { Faculty_ID: 'FAC-SSL', Subject_ID: 'SUB-MIL' },
  { Faculty_ID: 'FAC-NS',  Subject_ID: 'SUB-UHV' },
];

export const initialFacultyAvailability: FacultyAvailability[] = [
  // Prof. Riddhi Patil on administrative duty Friday Period 6
  { Faculty_ID: 'FAC-RP', Slot_ID: 'SLOT-FRI-6', Is_Available: false },
  // Dr. Varshapriya J N on committee meeting Wednesday Period 1
  { Faculty_ID: 'FAC-VJN', Slot_ID: 'SLOT-WED-1', Is_Available: false },
];

export const initialTimetable: Timetable = {
  Timetable_ID: 'TT-2026-ODD',
  Academic_Term: 'AY 2026–27 ODD Semester',
  Version_No: 1,
  Status: 'Published',
  Created_By: 'u-coord',
  Created_On: '2026-07-13',
  Published_On: '2026-07-15',
};

// Real Institutional Schedule Entries from VJTI CE & IT Timetable (SY, TY, Final B.Tech)
export const initialSessions: Session[] = [
  // ---------------------------------------------------------
  // Final Year B.Tech CE (Room AL 202 & Labs)
  // ---------------------------------------------------------
  {
    Session_ID: 'SES-BTECH-01',
    Timetable_ID: 'TT-2026-ODD',
    Subject_ID: 'SUB-CPAD-LAB',
    Faculty_ID: 'FAC-PV',
    Batch_ID: 'BATCH-BTECH-CE',
    Room_ID: 'RM-LAB1A',
    Slot_ID: 'SLOT-MON-2',
    Session_Type: 'Lab',
  },
  {
    Session_ID: 'SES-BTECH-02',
    Timetable_ID: 'TT-2026-ODD',
    Subject_ID: 'SUB-CPAD-LAB',
    Faculty_ID: 'FAC-PV',
    Batch_ID: 'BATCH-BTECH-CE',
    Room_ID: 'RM-LAB1A',
    Slot_ID: 'SLOT-MON-3',
    Session_Type: 'Lab',
  },
  {
    Session_ID: 'SES-BTECH-03',
    Timetable_ID: 'TT-2026-ODD',
    Subject_ID: 'SUB-PANS',
    Faculty_ID: 'FAC-VJN',
    Batch_ID: 'BATCH-BTECH-CE',
    Room_ID: 'RM-AL202',
    Slot_ID: 'SLOT-TUE-2',
    Session_Type: 'Lecture',
  },
  {
    Session_ID: 'SES-BTECH-04',
    Timetable_ID: 'TT-2026-ODD',
    Subject_ID: 'SUB-DL',
    Faculty_ID: 'FAC-HCD',
    Batch_ID: 'BATCH-BTECH-CE',
    Room_ID: 'RM-AL202',
    Slot_ID: 'SLOT-TUE-4',
    Session_Type: 'Lecture',
  },
  {
    Session_ID: 'SES-BTECH-05',
    Timetable_ID: 'TT-2026-ODD',
    Subject_ID: 'SUB-DM-BTECH',
    Faculty_ID: 'FAC-RP',
    Batch_ID: 'BATCH-BTECH-CE',
    Room_ID: 'RM-AL202',
    Slot_ID: 'SLOT-WED-4',
    Session_Type: 'Lecture',
  },
  {
    Session_ID: 'SES-BTECH-06',
    Timetable_ID: 'TT-2026-ODD',
    Subject_ID: 'SUB-DM-BTECH',
    Faculty_ID: 'FAC-RP',
    Batch_ID: 'BATCH-BTECH-CE',
    Room_ID: 'RM-AL004',
    Slot_ID: 'SLOT-THU-3',
    Session_Type: 'Lecture',
  },
  {
    Session_ID: 'SES-BTECH-07',
    Timetable_ID: 'TT-2026-ODD',
    Subject_ID: 'SUB-OEII',
    Faculty_ID: 'FAC-PV',
    Batch_ID: 'BATCH-BTECH-CE',
    Room_ID: 'RM-AL004',
    Slot_ID: 'SLOT-FRI-6',
    Session_Type: 'Lecture',
  },

  // ---------------------------------------------------------
  // Third Year TY B.Tech (CE) (Room AL 202 & Labs)
  // ---------------------------------------------------------
  {
    Session_ID: 'SES-TY-01',
    Timetable_ID: 'TT-2026-ODD',
    Subject_ID: 'SUB-CC-CE',
    Faculty_ID: 'FAC-AN',
    Batch_ID: 'BATCH-TY-CE',
    Room_ID: 'RM-AL202',
    Slot_ID: 'SLOT-MON-2',
    Session_Type: 'Lecture',
  },
  {
    Session_ID: 'SES-TY-02',
    Timetable_ID: 'TT-2026-ODD',
    Subject_ID: 'SUB-ML-CE',
    Faculty_ID: 'FAC-SCS',
    Batch_ID: 'BATCH-TY-CE',
    Room_ID: 'RM-AL202',
    Slot_ID: 'SLOT-MON-3',
    Session_Type: 'Lecture',
  },
  {
    Session_ID: 'SES-TY-03',
    Timetable_ID: 'TT-2026-ODD',
    Subject_ID: 'SUB-ML-LAB-CE',
    Faculty_ID: 'FAC-SCS',
    Batch_ID: 'BATCH-TY-CE',
    Room_ID: 'RM-LAB3A',
    Slot_ID: 'SLOT-MON-5',
    Session_Type: 'Lab',
  },
  {
    Session_ID: 'SES-TY-04',
    Timetable_ID: 'TT-2026-ODD',
    Subject_ID: 'SUB-ML-LAB-CE',
    Faculty_ID: 'FAC-SCS',
    Batch_ID: 'BATCH-TY-CE',
    Room_ID: 'RM-LAB3A',
    Slot_ID: 'SLOT-MON-6',
    Session_Type: 'Lab',
  },
  {
    Session_ID: 'SES-TY-05',
    Timetable_ID: 'TT-2026-ODD',
    Subject_ID: 'SUB-PC-CE',
    Faculty_ID: 'FAC-MKS',
    Batch_ID: 'BATCH-TY-CE',
    Room_ID: 'RM-AL202',
    Slot_ID: 'SLOT-THU-2',
    Session_Type: 'Lecture',
  },
  {
    Session_ID: 'SES-TY-06',
    Timetable_ID: 'TT-2026-ODD',
    Subject_ID: 'SUB-CN-CE',
    Faculty_ID: 'FAC-MMC',
    Batch_ID: 'BATCH-TY-CE',
    Room_ID: 'RM-AL202',
    Slot_ID: 'SLOT-FRI-6',
    Session_Type: 'Lecture',
  },

  // ---------------------------------------------------------
  // Second Year SY B.Tech (CE) (Room AL 201 & Labs)
  // ---------------------------------------------------------
  {
    Session_ID: 'SES-SY-01',
    Timetable_ID: 'TT-2026-ODD',
    Subject_ID: 'SUB-DS-CE',
    Faculty_ID: 'FAC-NAS',
    Batch_ID: 'BATCH-SY-CE',
    Room_ID: 'RM-AL201',
    Slot_ID: 'SLOT-MON-4',
    Session_Type: 'Lecture',
  },
  {
    Session_ID: 'SES-SY-02',
    Timetable_ID: 'TT-2026-ODD',
    Subject_ID: 'SUB-DAA-CE',
    Faculty_ID: 'FAC-MUK',
    Batch_ID: 'BATCH-SY-CE',
    Room_ID: 'RM-AL201',
    Slot_ID: 'SLOT-MON-3',
    Session_Type: 'Lecture',
  },
  {
    Session_ID: 'SES-SY-03',
    Timetable_ID: 'TT-2026-ODD',
    Subject_ID: 'SUB-ALGO-LAB-CE',
    Faculty_ID: 'FAC-MUK',
    Batch_ID: 'BATCH-SY-CE',
    Room_ID: 'RM-LAB2A',
    Slot_ID: 'SLOT-MON-6',
    Session_Type: 'Lab',
  },
  {
    Session_ID: 'SES-SY-04',
    Timetable_ID: 'TT-2026-ODD',
    Subject_ID: 'SUB-ALGO-LAB-CE',
    Faculty_ID: 'FAC-MUK',
    Batch_ID: 'BATCH-SY-CE',
    Room_ID: 'RM-LAB2A',
    Slot_ID: 'SLOT-MON-7',
    Session_Type: 'Lab',
  },
  {
    Session_ID: 'SES-SY-05',
    Timetable_ID: 'TT-2026-ODD',
    Subject_ID: 'SUB-OS-CE',
    Faculty_ID: 'FAC-VDD',
    Batch_ID: 'BATCH-SY-CE',
    Room_ID: 'RM-AL201',
    Slot_ID: 'SLOT-THU-3',
    Session_Type: 'Lecture',
  },
];

export const initialLeaveRequests: LeaveRequest[] = [
  {
    Leave_ID: 'LEV_001',
    Faculty_ID: 'FAC-HCD',
    From_Date: '2026-10-20',
    To_Date: '2026-10-20',
    Reason: 'Attending IEEE AI & Deep Learning Summit at IIT Bombay',
    Status: 'Reported',
  },
];

export const initialSubstitutions: Substitution[] = [
  {
    Sub_ID: 'SUB_REC_001',
    Leave_ID: 'LEV_001',
    Session_ID: 'SES-BTECH-04', // DL Lecture on Tue P4
    Substitute_Faculty_ID: 'FAC-AK', // Prof. Akhhil Kulal (Qualified in Deep Learning)
    Sub_Date: '2026-10-20',
    Action: 'Substituted',
    Status: 'Suggested',
  },
];

export const initialChangeLogs: ChangeLog[] = [
  {
    Log_ID: 'LOG_001',
    Timetable_ID: 'TT-2026-ODD',
    Change_Type: 'Generated',
    Description: 'Institutional Timetable for VJTI CE & IT (AY 2026-27 ODD) compiled by Constraint Engine',
    Reason: 'Semester schedule publication',
    Changed_By: 'Dr. V. M. Phalle',
    Changed_On: '2026-07-13 10:00:00',
  },
  {
    Log_ID: 'LOG_002',
    Timetable_ID: 'TT-2026-ODD',
    Change_Type: 'Substitution',
    Description: 'Assigned Prof. Akhhil Kulal for Deep Learning lecture during Prof. H. C. Dalal conference leave',
    Reason: 'Automated Leave-Substitution balancing',
    Changed_By: 'Dr. V. M. Phalle',
    Changed_On: '2026-10-17 09:30:00',
  },
];

export const initialNotifications: Notification[] = [
  {
    Notif_ID: 'NOTIF_001',
    Log_ID: 'LOG_001',
    Recipient_ID: 'ALL_FACULTY',
    Message: 'Official Timetable for VJTI CE & IT Department (AY 2026-27 ODD Semester) is published.',
    Sent_On: '2026-07-13 10:05:00',
    Is_Read: false,
  },
];

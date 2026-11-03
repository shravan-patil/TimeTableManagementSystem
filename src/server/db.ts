// =============================================================================
// VJTI Time Table Management System (TTMS)
// In-Memory Relational Data Store implementing 3NF constraints & ON DELETE RESTRICT
// Populated with Real VJTI CE & IT Department Master Dataset (AY 2026-27)
// =============================================================================

import {
  UserEntity,
  DepartmentEntity,
  AcademicTermEntity,
  FacultyEntity,
  SubjectEntity,
  FacultySubjectEntity,
  BatchEntity,
  RoomEntity,
  TimeSlotEntity,
  FacultyAvailabilityEntity,
  TimetableEntity,
  SessionEntity,
  TimetableEntryEntity,
  LeaveRequestEntity,
  SubstitutionEntity,
  ChangeLogEntity,
  NotificationEntity,
} from './types';

export class DatabaseStore {
  public users = new Map<string, UserEntity>();
  public departments = new Map<string, DepartmentEntity>();
  public academicTerms = new Map<string, AcademicTermEntity>();
  public faculty = new Map<string, FacultyEntity>();
  public subjects = new Map<string, SubjectEntity>();
  public facultySubjects = new Map<string, FacultySubjectEntity>();
  public batches = new Map<string, BatchEntity>();
  public rooms = new Map<string, RoomEntity>();
  public timeSlots = new Map<string, TimeSlotEntity>();
  public facultyAvailability = new Map<string, FacultyAvailabilityEntity>();
  public timetables = new Map<string, TimetableEntity>();
  public sessions = new Map<string, SessionEntity>();
  public timetableEntries = new Map<string, TimetableEntryEntity>();
  public leaveRequests = new Map<string, LeaveRequestEntity>();
  public substitutions = new Map<string, SubstitutionEntity>();
  public changeLogs = new Map<string, ChangeLogEntity>();
  public notifications = new Map<string, NotificationEntity>();

  constructor() {
    this.seed();
  }

  public reset() {
    this.users.clear();
    this.departments.clear();
    this.academicTerms.clear();
    this.faculty.clear();
    this.subjects.clear();
    this.facultySubjects.clear();
    this.batches.clear();
    this.rooms.clear();
    this.timeSlots.clear();
    this.facultyAvailability.clear();
    this.timetables.clear();
    this.sessions.clear();
    this.timetableEntries.clear();
    this.leaveRequests.clear();
    this.substitutions.clear();
    this.changeLogs.clear();
    this.notifications.clear();
    this.seed();
  }

  public seed() {
    // 1. Departments
    this.departments.set('dept-ce', {
      department_id: 'dept-ce',
      name: 'Computer Engineering',
      code: 'CE',
      created_at: new Date().toISOString(),
    });
    this.departments.set('dept-it', {
      department_id: 'dept-it',
      name: 'Information Technology',
      code: 'IT',
      created_at: new Date().toISOString(),
    });

    // 2. Academic Terms
    this.academicTerms.set('term-2026-odd', {
      term_id: 'term-2026-odd',
      name: 'AY 2026-27 ODD Semester',
      department_id: 'dept-ce',
      start_date: '2026-07-13',
      end_date: '2026-12-15',
      is_active: true,
    });

    // 3. Users & Faculty Roster (31 Real Faculty from VJTI Timetable)
    const defaultHash = '$2a$10$wN9aEaVbE.yF961o1F3nDeGkP0BlnRzI3aC2o.y1J5rYI06Xv8Mne';

    this.users.set('u-coord', {
      user_id: 'u-coord',
      name: 'Dr. V. M. Phalle',
      email: 'coordinator@vjti.ac.in',
      password_hash: defaultHash,
      role: 'coordinator',
      department_id: 'dept-ce',
      created_at: new Date().toISOString(),
    });

    const facultyList = [
      { id: 'FAC-PMC', name: 'Prof. P. M. Chawan', dept: 'dept-ce', email: 'pmchawan@ce.vjti.ac.in', load: 16 },
      { id: 'FAC-VBN', name: 'Dr. V. B. Nikam', dept: 'dept-ce', email: 'vbnikam@ce.vjti.ac.in', load: 14 },
      { id: 'FAC-MRS', name: 'Dr. M. R. Shirole', dept: 'dept-ce', email: 'mrshirole@ce.vjti.ac.in', load: 14 },
      { id: 'FAC-MMC', name: 'Dr. M. M. Chandane', dept: 'dept-ce', email: 'mmchandane@ce.vjti.ac.in', load: 16 },
      { id: 'FAC-SCS', name: 'Prof. S. C. Shrawne', dept: 'dept-ce', email: 'scshrawne@ce.vjti.ac.in', load: 16 },
      { id: 'FAC-VKS', name: 'Dr. V. K. Sambhe', dept: 'dept-ce', email: 'vksambhe@ce.vjti.ac.in', load: 14 },
      { id: 'FAC-SSU', name: 'Dr. S. S. Udmale', dept: 'dept-ce', email: 'ssudmale@ce.vjti.ac.in', load: 14 },
      { id: 'FAC-STS', name: 'Dr. S. T. Shingade', dept: 'dept-ce', email: 'stshingade@ce.vjti.ac.in', load: 16 },
      { id: 'FAC-MUK', name: 'Prof. M. U. Kulkarni', dept: 'dept-ce', email: 'mukulkarni@ce.vjti.ac.in', load: 16 },
      { id: 'FAC-KKJ', name: 'Prof. K. K. Joshi', dept: 'dept-ce', email: 'kkjoshi@ce.vjti.ac.in', load: 16 },
      { id: 'FAC-VJN', name: 'Dr. Varshapriya J N', dept: 'dept-ce', email: 'vjn@ce.vjti.ac.in', load: 14 },
      { id: 'FAC-SSS', name: 'Dr. S. S. Suratkar', dept: 'dept-ce', email: 'sssuratkar@ce.vjti.ac.in', load: 14 },
      { id: 'FAC-VDD', name: 'Prof. V. D. Dhore', dept: 'dept-ce', email: 'vddhore@ce.vjti.ac.in', load: 16 },
      { id: 'FAC-SAK', name: 'Prof. S. A. Khedkar', dept: 'dept-ce', email: 'sakhedkar@ce.vjti.ac.in', load: 16 },
      { id: 'FAC-SSL', name: 'Prof. S. S. Lachure', dept: 'dept-ce', email: 'sslachure@ce.vjti.ac.in', load: 16 },
      { id: 'FAC-SGK', name: 'Dr. Sopan G. Kolte', dept: 'dept-ce', email: 'sgkolte@ce.vjti.ac.in', load: 14 },
      { id: 'FAC-NAS', name: 'Dr. Noshin A. Sabuwala', dept: 'dept-ce', email: 'nasabuwala@ce.vjti.ac.in', load: 14 },
      { id: 'FAC-NS',  name: 'Dr. Neha Singh', dept: 'dept-ce', email: 'nsingh@ce.vjti.ac.in', load: 14 },
      { id: 'FAC-RS',  name: 'Dr. Ritika Singh', dept: 'dept-ce', email: 'rsingh@ce.vjti.ac.in', load: 14 },
      { id: 'FAC-SB',  name: 'Prof. Shreekant Bedekar', dept: 'dept-ce', email: 'sbedekar@ce.vjti.ac.in', load: 16 },
      { id: 'FAC-IM',  name: 'Prof. Isaivani Mathiyalagam', dept: 'dept-it', email: 'imathiyalagam@it.vjti.ac.in', load: 16 },
      { id: 'FAC-PSS', name: 'Prof. Prachi S Shinde', dept: 'dept-it', email: 'psshinde@it.vjti.ac.in', load: 16 },
      { id: 'FAC-HCD', name: 'Prof. Harshala C Dalal', dept: 'dept-it', email: 'hcdalal@it.vjti.ac.in', load: 16 },
      { id: 'FAC-RP',  name: 'Prof. Riddhi Patil', dept: 'dept-it', email: 'rpatil@it.vjti.ac.in', load: 16 },
      { id: 'FAC-PS',  name: 'Prof. Prajakta Salunkhe', dept: 'dept-it', email: 'psalunkhe@it.vjti.ac.in', load: 16 },
      { id: 'FAC-AK',  name: 'Prof. Akhhil Kulal', dept: 'dept-it', email: 'akulal@it.vjti.ac.in', load: 16 },
      { id: 'FAC-AM',  name: 'Prof. Akshay Mhalaskar', dept: 'dept-it', email: 'amhalaskar@it.vjti.ac.in', load: 16 },
      { id: 'FAC-PV',  name: 'Prof. Pragati Vaishnav', dept: 'dept-it', email: 'pvaishnav@it.vjti.ac.in', load: 16 },
      { id: 'FAC-SD',  name: 'Prof. Saurabh Dalvi', dept: 'dept-it', email: 'sdalvi@it.vjti.ac.in', load: 16 },
      { id: 'FAC-MKS', name: 'Prof. Mandar K. Sase', dept: 'dept-it', email: 'msase@it.vjti.ac.in', load: 16 },
      { id: 'FAC-AN',  name: 'Prof. Ankit Nimbolkar', dept: 'dept-it', email: 'animbolkar@it.vjti.ac.in', load: 16 },
    ];

    facultyList.forEach((f) => {
      const userId = `u-${f.id.toLowerCase().replace('fac-', '')}`;
      this.users.set(userId, {
        user_id: userId,
        name: f.name,
        email: f.email,
        password_hash: defaultHash,
        role: 'faculty',
        department_id: f.dept,
        created_at: new Date().toISOString(),
      });
      this.faculty.set(f.id, {
        faculty_id: f.id,
        user_id: userId,
        department_id: f.dept,
        name: f.name,
        email: f.email,
        max_weekly_load: f.load,
      });
    });

    // Compatibility alias: FAC-001 points to Prof. M. A. Patil / FAC-PMC
    this.faculty.set('FAC-001', {
      faculty_id: 'FAC-001',
      user_id: 'u-pmc',
      department_id: 'dept-ce',
      name: 'Prof. P. M. Chawan',
      email: 'pmchawan@ce.vjti.ac.in',
      max_weekly_load: 16,
    });
    this.faculty.set('FAC-002', {
      faculty_id: 'FAC-002',
      user_id: 'u-vbn',
      department_id: 'dept-ce',
      name: 'Dr. V. B. Nikam',
      email: 'vbnikam@ce.vjti.ac.in',
      max_weekly_load: 14,
    });
    this.faculty.set('FAC-003', {
      faculty_id: 'FAC-003',
      user_id: 'u-mrs',
      department_id: 'dept-ce',
      name: 'Dr. M. R. Shirole',
      email: 'mrshirole@ce.vjti.ac.in',
      max_weekly_load: 14,
    });

    // Student user
    this.users.set('u-stud', {
      user_id: 'u-stud',
      name: 'VJTI Student',
      email: 'student@vjti.ac.in',
      password_hash: defaultHash,
      role: 'student',
      department_id: 'dept-ce',
      created_at: new Date().toISOString(),
    });

    // 4. Rooms (18 Rooms & Labs from VJTI PDF)
    const roomList = [
      { id: 'RM-AL001', no: 'AL 001', cap: 80, type: 'Lecture Hall' as const },
      { id: 'RM-AL004', no: 'AL 004', cap: 80, type: 'Lecture Hall' as const },
      { id: 'RM-AL201', no: 'AL 201', cap: 80, type: 'Lecture Hall' as const },
      { id: 'RM-AL202', no: 'AL 202', cap: 80, type: 'Lecture Hall' as const },
      { id: 'RM-AL207', no: 'AL 207', cap: 80, type: 'Lecture Hall' as const },
      { id: 'RM-AL302', no: 'AL 302', cap: 80, type: 'Lecture Hall' as const },
      { id: 'RM-LAB1A', no: 'Lab 1A', cap: 40, type: 'Laboratory' as const },
      { id: 'RM-LAB1B', no: 'Lab 1B', cap: 40, type: 'Laboratory' as const },
      { id: 'RM-LABIL', no: 'Lab IL', cap: 40, type: 'Laboratory' as const },
      { id: 'RM-LAB2A', no: 'Lab 2A', cap: 40, type: 'Laboratory' as const },
      { id: 'RM-LAB2B', no: 'Lab 2B', cap: 40, type: 'Laboratory' as const },
      { id: 'RM-LAB2C', no: 'Lab 2C', cap: 40, type: 'Laboratory' as const },
      { id: 'RM-LAB3A', no: 'Lab 3A', cap: 40, type: 'Laboratory' as const },
      { id: 'RM-LAB3B', no: 'Lab 3B', cap: 40, type: 'Laboratory' as const },
      { id: 'RM-LABNL', no: 'Networking Lab (NL)', cap: 40, type: 'Laboratory' as const },
      { id: 'RM-INTERNET', no: 'Internet Lab', cap: 60, type: 'Laboratory' as const },
      { id: 'RM-ARVR',  no: 'AR/VR Lab', cap: 40, type: 'Laboratory' as const },
      { id: 'RM-DL003', no: 'DL 003 Seminar Room', cap: 60, type: 'Seminar Room' as const },
    ];

    roomList.forEach((r) => {
      this.rooms.set(r.id, {
        room_id: r.id,
        room_no: r.no,
        capacity: r.cap,
        type: r.type,
      });
    });

    // Compatibility aliases: RM-001 -> RM-AL201, RM-002 -> RM-AL202
    this.rooms.set('RM-001', { room_id: 'RM-001', room_no: 'AL 201 (Lecture Hall)', capacity: 80, type: 'Lecture Hall' });
    this.rooms.set('RM-002', { room_id: 'RM-002', room_no: 'AL 202 (Lecture Hall)', capacity: 80, type: 'Lecture Hall' });
    this.rooms.set('RM-003', { room_id: 'RM-003', room_no: 'AL 004 (Lecture Hall)', capacity: 80, type: 'Lecture Hall' });
    this.rooms.set('RM-004', { room_id: 'RM-004', room_no: 'Lab 1A', capacity: 40, type: 'Laboratory' });
    this.rooms.set('RM-005', { room_id: 'RM-005', room_no: 'Lab 2A', capacity: 40, type: 'Laboratory' });

    // 5. Batches
    const batchList = [
      { id: 'BATCH-BTECH-CE', div: 'B.Tech CE', yr: 4, str: 75 },
      { id: 'BATCH-BTECH-IT', div: 'B.Tech IT', yr: 4, str: 75 },
      { id: 'BATCH-TY-CE',    div: 'TY B.Tech (CE)', yr: 3, str: 72 },
      { id: 'BATCH-TY-IT',    div: 'TY B.Tech (IT)', yr: 3, str: 70 },
      { id: 'BATCH-SY-CE',    div: 'SY B.Tech (CE)', yr: 2, str: 74 },
      { id: 'BATCH-SY-IT',    div: 'SY B.Tech (IT)', yr: 2, str: 72 },
      // Compatibility aliases
      { id: 'BATCH-001',      div: 'TY B.Tech (CE)', yr: 3, str: 72 },
      { id: 'BATCH-002',      div: 'TY B.Tech (IT)', yr: 3, str: 70 },
    ];
    batchList.forEach((b) => {
      this.batches.set(b.id, {
        batch_id: b.id,
        department_id: b.id.includes('IT') ? 'dept-it' : 'dept-ce',
        division: b.div,
        year: b.yr,
        strength: b.str,
      });
    });

    // 6. Time Slots (Monday to Friday, Periods 1 to 9 + SLOT-1 to SLOT-42 aliases)
    const slotTimes = [
      { p: 1, s: '08:30', e: '09:25' },
      { p: 2, s: '09:30', e: '10:25' },
      { p: 3, s: '10:30', e: '11:25' },
      { p: 4, s: '11:30', e: '12:25' },
      { p: 5, s: '12:30', e: '13:25' },
      { p: 6, s: '14:30', e: '15:25' },
      { p: 7, s: '15:30', e: '16:25' },
      { p: 8, s: '16:30', e: '17:25' },
      { p: 9, s: '17:30', e: '18:25' },
    ];

    const days: ('Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat')[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    days.forEach((day) => {
      slotTimes.forEach(({ p, s, e }) => {
        const id = `SLOT-${day.toUpperCase()}-${p}`;
        this.timeSlots.set(id, {
          slot_id: id,
          day,
          period_no: p,
          start_time: s,
          end_time: e,
        });
      });
    });

    // Numbered slot aliases for test suite compatibility
    for (let i = 1; i <= 42; i++) {
      const dayIdx = Math.floor((i - 1) / 7);
      const periodNo = ((i - 1) % 7) + 1;
      const day = days[dayIdx] || 'Mon';
      const time = slotTimes[periodNo - 1] || { s: '09:00', e: '10:00' };
      this.timeSlots.set(`SLOT-${i}`, {
        slot_id: `SLOT-${i}`,
        day,
        period_no: periodNo,
        start_time: time.s,
        end_time: time.e,
      });
    }

    // 7. Subjects (from VJTI Timetable PDF)
    const subList = [
      { id: 'SUB-OEII',     code: 'OE401',  name: 'Open Elective II', type: 'Elective' as const, cr: 3, hpw: 3, lab: false },
      { id: 'SUB-DM-BTECH', code: 'CE401',  name: 'Data Management', type: 'Theory' as const, cr: 3, hpw: 3, lab: false },
      { id: 'SUB-PANS',     code: 'CE402A', name: 'PE III: Predictive Analytics & Network Security', type: 'Elective' as const, cr: 3, hpw: 3, lab: false },
      { id: 'SUB-ST',       code: 'CE402B', name: 'PE III: Software Testing', type: 'Elective' as const, cr: 3, hpw: 3, lab: false },
      { id: 'SUB-DL',       code: 'CE403A', name: 'PE IV: Deep Learning', type: 'Elective' as const, cr: 3, hpw: 3, lab: false },
      { id: 'SUB-QC',       code: 'CE403B', name: 'PE IV: Quantum Computing', type: 'Elective' as const, cr: 3, hpw: 3, lab: false },
      { id: 'SUB-MDMV-DS',  code: 'MDM501', name: 'MDM V: Data Science', type: 'Theory' as const, cr: 3, hpw: 3, lab: false },
      { id: 'SUB-CPAD-LAB', code: 'IT404L', name: 'Cross Platform App Development Lab', type: 'Practical' as const, cr: 1, hpw: 2, lab: true },
      { id: 'SUB-CC-CE',    code: 'CE301',  name: 'Compiler Construction', type: 'Theory' as const, cr: 3, hpw: 3, lab: false },
      { id: 'SUB-ML-CE',    code: 'CE302',  name: 'Machine Learning (CE)', type: 'Theory' as const, cr: 3, hpw: 3, lab: false },
      { id: 'SUB-CN-CE',    code: 'CE303',  name: 'Computer Networks (CE)', type: 'Theory' as const, cr: 3, hpw: 3, lab: false },
      { id: 'SUB-PC-CE',    code: 'CE304',  name: 'Parallel Computing (CE)', type: 'Theory' as const, cr: 3, hpw: 3, lab: false },
      { id: 'SUB-ML-LAB-CE',code: 'CE302L', name: 'Machine Learning Lab (CE)', type: 'Practical' as const, cr: 1, hpw: 2, lab: true },
      { id: 'SUB-DS-CE',    code: 'CE201',  name: 'Discrete Structure', type: 'Theory' as const, cr: 4, hpw: 4, lab: false },
      { id: 'SUB-DAA-CE',   code: 'CE202',  name: 'Design & Analysis of Algorithm (CE)', type: 'Theory' as const, cr: 3, hpw: 3, lab: false },
      { id: 'SUB-OS-CE',    code: 'CE203',  name: 'Operating System (CE)', type: 'Theory' as const, cr: 3, hpw: 3, lab: false },
      { id: 'SUB-ALGO-LAB-CE', code: 'CE202L', name: 'Algorithm Lab (CE)', type: 'Practical' as const, cr: 1, hpw: 2, lab: true },
    ];

    subList.forEach((s) => {
      this.subjects.set(s.id, {
        subject_id: s.id,
        department_id: 'dept-ce',
        code: s.code,
        name: s.name,
        type: s.type,
        credits: s.cr,
        hours_per_week: s.hpw,
        requires_lab: s.lab,
      });
    });

    // Aliases
    this.subjects.set('SUB-001', { subject_id: 'SUB-001', department_id: 'dept-ce', code: 'CE401', name: 'Data Management', type: 'Theory', credits: 3, hours_per_week: 3, requires_lab: false });
    this.subjects.set('SUB-002', { subject_id: 'SUB-002', department_id: 'dept-ce', code: 'CE302', name: 'Machine Learning', type: 'Theory', credits: 3, hours_per_week: 3, requires_lab: false });
    this.subjects.set('SUB-003', { subject_id: 'SUB-003', department_id: 'dept-ce', code: 'CE303', name: 'Computer Networks', type: 'Theory', credits: 3, hours_per_week: 3, requires_lab: false });
    this.subjects.set('SUB-004', { subject_id: 'SUB-004', department_id: 'dept-ce', code: 'CE302L', name: 'Machine Learning Lab', type: 'Practical', credits: 1, hours_per_week: 2, requires_lab: true });

    // Faculty qualification mappings
    const setFS = (fid: string, sid: string) => {
      this.facultySubjects.set(`${fid}_${sid}`, { faculty_id: fid, subject_id: sid });
    };
    setFS('FAC-RP', 'SUB-DM-BTECH');
    setFS('FAC-VJN', 'SUB-PANS');
    setFS('FAC-HCD', 'SUB-DL');
    setFS('FAC-PV', 'SUB-CPAD-LAB');
    setFS('FAC-AN', 'SUB-CC-CE');
    setFS('FAC-SCS', 'SUB-ML-CE');
    setFS('FAC-MMC', 'SUB-CN-CE');
    setFS('FAC-MKS', 'SUB-PC-CE');
    setFS('FAC-MUK', 'SUB-DAA-CE');
    setFS('FAC-VDD', 'SUB-OS-CE');
    setFS('FAC-NAS', 'SUB-DS-CE');
    setFS('FAC-PMC', 'SUB-001');
    setFS('FAC-001', 'SUB-001');
    setFS('FAC-002', 'SUB-002');
    setFS('FAC-001', 'SUB-004');

    // 8. Timetable Container
    this.timetables.set('TT-2026-ODD', {
      timetable_id: 'TT-2026-ODD',
      term_id: 'term-2026-odd',
      version_no: 1,
      status: 'Published',
      created_by: 'u-coord',
      created_at: new Date().toISOString(),
      published_at: new Date().toISOString(),
    });

    // 9. Sessions (from PDF Timetable)
    const seedSessions: SessionEntity[] = [
      { session_id: 'SESS-101', timetable_id: 'TT-2026-ODD', subject_id: 'SUB-DM-BTECH', faculty_id: 'FAC-RP',  room_id: 'RM-AL202', session_type: 'Lecture', duration_slots: 1, weekly_frequency: 3, batch_ids: ['BATCH-BTECH-CE', 'BATCH-001'] },
      { session_id: 'SESS-102', timetable_id: 'TT-2026-ODD', subject_id: 'SUB-PANS',     faculty_id: 'FAC-VJN', room_id: 'RM-AL202', session_type: 'Lecture', duration_slots: 1, weekly_frequency: 3, batch_ids: ['BATCH-BTECH-CE', 'BATCH-001'] },
      { session_id: 'SESS-103', timetable_id: 'TT-2026-ODD', subject_id: 'SUB-DL',       faculty_id: 'FAC-HCD', room_id: 'RM-AL202', session_type: 'Lecture', duration_slots: 1, weekly_frequency: 3, batch_ids: ['BATCH-BTECH-CE', 'BATCH-001'] },
      { session_id: 'SESS-104', timetable_id: 'TT-2026-ODD', subject_id: 'SUB-CPAD-LAB', faculty_id: 'FAC-PV',  room_id: 'RM-LAB1A', session_type: 'Lab',     duration_slots: 2, weekly_frequency: 1, batch_ids: ['BATCH-BTECH-CE', 'BATCH-001'] },
      { session_id: 'SESS-105', timetable_id: 'TT-2026-ODD', subject_id: 'SUB-CC-CE',    faculty_id: 'FAC-AN',  room_id: 'RM-AL202', session_type: 'Lecture', duration_slots: 1, weekly_frequency: 3, batch_ids: ['BATCH-TY-CE', 'BATCH-001'] },
      { session_id: 'SESS-106', timetable_id: 'TT-2026-ODD', subject_id: 'SUB-OEII',     faculty_id: 'FAC-PV',  room_id: 'RM-AL004', session_type: 'Lecture', duration_slots: 1, weekly_frequency: 3, batch_ids: ['BATCH-BTECH-CE', 'BATCH-BTECH-IT', 'BATCH-001', 'BATCH-002'] },
    ];
    seedSessions.forEach((s) => this.sessions.set(s.session_id, s));

    // 10. Timetable Entries
    const entries: TimetableEntryEntity[] = [
      {
        entry_id: 'ENTRY-1',
        timetable_id: 'TT-2026-ODD',
        session_id: 'SESS-101',
        slot_id: 'SLOT-1', // Mon P1 / SLOT-MON-1
        room_id: 'RM-001',
        faculty_id: 'FAC-001',
        batch_ids: ['BATCH-001'],
        created_at: new Date().toISOString(),
      },
      {
        entry_id: 'ENTRY-2',
        timetable_id: 'TT-2026-ODD',
        session_id: 'SESS-102',
        slot_id: 'SLOT-2', // Mon P2
        room_id: 'RM-002',
        faculty_id: 'FAC-002',
        batch_ids: ['BATCH-001'],
        created_at: new Date().toISOString(),
      },
      {
        entry_id: 'ENTRY-3',
        timetable_id: 'TT-2026-ODD',
        session_id: 'SESS-103',
        slot_id: 'SLOT-3', // Mon P3
        room_id: 'RM-003',
        faculty_id: 'FAC-003',
        batch_ids: ['BATCH-001'],
        created_at: new Date().toISOString(),
      },
      {
        entry_id: 'ENTRY-4',
        timetable_id: 'TT-2026-ODD',
        session_id: 'SESS-104',
        slot_id: 'SLOT-5', // Mon P5
        room_id: 'RM-004',
        faculty_id: 'FAC-001',
        batch_ids: ['BATCH-001'],
        created_at: new Date().toISOString(),
      },
      {
        entry_id: 'ENTRY-5',
        timetable_id: 'TT-2026-ODD',
        session_id: 'SESS-104',
        slot_id: 'SLOT-6', // Mon P6
        room_id: 'RM-004',
        faculty_id: 'FAC-001',
        batch_ids: ['BATCH-001'],
        created_at: new Date().toISOString(),
      },
      {
        entry_id: 'ENTRY-6',
        timetable_id: 'TT-2026-ODD',
        session_id: 'SESS-106',
        slot_id: 'SLOT-8', // Tue P1
        room_id: 'RM-AL004',
        faculty_id: 'FAC-PV',
        batch_ids: ['BATCH-BTECH-CE', 'BATCH-BTECH-IT'],
        created_at: new Date().toISOString(),
      },
      // Real entries from VJTI PDF
      {
        entry_id: 'ENT-BTECH-CPAD-1',
        timetable_id: 'TT-2026-ODD',
        session_id: 'SESS-104',
        slot_id: 'SLOT-MON-2',
        room_id: 'RM-LAB1A',
        faculty_id: 'FAC-PV',
        batch_ids: ['BATCH-BTECH-CE'],
        created_at: new Date().toISOString(),
      },
      {
        entry_id: 'ENT-BTECH-PANS-1',
        timetable_id: 'TT-2026-ODD',
        session_id: 'SESS-102',
        slot_id: 'SLOT-MON-4',
        room_id: 'RM-AL202',
        faculty_id: 'FAC-VJN',
        batch_ids: ['BATCH-BTECH-CE'],
        created_at: new Date().toISOString(),
      },
      {
        entry_id: 'ENT-TY-CC-1',
        timetable_id: 'TT-2026-ODD',
        session_id: 'SESS-105',
        slot_id: 'SLOT-TUE-2',
        room_id: 'RM-AL202',
        faculty_id: 'FAC-AN',
        batch_ids: ['BATCH-TY-CE'],
        created_at: new Date().toISOString(),
      },
    ];

    entries.forEach((e) => this.timetableEntries.set(e.entry_id, e));

    // 11. Initial Change Log
    this.changeLogs.set('LOG-001', {
      log_id: 'LOG-001',
      timetable_id: 'TT-2026-ODD',
      change_type: 'Generated',
      description: 'VJTI CE & IT Institutional schedule loaded for AY 2026-27 ODD Semester.',
      reason: 'Official departmental timetable ingestion from curriculum PDF',
      changed_by: 'u-coord',
      changed_on: new Date().toISOString(),
    });
  }

  // Referential Integrity & ON DELETE RESTRICT Check (Assignment 7 Table 4 / TC-02)
  public checkCanDeleteRoom(roomId: string) {
    for (const entry of Array.from(this.timetableEntries.values())) {
      if (entry.room_id === roomId) {
        throw new Error(
          `Cannot delete Room ${roomId}: actively referenced in timetable entry ${entry.entry_id} (ON DELETE RESTRICT - TC-02)`
        );
      }
    }
  }

  public checkCanDeleteFaculty(facultyId: string) {
    for (const s of Array.from(this.sessions.values())) {
      if (s.faculty_id === facultyId) {
        throw new Error(
          `Cannot delete Faculty ${facultyId}: actively assigned to session ${s.session_id} (ON DELETE RESTRICT - TC-02)`
        );
      }
    }
    for (const entry of Array.from(this.timetableEntries.values())) {
      if (entry.faculty_id === facultyId) {
        throw new Error(
          `Cannot delete Faculty ${facultyId}: actively scheduled in timetable entry ${entry.entry_id} (ON DELETE RESTRICT - TC-02)`
        );
      }
    }
  }

  public checkCanDeleteSubject(subjectId: string) {
    for (const s of Array.from(this.sessions.values())) {
      if (s.subject_id === subjectId) {
        throw new Error(
          `Cannot delete Subject ${subjectId}: actively referenced in session ${s.session_id} (ON DELETE RESTRICT - TC-02)`
        );
      }
    }
  }

  public checkCanDeleteBatch(batchId: string) {
    for (const s of Array.from(this.sessions.values())) {
      if (s.batch_ids.includes(batchId)) {
        throw new Error(
          `Cannot delete Batch ${batchId}: actively referenced in session ${s.session_id} (ON DELETE RESTRICT - TC-02)`
        );
      }
    }
  }
}

// Global Singleton Instance
export const db = new DatabaseStore();

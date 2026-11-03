-- =============================================================================
-- VJTI Time Table Management System (TTMS)
-- Comprehensive Institutional Seed Script: Department of CE & IT (AY 2026-27 ODD)
-- Extracted from Official VJTI CE & IT Timetable (SY, TY, Final B.Tech)
-- =============================================================================

-- 1. DEPARTMENTS
INSERT INTO departments (department_id, name, code) VALUES
('dept-ce', 'Computer Engineering', 'CE'),
('dept-it', 'Information Technology', 'IT')
ON CONFLICT (department_id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code;

-- 2. ACADEMIC TERMS
INSERT INTO academic_terms (term_id, name, department_id, start_date, end_date, is_active) VALUES
('term-2026-odd', 'AY 2026-27 ODD Semester', 'dept-ce', '2026-07-13', '2026-12-15', TRUE)
ON CONFLICT (term_id) DO NOTHING;

-- 3. USERS (Sanitized Dummy Emails + 1 Real Faculty + 1 Real Student)
-- Password hash for 'vjti@2026'
INSERT INTO users (user_id, name, email, password_hash, role, department_id) VALUES
('u-coord', 'Dr. V. M. Phalle', 'coordinator@dummy.ttms.local', '$2a$10$wN9aEaVbE.yF961o1F3nDeGkP0BlnRzI3aC2o.y1J5rYI06Xv8Mne', 'coordinator', 'dept-ce'),
-- REAL FACULTY EMAIL FOR TESTING:
('u-pmc', 'Prof. P. M. Chawan', 'tanishparekh03@gmail.com', '$2a$10$wN9aEaVbE.yF961o1F3nDeGkP0BlnRzI3aC2o.y1J5rYI06Xv8Mne', 'faculty', 'dept-ce'),
-- DUMMY FACULTY EMAILS (SAFE FROM ACCIDENTAL EMAILS):
('u-vbn', 'Dr. V. B. Nikam', 'vbnikam@dummy.ttms.local', '$2a$10$wN9aEaVbE.yF961o1F3nDeGkP0BlnRzI3aC2o.y1J5rYI06Xv8Mne', 'faculty', 'dept-ce'),
('u-mrs', 'Dr. M. R. Shirole', 'mrshirole@dummy.ttms.local', '$2a$10$wN9aEaVbE.yF961o1F3nDeGkP0BlnRzI3aC2o.y1J5rYI06Xv8Mne', 'faculty', 'dept-ce'),
('u-mmc', 'Dr. M. M. Chandane', 'mmchandane@dummy.ttms.local', '$2a$10$wN9aEaVbE.yF961o1F3nDeGkP0BlnRzI3aC2o.y1J5rYI06Xv8Mne', 'faculty', 'dept-ce'),
('u-scs', 'Prof. S. C. Shrawne', 'scshrawne@dummy.ttms.local', '$2a$10$wN9aEaVbE.yF961o1F3nDeGkP0BlnRzI3aC2o.y1J5rYI06Xv8Mne', 'faculty', 'dept-ce'),
('u-vks', 'Dr. V. K. Sambhe', 'vksambhe@dummy.ttms.local', '$2a$10$wN9aEaVbE.yF961o1F3nDeGkP0BlnRzI3aC2o.y1J5rYI06Xv8Mne', 'faculty', 'dept-ce'),
('u-ssu', 'Dr. S. S. Udmale', 'ssudmale@dummy.ttms.local', '$2a$10$wN9aEaVbE.yF961o1F3nDeGkP0BlnRzI3aC2o.y1J5rYI06Xv8Mne', 'faculty', 'dept-ce'),
('u-sts', 'Dr. S. T. Shingade', 'stshingade@dummy.ttms.local', '$2a$10$wN9aEaVbE.yF961o1F3nDeGkP0BlnRzI3aC2o.y1J5rYI06Xv8Mne', 'faculty', 'dept-ce'),
('u-muk', 'Prof. M. U. Kulkarni', 'mukulkarni@dummy.ttms.local', '$2a$10$wN9aEaVbE.yF961o1F3nDeGkP0BlnRzI3aC2o.y1J5rYI06Xv8Mne', 'faculty', 'dept-ce'),
('u-kkj', 'Prof. K. K. Joshi', 'kkjoshi@dummy.ttms.local', '$2a$10$wN9aEaVbE.yF961o1F3nDeGkP0BlnRzI3aC2o.y1J5rYI06Xv8Mne', 'faculty', 'dept-ce'),
('u-vjn', 'Dr. Varshapriya J N', 'vjn@dummy.ttms.local', '$2a$10$wN9aEaVbE.yF961o1F3nDeGkP0BlnRzI3aC2o.y1J5rYI06Xv8Mne', 'faculty', 'dept-ce'),
('u-sss', 'Dr. S. S. Suratkar', 'sssuratkar@dummy.ttms.local', '$2a$10$wN9aEaVbE.yF961o1F3nDeGkP0BlnRzI3aC2o.y1J5rYI06Xv8Mne', 'faculty', 'dept-ce'),
('u-vdd', 'Prof. V. D. Dhore', 'vddhore@dummy.ttms.local', '$2a$10$wN9aEaVbE.yF961o1F3nDeGkP0BlnRzI3aC2o.y1J5rYI06Xv8Mne', 'faculty', 'dept-ce'),
('u-sak', 'Prof. S. A. Khedkar', 'sakhedkar@dummy.ttms.local', '$2a$10$wN9aEaVbE.yF961o1F3nDeGkP0BlnRzI3aC2o.y1J5rYI06Xv8Mne', 'faculty', 'dept-ce'),
('u-ssl', 'Prof. S. S. Lachure', 'sslachure@dummy.ttms.local', '$2a$10$wN9aEaVbE.yF961o1F3nDeGkP0BlnRzI3aC2o.y1J5rYI06Xv8Mne', 'faculty', 'dept-ce'),
('u-sgk', 'Dr. Sopan G. Kolte', 'sgkolte@dummy.ttms.local', '$2a$10$wN9aEaVbE.yF961o1F3nDeGkP0BlnRzI3aC2o.y1J5rYI06Xv8Mne', 'faculty', 'dept-ce'),
('u-nas', 'Dr. Noshin A. Sabuwala', 'nasabuwala@dummy.ttms.local', '$2a$10$wN9aEaVbE.yF961o1F3nDeGkP0BlnRzI3aC2o.y1J5rYI06Xv8Mne', 'faculty', 'dept-ce'),
('u-ns', 'Dr. Neha Singh', 'nsingh@dummy.ttms.local', '$2a$10$wN9aEaVbE.yF961o1F3nDeGkP0BlnRzI3aC2o.y1J5rYI06Xv8Mne', 'faculty', 'dept-ce'),
('u-rs', 'Dr. Ritika Singh', 'rsingh@dummy.ttms.local', '$2a$10$wN9aEaVbE.yF961o1F3nDeGkP0BlnRzI3aC2o.y1J5rYI06Xv8Mne', 'faculty', 'dept-ce'),
('u-sb', 'Prof. Shreekant Bedekar', 'sbedekar@dummy.ttms.local', '$2a$10$wN9aEaVbE.yF961o1F3nDeGkP0BlnRzI3aC2o.y1J5rYI06Xv8Mne', 'faculty', 'dept-ce'),
('u-im', 'Prof. Isaivani Mathiyalagam', 'imathiyalagam@dummy.ttms.local', '$2a$10$wN9aEaVbE.yF961o1F3nDeGkP0BlnRzI3aC2o.y1J5rYI06Xv8Mne', 'faculty', 'dept-it'),
('u-pss', 'Prof. Prachi S Shinde', 'psshinde@dummy.ttms.local', '$2a$10$wN9aEaVbE.yF961o1F3nDeGkP0BlnRzI3aC2o.y1J5rYI06Xv8Mne', 'faculty', 'dept-it'),
('u-hcd', 'Prof. Harshala C Dalal', 'hcdalal@dummy.ttms.local', '$2a$10$wN9aEaVbE.yF961o1F3nDeGkP0BlnRzI3aC2o.y1J5rYI06Xv8Mne', 'faculty', 'dept-it'),
('u-rp', 'Prof. Riddhi Patil', 'rpatil@dummy.ttms.local', '$2a$10$wN9aEaVbE.yF961o1F3nDeGkP0BlnRzI3aC2o.y1J5rYI06Xv8Mne', 'faculty', 'dept-it'),
('u-ps', 'Prof. Prajakta Salunkhe', 'psalunkhe@dummy.ttms.local', '$2a$10$wN9aEaVbE.yF961o1F3nDeGkP0BlnRzI3aC2o.y1J5rYI06Xv8Mne', 'faculty', 'dept-it'),
('u-ak', 'Prof. Akhhil Kulal', 'akulal@dummy.ttms.local', '$2a$10$wN9aEaVbE.yF961o1F3nDeGkP0BlnRzI3aC2o.y1J5rYI06Xv8Mne', 'faculty', 'dept-it'),
('u-am', 'Prof. Akshay Mhalaskar', 'amhalaskar@dummy.ttms.local', '$2a$10$wN9aEaVbE.yF961o1F3nDeGkP0BlnRzI3aC2o.y1J5rYI06Xv8Mne', 'faculty', 'dept-it'),
('u-pv', 'Prof. Pragati Vaishnav', 'pvaishnav@dummy.ttms.local', '$2a$10$wN9aEaVbE.yF961o1F3nDeGkP0BlnRzI3aC2o.y1J5rYI06Xv8Mne', 'faculty', 'dept-it'),
('u-sd', 'Prof. Saurabh Dalvi', 'sdalvi@dummy.ttms.local', '$2a$10$wN9aEaVbE.yF961o1F3nDeGkP0BlnRzI3aC2o.y1J5rYI06Xv8Mne', 'faculty', 'dept-it'),
('u-mks', 'Prof. Mandar K. Sase', 'msase@dummy.ttms.local', '$2a$10$wN9aEaVbE.yF961o1F3nDeGkP0BlnRzI3aC2o.y1J5rYI06Xv8Mne', 'faculty', 'dept-it'),
('u-an', 'Prof. Ankit Nimbolkar', 'animbolkar@dummy.ttms.local', '$2a$10$wN9aEaVbE.yF961o1F3nDeGkP0BlnRzI3aC2o.y1J5rYI06Xv8Mne', 'faculty', 'dept-it'),
-- REAL STUDENT EMAIL FOR TESTING:
('u-stud', 'Tanish Parekh (VJTI Student)', 'tanishparekh59@gmail.com', '$2a$10$wN9aEaVbE.yF961o1F3nDeGkP0BlnRzI3aC2o.y1J5rYI06Xv8Mne', 'student', 'dept-it')
ON CONFLICT (user_id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name;

-- 4. FACULTY ROSTER (1 Real Email + 30 Dummy Emails)
INSERT INTO faculty (faculty_id, user_id, department_id, name, email, max_weekly_load) VALUES
('FAC-PMC', 'u-pmc', 'dept-ce', 'Prof. P. M. Chawan', 'tanishparekh03@gmail.com', 16),
('FAC-VBN', 'u-vbn', 'dept-ce', 'Dr. V. B. Nikam', 'vbnikam@dummy.ttms.local', 14),
('FAC-MRS', 'u-mrs', 'dept-ce', 'Dr. M. R. Shirole', 'mrshirole@dummy.ttms.local', 14),
('FAC-MMC', 'u-mmc', 'dept-ce', 'Dr. M. M. Chandane', 'mmchandane@dummy.ttms.local', 16),
('FAC-SCS', 'u-scs', 'dept-ce', 'Prof. S. C. Shrawne', 'scshrawne@dummy.ttms.local', 16),
('FAC-VKS', 'u-vks', 'dept-ce', 'Dr. V. K. Sambhe', 'vksambhe@dummy.ttms.local', 14),
('FAC-SSU', 'u-ssu', 'dept-ce', 'Dr. S. S. Udmale', 'ssudmale@dummy.ttms.local', 14),
('FAC-STS', 'u-sts', 'dept-ce', 'Dr. S. T. Shingade', 'stshingade@dummy.ttms.local', 16),
('FAC-MUK', 'u-muk', 'dept-ce', 'Prof. M. U. Kulkarni', 'mukulkarni@dummy.ttms.local', 16),
('FAC-KKJ', 'u-kkj', 'dept-ce', 'Prof. K. K. Joshi', 'kkjoshi@dummy.ttms.local', 16),
('FAC-VJN', 'u-vjn', 'dept-ce', 'Dr. Varshapriya J N', 'vjn@dummy.ttms.local', 14),
('FAC-SSS', 'u-sss', 'dept-ce', 'Dr. S. S. Suratkar', 'sssuratkar@dummy.ttms.local', 14),
('FAC-VDD', 'u-vdd', 'dept-ce', 'Prof. V. D. Dhore', 'vddhore@dummy.ttms.local', 16),
('FAC-SAK', 'u-sak', 'dept-ce', 'Prof. S. A. Khedkar', 'sakhedkar@dummy.ttms.local', 16),
('FAC-SSL', 'u-ssl', 'dept-ce', 'Prof. S. S. Lachure', 'sslachure@dummy.ttms.local', 16),
('FAC-SGK', 'u-sgk', 'dept-ce', 'Dr. Sopan G. Kolte', 'sgkolte@dummy.ttms.local', 14),
('FAC-NAS', 'u-nas', 'dept-ce', 'Dr. Noshin A. Sabuwala', 'nasabuwala@dummy.ttms.local', 14),
('FAC-NS',  'u-ns',  'dept-ce', 'Dr. Neha Singh', 'nsingh@dummy.ttms.local', 14),
('FAC-RS',  'u-rs',  'dept-ce', 'Dr. Ritika Singh', 'rsingh@dummy.ttms.local', 14),
('FAC-SB',  'u-sb',  'dept-ce', 'Prof. Shreekant Bedekar', 'sbedekar@dummy.ttms.local', 16),
('FAC-IM',  'u-im',  'dept-it', 'Prof. Isaivani Mathiyalagam', 'imathiyalagam@dummy.ttms.local', 16),
('FAC-PSS', 'u-pss', 'dept-it', 'Prof. Prachi S Shinde', 'psshinde@dummy.ttms.local', 16),
('FAC-HCD', 'u-hcd', 'dept-it', 'Prof. Harshala C Dalal', 'hcdalal@dummy.ttms.local', 16),
('FAC-RP',  'u-rp',  'dept-it', 'Prof. Riddhi Patil', 'rpatil@dummy.ttms.local', 16),
('FAC-PS',  'u-ps',  'dept-it', 'Prof. Prajakta Salunkhe', 'psalunkhe@dummy.ttms.local', 16),
('FAC-AK',  'u-ak',  'dept-it', 'Prof. Akhhil Kulal', 'akulal@dummy.ttms.local', 16),
('FAC-AM',  'u-am',  'dept-it', 'Prof. Akshay Mhalaskar', 'amhalaskar@dummy.ttms.local', 16),
('FAC-PV',  'u-pv',  'dept-it', 'Prof. Pragati Vaishnav', 'pvaishnav@dummy.ttms.local', 16),
('FAC-SD',  'u-sd',  'dept-it', 'Prof. Saurabh Dalvi', 'sdalvi@dummy.ttms.local', 16),
('FAC-MKS', 'u-mks', 'dept-it', 'Prof. Mandar K. Sase', 'msase@dummy.ttms.local', 16),
('FAC-AN',  'u-an',  'dept-it', 'Prof. Ankit Nimbolkar', 'animbolkar@dummy.ttms.local', 16)
ON CONFLICT (faculty_id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email;

-- 5. ROOMS & LABORATORIES
INSERT INTO rooms (room_id, room_no, capacity, type) VALUES
('RM-AL001', 'AL 001', 80, 'Lecture Hall'),
('RM-AL004', 'AL 004', 80, 'Lecture Hall'),
('RM-AL201', 'AL 201', 80, 'Lecture Hall'),
('RM-AL202', 'AL 202', 80, 'Lecture Hall'),
('RM-AL207', 'AL 207', 80, 'Lecture Hall'),
('RM-AL302', 'AL 302', 80, 'Lecture Hall'),
('RM-LAB1A', 'Lab 1A', 40, 'Laboratory'),
('RM-LAB1B', 'Lab 1B', 40, 'Laboratory'),
('RM-LABIL', 'Lab IL', 40, 'Laboratory'),
('RM-LAB2A', 'Lab 2A', 40, 'Laboratory'),
('RM-LAB2B', 'Lab 2B', 40, 'Laboratory'),
('RM-LAB2C', 'Lab 2C', 40, 'Laboratory'),
('RM-LAB3A', 'Lab 3A', 40, 'Laboratory'),
('RM-LAB3B', 'Lab 3B', 40, 'Laboratory'),
('RM-LABNL', 'Networking Lab (NL)', 40, 'Laboratory'),
('RM-INTERNET', 'Internet Lab', 60, 'Laboratory'),
('RM-ARVR', 'AR/VR Lab', 40, 'Laboratory'),
('RM-DL003', 'DL 003 Seminar Room', 60, 'Seminar Room')
ON CONFLICT (room_id) DO NOTHING;

-- 6. STUDENT BATCHES & DIVISIONS
INSERT INTO batches (batch_id, department_id, division, year, strength, parent_batch_id) VALUES
('BATCH-BTECH-CE', 'dept-ce', 'B.Tech CE', 4, 75, NULL),
('BATCH-BTECH-IT', 'dept-it', 'B.Tech IT', 4, 75, NULL),
('BATCH-TY-CE',    'dept-ce', 'TY B.Tech (CE)', 3, 72, NULL),
('BATCH-TY-IT',    'dept-it', 'TY B.Tech (IT)', 3, 70, NULL),
('BATCH-SY-CE',    'dept-ce', 'SY B.Tech (CE)', 2, 74, NULL),
('BATCH-SY-IT',    'dept-it', 'SY B.Tech (IT)', 2, 72, NULL)
ON CONFLICT (batch_id) DO NOTHING;

-- 7. TIME SLOTS (Monday to Friday, Periods 1 to 9)
INSERT INTO time_slots (slot_id, day, period_no, start_time, end_time) VALUES
-- Monday
('SLOT-MON-1', 'Mon', 1, '08:30', '09:25'),
('SLOT-MON-2', 'Mon', 2, '09:30', '10:25'),
('SLOT-MON-3', 'Mon', 3, '10:30', '11:25'),
('SLOT-MON-4', 'Mon', 4, '11:30', '12:25'),
('SLOT-MON-5', 'Mon', 5, '12:30', '13:25'),
('SLOT-MON-6', 'Mon', 6, '14:30', '15:25'),
('SLOT-MON-7', 'Mon', 7, '15:30', '16:25'),
('SLOT-MON-8', 'Mon', 8, '16:30', '17:25'),
('SLOT-MON-9', 'Mon', 9, '17:30', '18:25'),
-- Tuesday
('SLOT-TUE-1', 'Tue', 1, '08:30', '09:25'),
('SLOT-TUE-2', 'Tue', 2, '09:30', '10:25'),
('SLOT-TUE-3', 'Tue', 3, '10:30', '11:25'),
('SLOT-TUE-4', 'Tue', 4, '11:30', '12:25'),
('SLOT-TUE-5', 'Tue', 5, '12:30', '13:25'),
('SLOT-TUE-6', 'Tue', 6, '14:30', '15:25'),
('SLOT-TUE-7', 'Tue', 7, '15:30', '16:25'),
('SLOT-TUE-8', 'Tue', 8, '16:30', '17:25'),
('SLOT-TUE-9', 'Tue', 9, '17:30', '18:25'),
-- Wednesday
('SLOT-WED-1', 'Wed', 1, '08:30', '09:25'),
('SLOT-WED-2', 'Wed', 2, '09:30', '10:25'),
('SLOT-WED-3', 'Wed', 3, '10:30', '11:25'),
('SLOT-WED-4', 'Wed', 4, '11:30', '12:25'),
('SLOT-WED-5', 'Wed', 5, '12:30', '13:25'),
('SLOT-WED-6', 'Wed', 6, '14:30', '15:25'),
('SLOT-WED-7', 'Wed', 7, '15:30', '16:25'),
('SLOT-WED-8', 'Wed', 8, '16:30', '17:25'),
('SLOT-WED-9', 'Wed', 9, '17:30', '18:25'),
-- Thursday
('SLOT-THU-1', 'Thu', 1, '08:30', '09:25'),
('SLOT-THU-2', 'Thu', 2, '09:30', '10:25'),
('SLOT-THU-3', 'Thu', 3, '10:30', '11:25'),
('SLOT-THU-4', 'Thu', 4, '11:30', '12:25'),
('SLOT-THU-5', 'Thu', 5, '12:30', '13:25'),
('SLOT-THU-6', 'Thu', 6, '14:30', '15:25'),
('SLOT-THU-7', 'Thu', 7, '15:30', '16:25'),
('SLOT-THU-8', 'Thu', 8, '16:30', '17:25'),
('SLOT-THU-9', 'Thu', 9, '17:30', '18:25'),
-- Friday
('SLOT-FRI-1', 'Fri', 1, '08:30', '09:25'),
('SLOT-FRI-2', 'Fri', 2, '09:30', '10:25'),
('SLOT-FRI-3', 'Fri', 3, '10:30', '11:25'),
('SLOT-FRI-4', 'Fri', 4, '11:30', '12:25'),
('SLOT-FRI-5', 'Fri', 5, '12:30', '13:25'),
('SLOT-FRI-6', 'Fri', 6, '14:30', '15:25'),
('SLOT-FRI-7', 'Fri', 7, '15:30', '16:25'),
('SLOT-FRI-8', 'Fri', 8, '16:30', '17:25'),
('SLOT-FRI-9', 'Fri', 9, '17:30', '18:25')
ON CONFLICT (day, period_no) DO NOTHING;

-- 8. SUBJECTS & CURRICULUM
INSERT INTO subjects (subject_id, department_id, code, name, type, credits, hours_per_week, requires_lab) VALUES
-- Final B.Tech
('SUB-OEII',     'dept-ce', 'OE401',  'Open Elective II', 'Elective', 3, 3, FALSE),
('SUB-DM-BTECH', 'dept-ce', 'CE401',  'Data Management', 'Theory', 3, 3, FALSE),
('SUB-PANS',     'dept-ce', 'CE402A', 'PE III: Predictive Analytics & Network Security', 'Elective', 3, 3, FALSE),
('SUB-ST',       'dept-ce', 'CE402B', 'PE III: Software Testing', 'Elective', 3, 3, FALSE),
('SUB-DL',       'dept-ce', 'CE403A', 'PE IV: Deep Learning', 'Elective', 3, 3, FALSE),
('SUB-QC',       'dept-ce', 'CE403B', 'PE IV: Quantum Computing', 'Elective', 3, 3, FALSE),
('SUB-MDMV-DS',  'dept-ce', 'MDM501', 'MDM V: Data Science', 'Theory', 3, 3, FALSE),
('SUB-MDMV-AI',  'dept-it', 'MDM502', 'MDM V: AIML', 'Theory', 3, 3, FALSE),
('SUB-CPAD-LAB', 'dept-it', 'IT404L', 'Cross Platform App Development Lab', 'Practical', 1, 2, TRUE),
('SUB-PANS-LAB', 'dept-ce', 'CE402L', 'PE III: PANS Lab', 'Practical', 1, 2, TRUE),
('SUB-ST-LAB',   'dept-ce', 'CE402M', 'PE III: ST Lab', 'Practical', 1, 2, TRUE),
('SUB-DL-LAB',   'dept-ce', 'CE403L', 'PE IV: DL Lab', 'Practical', 1, 2, TRUE),
('SUB-QC-LAB',   'dept-ce', 'CE403M', 'PE IV: QC Lab', 'Practical', 1, 2, TRUE),
('SUB-HON-BC',   'dept-ce', 'HON401', 'Honors: Blockchain', 'Theory', 3, 3, FALSE),
('SUB-HON-ARVR', 'dept-it', 'HON402', 'Honors: AR/VR', 'Theory', 3, 3, FALSE),
('SUB-PROJECT',  'dept-ce', 'PROJ4',  'Major Project', 'Practical', 2, 4, FALSE),

-- TY B.Tech (CE)
('SUB-CC-CE',    'dept-ce', 'CE301',  'Compiler Construction', 'Theory', 3, 3, FALSE),
('SUB-ML-CE',    'dept-ce', 'CE302',  'Machine Learning (CE)', 'Theory', 3, 3, FALSE),
('SUB-CN-CE',    'dept-ce', 'CE303',  'Computer Networks (CE)', 'Theory', 3, 3, FALSE),
('SUB-PC-CE',    'dept-ce', 'CE304',  'Parallel Computing (CE)', 'Theory', 3, 3, FALSE),
('SUB-HCI-CE',   'dept-ce', 'CE305',  'Human Computer Interaction', 'Theory', 2, 2, FALSE),
('SUB-MDM3-ML',  'dept-ce', 'MDM301', 'MDM III: ML with Python', 'Theory', 3, 3, FALSE),
('SUB-PE1-IP',   'dept-ce', 'CE306A', 'PE I: Image Processing', 'Elective', 3, 3, FALSE),
('SUB-PE1-OT',   'dept-ce', 'CE306B', 'PE I: Optimization Techniques', 'Elective', 3, 3, FALSE),
('SUB-ML-LAB-CE','dept-ce', 'CE302L', 'Machine Learning Lab (CE)', 'Practical', 1, 2, TRUE),
('SUB-CN-LAB-CE','dept-ce', 'CE303L', 'Computer Network Lab (CE)', 'Practical', 1, 2, TRUE),
('SUB-PC-LAB-CE','dept-ce', 'CE304L', 'Parallel Programming Lab (CE)', 'Practical', 1, 2, TRUE),

-- TY B.Tech (IT)
('SUB-ML-IT',    'dept-it', 'IT301',  'Machine Learning (IT)', 'Theory', 3, 3, FALSE),
('SUB-SE-IT',    'dept-it', 'IT302',  'Software Engineering', 'Theory', 3, 3, FALSE),
('SUB-PC-IT',    'dept-it', 'IT303',  'Parallel Computing (IT)', 'Theory', 3, 3, FALSE),
('SUB-CC-IT',    'dept-it', 'IT304',  'Cloud Computing', 'Theory', 3, 3, FALSE),
('SUB-CY-IT',    'dept-it', 'IT305',  'Cryptography', 'Theory', 2, 2, FALSE),
('SUB-MDM3-DLNN','dept-it', 'MDM302', 'MDM III: DLNN', 'Theory', 3, 3, FALSE),
('SUB-PE1-HCI',  'dept-it', 'IT306',  'PE I: HCI (IT)', 'Elective', 3, 3, FALSE),
('SUB-ML-LAB-IT','dept-it', 'IT301L', 'Machine Learning Lab (IT)', 'Practical', 1, 2, TRUE),
('SUB-SE-LAB-IT','dept-it', 'IT302L', 'Software Engineering Lab (IT)', 'Practical', 1, 2, TRUE),
('SUB-PP-LAB-IT','dept-it', 'IT303L', 'Parallel Programming Lab (IT)', 'Practical', 1, 2, TRUE),

-- SY B.Tech
('SUB-MCE',      'dept-ce', 'MATH201','Mathematics for Computer Engineers', 'Theory', 3, 3, FALSE),
('SUB-DS-CE',    'dept-ce', 'CE201',  'Discrete Structure', 'Theory', 4, 4, FALSE),
('SUB-DAA-CE',   'dept-ce', 'CE202',  'Design & Analysis of Algorithm (CE)', 'Theory', 3, 3, FALSE),
('SUB-OS-CE',    'dept-ce', 'CE203',  'Operating System (CE)', 'Theory', 3, 3, FALSE),
('SUB-MDM1-DS',  'dept-ce', 'MDM101', 'MDM I: Data Science', 'Theory', 2, 2, FALSE),
('SUB-ALGO-LAB-CE','dept-ce','CE202L','Algorithm Lab (CE)', 'Practical', 1, 2, TRUE),
('SUB-OS-LAB-CE','dept-ce', 'CE203L', 'Operating System Lab (CE)', 'Practical', 1, 2, TRUE),
('SUB-PDL-LAB-CE','dept-ce','CE204L', 'Program Development Lab (CE)', 'Practical', 1, 2, TRUE),
('SUB-OST-LAB-CE','dept-ce','CE205L', 'Open Source Technology Lab (CE)', 'Practical', 1, 2, TRUE),
('SUB-DM-IT',    'dept-it', 'IT201',  'Discrete Mathematics (IT)', 'Theory', 4, 4, FALSE),
('SUB-DAA-IT',   'dept-it', 'IT202',  'Design & Analysis of Algorithm (IT)', 'Theory', 3, 3, FALSE),
('SUB-OS-IT',    'dept-it', 'IT203',  'Operating System (IT)', 'Theory', 3, 3, FALSE),
('SUB-MDM1-AIML','dept-it', 'MDM102', 'MDM I: AIML', 'Theory', 2, 2, FALSE),
('SUB-ALGO-LAB-IT','dept-it','IT202L','Algorithm Lab (IT)', 'Practical', 1, 2, TRUE),
('SUB-OS-LAB-IT','dept-it', 'IT203L', 'Operating System Lab (IT)', 'Practical', 1, 2, TRUE),
('SUB-PDL-LAB-IT','dept-it','IT204L', 'Program Development Lab (IT)', 'Practical', 1, 2, TRUE),
('SUB-OST-LAB-IT','dept-it','IT205L', 'Open Source Technology Lab (IT)', 'Practical', 1, 2, TRUE),
('SUB-MIL',      'dept-ce', 'HUM201', 'Modern Indian Languages', 'Theory', 2, 2, FALSE),
('SUB-UHV',      'dept-ce', 'HUM202', 'Universal Human Values', 'Theory', 2, 2, FALSE)
ON CONFLICT (subject_id) DO NOTHING;

-- 9. FACULTY-SUBJECT EXPERTISE MAPPINGS
INSERT INTO faculty_subjects (faculty_id, subject_id) VALUES
('FAC-RP',  'SUB-DM-BTECH'),
('FAC-RS',  'SUB-DM-BTECH'),
('FAC-VJN', 'SUB-PANS'),
('FAC-VJN', 'SUB-PANS-LAB'),
('FAC-SB',  'SUB-ST'),
('FAC-SB',  'SUB-ST-LAB'),
('FAC-HCD', 'SUB-DL'),
('FAC-HCD', 'SUB-DL-LAB'),
('FAC-AK',  'SUB-DL'),
('FAC-AK',  'SUB-DL-LAB'),
('FAC-STS', 'SUB-QC'),
('FAC-STS', 'SUB-QC-LAB'),
('FAC-STS', 'SUB-PC-IT'),
('FAC-STS', 'SUB-PP-LAB-IT'),
('FAC-PV',  'SUB-MDMV-DS'),
('FAC-PV',  'SUB-CPAD-LAB'),
('FAC-PV',  'SUB-MDM3-ML'),
('FAC-AN',  'SUB-MDMV-DS'),
('FAC-AN',  'SUB-CC-CE'),
('FAC-AN',  'SUB-CN-LAB-CE'),
('FAC-AM',  'SUB-CPAD-LAB'),
('FAC-MRS', 'SUB-HON-BC'),
('FAC-SCS', 'SUB-ML-CE'),
('FAC-SCS', 'SUB-ML-LAB-CE'),
('FAC-MMC', 'SUB-CN-CE'),
('FAC-MMC', 'SUB-CN-LAB-CE'),
('FAC-MKS', 'SUB-PC-CE'),
('FAC-MKS', 'SUB-PC-LAB-CE'),
('FAC-SAK', 'SUB-HCI-CE'),
('FAC-NAS', 'SUB-PE1-IP'),
('FAC-NAS', 'SUB-DS-CE'),
('FAC-SSU', 'SUB-ML-IT'),
('FAC-SSU', 'SUB-ML-LAB-IT'),
('FAC-PMC', 'SUB-SE-IT'),
('FAC-PMC', 'SUB-SE-LAB-IT'),
('FAC-KKJ', 'SUB-CC-IT'),
('FAC-IM',  'SUB-CY-IT'),
('FAC-IM',  'SUB-MDM3-DLNN'),
('FAC-VKS', 'SUB-PE1-HCI'),
('FAC-MUK', 'SUB-DAA-CE'),
('FAC-MUK', 'SUB-ALGO-LAB-CE'),
('FAC-VDD', 'SUB-OS-CE'),
('FAC-VDD', 'SUB-OS-LAB-CE'),
('FAC-SGK', 'SUB-MDM1-DS'),
('FAC-SGK', 'SUB-OS-IT'),
('FAC-SGK', 'SUB-OS-LAB-IT'),
('FAC-SD',  'SUB-PDL-LAB-CE'),
('FAC-VBN', 'SUB-DM-IT'),
('FAC-VBN', 'SUB-PDL-LAB-IT'),
('FAC-SSL', 'SUB-DAA-IT'),
('FAC-SSL', 'SUB-ALGO-LAB-IT'),
('FAC-PSS', 'SUB-OST-LAB-IT'),
('FAC-SGK', 'SUB-MCE'),
('FAC-SAK', 'SUB-MCE'),
('FAC-SGK', 'SUB-UHV'),
('FAC-NS',  'SUB-UHV'),
('FAC-NS',  'SUB-MIL'),
('FAC-SSL', 'SUB-MIL'),
('FAC-SSL', 'SUB-HON-ARVR'),
('FAC-KKJ', 'SUB-PE1-OT'),
('FAC-PS',  'SUB-MDMV-AI')
ON CONFLICT DO NOTHING;

-- 10. TIMETABLE CONTAINER
INSERT INTO timetables (timetable_id, term_id, version_no, status, created_by, created_at, published_at) VALUES
('TT-2026-ODD', 'term-2026-odd', 1, 'Published', 'u-coord', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (timetable_id) DO NOTHING;

-- 11. SESSIONS (Curricular Demands)
INSERT INTO sessions (session_id, timetable_id, subject_id, faculty_id, room_id, session_type, duration_slots, weekly_frequency) VALUES
('SESS-BTECH-DM-1',   'TT-2026-ODD', 'SUB-DM-BTECH', 'FAC-RP',  'RM-AL202', 'Lecture', 1, 3),
('SESS-BTECH-PANS-1', 'TT-2026-ODD', 'SUB-PANS',     'FAC-VJN', 'RM-AL202', 'Lecture', 1, 3),
('SESS-BTECH-DL-1',   'TT-2026-ODD', 'SUB-DL',       'FAC-HCD', 'RM-AL202', 'Lecture', 1, 3),
('SESS-BTECH-CPAD',   'TT-2026-ODD', 'SUB-CPAD-LAB', 'FAC-PV',  'RM-LAB1A', 'Lab',     2, 1),
('SESS-TY-CC',        'TT-2026-ODD', 'SUB-CC-CE',    'FAC-AN',  'RM-AL202', 'Lecture', 1, 3),
('SESS-TY-ML',        'TT-2026-ODD', 'SUB-ML-CE',    'FAC-SCS', 'RM-AL202', 'Lecture', 1, 3),
('SESS-TY-CN',        'TT-2026-ODD', 'SUB-CN-CE',    'FAC-MMC', 'RM-AL202', 'Lecture', 1, 3),
('SESS-TY-PC',        'TT-2026-ODD', 'SUB-PC-CE',    'FAC-MKS', 'RM-AL202', 'Lecture', 1, 3),
('SESS-TY-ML-LAB',    'TT-2026-ODD', 'SUB-ML-LAB-CE','FAC-SCS', 'RM-LAB3A', 'Lab',     2, 1),
('SESS-SY-DAA',       'TT-2026-ODD', 'SUB-DAA-CE',   'FAC-MUK', 'RM-AL201', 'Lecture', 1, 3),
('SESS-SY-OS',        'TT-2026-ODD', 'SUB-OS-CE',    'FAC-VDD', 'RM-AL201', 'Lecture', 1, 3),
('SESS-SY-DS',        'TT-2026-ODD', 'SUB-DS-CE',    'FAC-NAS', 'RM-AL201', 'Lecture', 1, 4),
('SESS-SY-ALGO-LAB',  'TT-2026-ODD', 'SUB-ALGO-LAB-CE','FAC-MUK','RM-LAB2A','Lab',     2, 1),
('SESS-BTECH-OEII',   'TT-2026-ODD', 'SUB-OEII',     'FAC-PV',  'RM-AL004', 'Lecture', 1, 3)
ON CONFLICT (session_id) DO NOTHING;

-- 12. BATCH TO SESSION MAPPINGS
INSERT INTO session_batches (session_id, batch_id) VALUES
('SESS-BTECH-DM-1',   'BATCH-BTECH-CE'),
('SESS-BTECH-PANS-1', 'BATCH-BTECH-CE'),
('SESS-BTECH-DL-1',   'BATCH-BTECH-CE'),
('SESS-BTECH-CPAD',   'BATCH-BTECH-CE'),
('SESS-TY-CC',        'BATCH-TY-CE'),
('SESS-TY-ML',        'BATCH-TY-CE'),
('SESS-TY-CN',        'BATCH-TY-CE'),
('SESS-TY-PC',        'BATCH-TY-CE'),
('SESS-TY-ML-LAB',    'BATCH-TY-CE'),
('SESS-SY-DAA',       'BATCH-SY-CE'),
('SESS-SY-OS',        'BATCH-SY-CE'),
('SESS-SY-DS',        'BATCH-SY-CE'),
('SESS-SY-ALGO-LAB',  'BATCH-SY-CE'),
('SESS-BTECH-OEII',   'BATCH-BTECH-CE'),
('SESS-BTECH-OEII',   'BATCH-BTECH-IT') -- Combined Elective across CE & IT
ON CONFLICT DO NOTHING;

-- 13. ACTUAL TIMETABLE ENTRIES (From Timetable PDF)
INSERT INTO timetable_entries (entry_id, timetable_id, session_id, slot_id, room_id, faculty_id) VALUES
-- Final B.Tech CE
('ENT-BTECH-1', 'TT-2026-ODD', 'SESS-BTECH-CPAD',   'SLOT-MON-2', 'RM-LAB1A', 'FAC-PV'),
('ENT-BTECH-2', 'TT-2026-ODD', 'SESS-BTECH-CPAD',   'SLOT-MON-3', 'RM-LAB1A', 'FAC-PV'),
('ENT-BTECH-3', 'TT-2026-ODD', 'SESS-BTECH-PANS-1', 'SLOT-MON-4', 'RM-AL202', 'FAC-VJN'),
('ENT-BTECH-4', 'TT-2026-ODD', 'SESS-BTECH-DL-1',   'SLOT-TUE-4', 'RM-AL202', 'FAC-HCD'),
('ENT-BTECH-5', 'TT-2026-ODD', 'SESS-BTECH-DM-1',   'SLOT-WED-4', 'RM-AL202', 'FAC-RP'),
('ENT-BTECH-6', 'TT-2026-ODD', 'SESS-BTECH-DM-1',   'SLOT-THU-3', 'RM-AL004', 'FAC-RP'),
('ENT-BTECH-7', 'TT-2026-ODD', 'SESS-BTECH-OEII',   'SLOT-FRI-6', 'RM-AL004', 'FAC-PV'),

-- TY B.Tech CE
('ENT-TY-1',    'TT-2026-ODD', 'SESS-TY-CC',        'SLOT-MON-2', 'RM-AL202', 'FAC-AN'),
('ENT-TY-2',    'TT-2026-ODD', 'SESS-TY-ML',        'SLOT-MON-3', 'RM-AL202', 'FAC-SCS'),
('ENT-TY-3',    'TT-2026-ODD', 'SESS-TY-ML-LAB',    'SLOT-MON-4', 'RM-LAB3A', 'FAC-SCS'),
('ENT-TY-4',    'TT-2026-ODD', 'SESS-TY-ML-LAB',    'SLOT-MON-5', 'RM-LAB3A', 'FAC-SCS'),
('ENT-TY-5',    'TT-2026-ODD', 'SESS-TY-PC',        'SLOT-THU-2', 'RM-AL202', 'FAC-MKS'),
('ENT-TY-6',    'TT-2026-ODD', 'SESS-TY-CN',        'SLOT-FRI-6', 'RM-AL202', 'FAC-MMC'),

-- SY B.Tech CE
('ENT-SY-1',    'TT-2026-ODD', 'SESS-SY-DS',        'SLOT-MON-4', 'RM-AL201', 'FAC-NAS'),
('ENT-SY-2',    'TT-2026-ODD', 'SESS-SY-DAA',       'SLOT-MON-3', 'RM-AL201', 'FAC-MUK'),
('ENT-SY-3',    'TT-2026-ODD', 'SESS-SY-ALGO-LAB',  'SLOT-MON-6', 'RM-LAB2A', 'FAC-MUK'),
('ENT-SY-4',    'TT-2026-ODD', 'SESS-SY-ALGO-LAB',  'SLOT-MON-7', 'RM-LAB2A', 'FAC-MUK'),
('ENT-SY-5',    'TT-2026-ODD', 'SESS-SY-OS',        'SLOT-THU-3', 'RM-AL201', 'FAC-VDD')
ON CONFLICT (entry_id) DO NOTHING;

-- 14. ENTRY BATCH MAPPINGS
INSERT INTO entry_batches (entry_id, batch_id, timetable_id, slot_id) VALUES
('ENT-BTECH-1', 'BATCH-BTECH-CE', 'TT-2026-ODD', 'SLOT-MON-2'),
('ENT-BTECH-2', 'BATCH-BTECH-CE', 'TT-2026-ODD', 'SLOT-MON-3'),
('ENT-BTECH-3', 'BATCH-BTECH-CE', 'TT-2026-ODD', 'SLOT-MON-4'),
('ENT-BTECH-4', 'BATCH-BTECH-CE', 'TT-2026-ODD', 'SLOT-TUE-4'),
('ENT-BTECH-5', 'BATCH-BTECH-CE', 'TT-2026-ODD', 'SLOT-WED-4'),
('ENT-BTECH-6', 'BATCH-BTECH-CE', 'TT-2026-ODD', 'SLOT-THU-3'),
('ENT-BTECH-7', 'BATCH-BTECH-CE', 'TT-2026-ODD', 'SLOT-FRI-6'),
('ENT-BTECH-7', 'BATCH-BTECH-IT', 'TT-2026-ODD', 'SLOT-FRI-6'), -- Combined
('ENT-TY-1',    'BATCH-TY-CE',    'TT-2026-ODD', 'SLOT-MON-2'),
('ENT-TY-2',    'BATCH-TY-CE',    'TT-2026-ODD', 'SLOT-MON-3'),
('ENT-TY-3',    'BATCH-TY-CE',    'TT-2026-ODD', 'SLOT-MON-4'),
('ENT-TY-4',    'BATCH-TY-CE',    'TT-2026-ODD', 'SLOT-MON-5'),
('ENT-TY-5',    'BATCH-TY-CE',    'TT-2026-ODD', 'SLOT-THU-2'),
('ENT-TY-6',    'BATCH-TY-CE',    'TT-2026-ODD', 'SLOT-FRI-6'),
('ENT-SY-1',    'BATCH-SY-CE',    'TT-2026-ODD', 'SLOT-MON-4'),
('ENT-SY-2',    'BATCH-SY-CE',    'TT-2026-ODD', 'SLOT-MON-3'),
('ENT-SY-3',    'BATCH-SY-CE',    'TT-2026-ODD', 'SLOT-MON-6'),
('ENT-SY-4',    'BATCH-SY-CE',    'TT-2026-ODD', 'SLOT-MON-7'),
('ENT-SY-5',    'BATCH-SY-CE',    'TT-2026-ODD', 'SLOT-THU-3')
ON CONFLICT DO NOTHING;

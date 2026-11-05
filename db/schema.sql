-- =============================================================================
-- VJTI Time Table Management System (TTMS)
-- PostgreSQL 16 Relational DDL - 3rd Normal Form (3NF)
-- Reference: Assignment 7 Section 2 (Data Design, Tables 2, 3, and 4)
-- =============================================================================

CREATE TABLE IF NOT EXISTS departments (
    department_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('coordinator', 'faculty', 'student')),
    department_id VARCHAR(50) REFERENCES departments(department_id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS academic_terms (
    term_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    department_id VARCHAR(50) NOT NULL REFERENCES departments(department_id) ON DELETE RESTRICT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS faculty (
    faculty_id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) UNIQUE REFERENCES users(user_id) ON DELETE SET NULL,
    department_id VARCHAR(50) NOT NULL REFERENCES departments(department_id) ON DELETE RESTRICT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    max_weekly_load INTEGER NOT NULL CHECK (max_weekly_load >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subjects (
    subject_id VARCHAR(50) PRIMARY KEY,
    department_id VARCHAR(50) NOT NULL REFERENCES departments(department_id) ON DELETE RESTRICT,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('Theory', 'Practical', 'Elective')),
    credits INTEGER NOT NULL CHECK (credits >= 0),
    hours_per_week INTEGER NOT NULL CHECK (hours_per_week > 0),
    requires_lab BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS faculty_subjects (
    faculty_id VARCHAR(50) NOT NULL REFERENCES faculty(faculty_id) ON DELETE CASCADE,
    subject_id VARCHAR(50) NOT NULL REFERENCES subjects(subject_id) ON DELETE CASCADE,
    PRIMARY KEY (faculty_id, subject_id)
);

CREATE TABLE IF NOT EXISTS batches (
    batch_id VARCHAR(50) PRIMARY KEY,
    department_id VARCHAR(50) NOT NULL REFERENCES departments(department_id) ON DELETE RESTRICT,
    division VARCHAR(50) NOT NULL,
    year INTEGER NOT NULL CHECK (year IN (1, 2, 3, 4)),
    strength INTEGER NOT NULL CHECK (strength > 0),
    parent_batch_id VARCHAR(50) REFERENCES batches(batch_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rooms (
    room_id VARCHAR(50) PRIMARY KEY,
    room_no VARCHAR(50) NOT NULL UNIQUE,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    type VARCHAR(30) NOT NULL CHECK (type IN ('Lecture Hall', 'Laboratory', 'Seminar Room')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS time_slots (
    slot_id VARCHAR(50) PRIMARY KEY,
    day VARCHAR(10) NOT NULL CHECK (day IN ('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat')),
    period_no INTEGER NOT NULL CHECK (period_no BETWEEN 1 AND 10),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    CONSTRAINT uq_day_period UNIQUE (day, period_no)
);

CREATE TABLE IF NOT EXISTS faculty_availability (
    faculty_id VARCHAR(50) NOT NULL REFERENCES faculty(faculty_id) ON DELETE CASCADE,
    slot_id VARCHAR(50) NOT NULL REFERENCES time_slots(slot_id) ON DELETE CASCADE,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (faculty_id, slot_id)
);

CREATE TABLE IF NOT EXISTS timetables (
    timetable_id VARCHAR(50) PRIMARY KEY,
    term_id VARCHAR(50) NOT NULL REFERENCES academic_terms(term_id) ON DELETE RESTRICT,
    version_no INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(30) NOT NULL CHECK (status IN ('Draft', 'Under_Review', 'Finalized', 'Published', 'Revised', 'Archived')),
    created_by VARCHAR(50) NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS sessions (
    session_id VARCHAR(50) PRIMARY KEY,
    timetable_id VARCHAR(50) NOT NULL REFERENCES timetables(timetable_id) ON DELETE CASCADE,
    subject_id VARCHAR(50) NOT NULL REFERENCES subjects(subject_id) ON DELETE RESTRICT,
    faculty_id VARCHAR(50) NOT NULL REFERENCES faculty(faculty_id) ON DELETE RESTRICT,
    room_id VARCHAR(50) REFERENCES rooms(room_id) ON DELETE RESTRICT,
    session_type VARCHAR(20) NOT NULL CHECK (session_type IN ('Lecture', 'Lab')),
    duration_slots INTEGER NOT NULL DEFAULT 1 CHECK (duration_slots >= 1),
    weekly_frequency INTEGER NOT NULL DEFAULT 1 CHECK (weekly_frequency >= 1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS session_batches (
    session_id VARCHAR(50) NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
    batch_id VARCHAR(50) NOT NULL REFERENCES batches(batch_id) ON DELETE RESTRICT,
    PRIMARY KEY (session_id, batch_id)
);

CREATE TABLE IF NOT EXISTS timetable_entries (
    entry_id VARCHAR(50) PRIMARY KEY,
    timetable_id VARCHAR(50) NOT NULL REFERENCES timetables(timetable_id) ON DELETE CASCADE,
    session_id VARCHAR(50) NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
    slot_id VARCHAR(50) NOT NULL REFERENCES time_slots(slot_id) ON DELETE RESTRICT,
    room_id VARCHAR(50) NOT NULL REFERENCES rooms(room_id) ON DELETE RESTRICT,
    faculty_id VARCHAR(50) NOT NULL REFERENCES faculty(faculty_id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Hard Constraints from Assignment 7 Table 4
    CONSTRAINT uq_room_slot UNIQUE (timetable_id, room_id, slot_id),
    CONSTRAINT uq_faculty_slot UNIQUE (timetable_id, faculty_id, slot_id)
);

CREATE TABLE IF NOT EXISTS entry_batches (
    entry_id VARCHAR(50) NOT NULL REFERENCES timetable_entries(entry_id) ON DELETE CASCADE,
    batch_id VARCHAR(50) NOT NULL REFERENCES batches(batch_id) ON DELETE RESTRICT,
    timetable_id VARCHAR(50) NOT NULL REFERENCES timetables(timetable_id) ON DELETE CASCADE,
    slot_id VARCHAR(50) NOT NULL REFERENCES time_slots(slot_id) ON DELETE RESTRICT,
    PRIMARY KEY (entry_id, batch_id),
    CONSTRAINT uq_batch_slot UNIQUE (timetable_id, batch_id, slot_id)
);

CREATE TABLE IF NOT EXISTS leave_requests (
    leave_id VARCHAR(50) PRIMARY KEY,
    faculty_id VARCHAR(50) NOT NULL REFERENCES faculty(faculty_id) ON DELETE CASCADE,
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('Reported', 'Processed', 'Cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_leave_dates CHECK (from_date <= to_date)
);

CREATE TABLE IF NOT EXISTS substitutions (
    sub_id VARCHAR(50) PRIMARY KEY,
    leave_id VARCHAR(50) NOT NULL REFERENCES leave_requests(leave_id) ON DELETE CASCADE,
    entry_id VARCHAR(50) NOT NULL REFERENCES timetable_entries(entry_id) ON DELETE CASCADE,
    substitute_faculty_id VARCHAR(50) REFERENCES faculty(faculty_id) ON DELETE SET NULL,
    rescheduled_slot_id VARCHAR(50) REFERENCES time_slots(slot_id) ON DELETE SET NULL,
    rescheduled_room_id VARCHAR(50) REFERENCES rooms(room_id) ON DELETE SET NULL,
    sub_date DATE NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('Substituted', 'Rescheduled')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS change_logs (
    log_id VARCHAR(50) PRIMARY KEY,
    timetable_id VARCHAR(50) NOT NULL REFERENCES timetables(timetable_id) ON DELETE CASCADE,
    change_type VARCHAR(30) NOT NULL CHECK (change_type IN ('Substitution', 'Reschedule', 'Room change', 'Manual Edit', 'Generated')),
    description TEXT NOT NULL,
    reason TEXT NOT NULL,
    changed_by VARCHAR(50) NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    changed_on TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
    notif_id VARCHAR(50) PRIMARY KEY,
    log_id VARCHAR(50) REFERENCES change_logs(log_id) ON DELETE CASCADE,
    recipient_id VARCHAR(50) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    sent_on TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- Performance & Lookup Indexes (Assignment 7 Section 2.4)
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_entries_tt_slot ON timetable_entries(timetable_id, slot_id);
CREATE INDEX IF NOT EXISTS idx_entries_faculty ON timetable_entries(faculty_id);
CREATE INDEX IF NOT EXISTS idx_entries_room ON timetable_entries(room_id);
CREATE INDEX IF NOT EXISTS idx_entry_batches_batch ON entry_batches(batch_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id, is_read);
CREATE INDEX IF NOT EXISTS idx_changelogs_tt ON change_logs(timetable_id);


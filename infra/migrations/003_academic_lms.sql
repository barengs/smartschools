-- 003_academic_lms.sql
-- Write Owner: Service A (Node.js) & Service C (Python for schedules) | Read Access: Rust

CREATE TABLE IF NOT EXISTS academic_lms.academic_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    semester VARCHAR(10) NOT NULL CHECK (semester IN ('ODD', 'EVEN')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS academic_lms.classrooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_period_id UUID NOT NULL REFERENCES academic_lms.academic_periods(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    grade_level SMALLINT NOT NULL,
    homeroom_teacher_id UUID REFERENCES iam_master.teachers_and_staff(id),
    room_code VARCHAR(30),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (academic_period_id, name)
);

CREATE TABLE IF NOT EXISTS academic_lms.classroom_members (
    classroom_id UUID NOT NULL REFERENCES academic_lms.classrooms(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES iam_master.students(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (classroom_id, student_id)
);

CREATE TABLE IF NOT EXISTS academic_lms.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    weekly_hours SMALLINT NOT NULL DEFAULT 2,
    requires_lab BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS academic_lms.schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_period_id UUID NOT NULL REFERENCES academic_lms.academic_periods(id) ON DELETE CASCADE,
    classroom_id UUID NOT NULL REFERENCES academic_lms.classrooms(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES academic_lms.subjects(id) ON DELETE RESTRICT,
    teacher_id UUID NOT NULL REFERENCES iam_master.teachers_and_staff(id) ON DELETE RESTRICT,
    room_code VARCHAR(30),
    day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_schedules_period_day
    ON academic_lms.schedules (academic_period_id, day_of_week, start_time);

CREATE TABLE IF NOT EXISTS academic_lms.teaching_journals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID NOT NULL REFERENCES academic_lms.schedules(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES iam_master.teachers_and_staff(id),
    session_date DATE NOT NULL,
    topic VARCHAR(200) NOT NULL,
    notes TEXT,
    logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS academic_lms.grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_period_id UUID NOT NULL REFERENCES academic_lms.academic_periods(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES iam_master.students(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES academic_lms.subjects(id) ON DELETE RESTRICT,
    assessment_type VARCHAR(30) NOT NULL CHECK (assessment_type IN ('DAILY', 'QUIZ', 'MIDTERM', 'FINAL', 'PRACTICE')),
    score NUMERIC(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
    competency_notes TEXT,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_grades_student_period
    ON academic_lms.grades (student_id, academic_period_id);

CREATE TABLE IF NOT EXISTS academic_lms.e_rapor_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_period_id UUID NOT NULL REFERENCES academic_lms.academic_periods(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES iam_master.students(id) ON DELETE CASCADE,
    tte_signed_pdf_url TEXT NOT NULL,
    tte_signature_hash VARCHAR(128),
    signed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (academic_period_id, student_id)
);

CREATE TABLE IF NOT EXISTS academic_lms.counseling_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES iam_master.students(id) ON DELETE CASCADE,
    counselor_id UUID NOT NULL REFERENCES iam_master.teachers_and_staff(id),
    record_type VARCHAR(20) NOT NULL CHECK (record_type IN ('DISCIPLINE', 'ACHIEVEMENT', 'COUNSELING')),
    points SMALLINT NOT NULL DEFAULT 0,
    encrypted_notes TEXT NOT NULL,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS academic_lms.uks_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES iam_master.students(id) ON DELETE CASCADE,
    officer_user_id UUID REFERENCES iam_master.users(id),
    encrypted_diagnosis TEXT NOT NULL,
    treatment_notes TEXT,
    visited_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS academic_lms.library_catalogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    isbn VARCHAR(32),
    title VARCHAR(200) NOT NULL,
    author VARCHAR(150),
    category VARCHAR(80),
    total_copies INT NOT NULL DEFAULT 1,
    available_copies INT NOT NULL DEFAULT 1,
    ebook_s3_key TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS academic_lms.library_loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    catalog_id UUID NOT NULL REFERENCES academic_lms.library_catalogs(id) ON DELETE RESTRICT,
    borrower_user_id UUID NOT NULL REFERENCES iam_master.users(id) ON DELETE CASCADE,
    borrowed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    due_at TIMESTAMPTZ NOT NULL,
    returned_at TIMESTAMPTZ,
    status VARCHAR(20) NOT NULL DEFAULT 'BORROWED' CHECK (status IN ('BORROWED', 'RETURNED', 'OVERDUE'))
);

CREATE TABLE IF NOT EXISTS academic_lms.assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qr_code VARCHAR(80) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    location VARCHAR(100),
    condition_status VARCHAR(20) NOT NULL DEFAULT 'GOOD' CHECK (condition_status IN ('GOOD', 'MINOR_DAMAGE', 'BROKEN', 'DISPOSED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS academic_lms.maintenance_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES academic_lms.assets(id) ON DELETE CASCADE,
    reporter_user_id UUID NOT NULL REFERENCES iam_master.users(id),
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);


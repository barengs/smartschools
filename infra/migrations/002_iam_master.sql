-- 002_iam_master.sql
-- Write Owner: Service A (Node.js) | Read Access: Rust, Python

CREATE TABLE IF NOT EXISTS iam_master.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(64) NOT NULL UNIQUE,
    email VARCHAR(150) UNIQUE,
    phone VARCHAR(32),
    password_hash TEXT NOT NULL,
    pin_hash TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS iam_master.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS iam_master.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) NOT NULL UNIQUE,
    module VARCHAR(50) NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS iam_master.role_permissions (
    role_id UUID NOT NULL REFERENCES iam_master.roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES iam_master.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS iam_master.user_roles (
    user_id UUID NOT NULL REFERENCES iam_master.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES iam_master.roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS iam_master.identity_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES iam_master.users(id) ON DELETE CASCADE,
    rfid_uid VARCHAR(64) NOT NULL UNIQUE,
    qr_token VARCHAR(128) NOT NULL UNIQUE,
    card_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
        CHECK (card_status IN ('ACTIVE', 'LOST', 'BLOCKED')),
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_identity_cards_active_rfid
    ON iam_master.identity_cards (rfid_uid)
    WHERE card_status = 'ACTIVE';

CREATE TABLE IF NOT EXISTS iam_master.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES iam_master.users(id) ON DELETE CASCADE,
    nis VARCHAR(32) UNIQUE,
    nisn VARCHAR(32) UNIQUE,
    nik VARCHAR(32) UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('MALE', 'FEMALE')),
    birth_date DATE,
    blood_type VARCHAR(5),
    allergy_notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'CANDIDATE'
        CHECK (status IN ('CANDIDATE', 'ACTIVE', 'GRADUATED', 'TRANSFERRED', 'DROPPED')),
    dapodik_sync_id VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS iam_master.teachers_and_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES iam_master.users(id) ON DELETE CASCADE,
    nip_nuptk VARCHAR(40) UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    employment_status VARCHAR(30) NOT NULL DEFAULT 'PERMANENT'
        CHECK (employment_status IN ('PNS', 'PPPK', 'PERMANENT', 'HONORER')),
    position VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS iam_master.parents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES iam_master.users(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    occupation VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS iam_master.student_parent_relations (
    student_id UUID NOT NULL REFERENCES iam_master.students(id) ON DELETE CASCADE,
    parent_id UUID NOT NULL REFERENCES iam_master.parents(id) ON DELETE CASCADE,
    relation_type VARCHAR(20) NOT NULL CHECK (relation_type IN ('FATHER', 'MOTHER', 'GUARDIAN')),
    is_primary_contact BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (student_id, parent_id)
);

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON iam_master.users
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_identity_cards_updated_at BEFORE UPDATE ON iam_master.identity_cards
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_students_updated_at BEFORE UPDATE ON iam_master.students
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_teachers_updated_at BEFORE UPDATE ON iam_master.teachers_and_staff
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_parents_updated_at BEFORE UPDATE ON iam_master.parents
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


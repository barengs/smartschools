-- 007_ppdb_applications.sql
-- Write Owner: Service A (Node.js) — E-PPDB Registration & One-Click Migration

CREATE TABLE IF NOT EXISTS academic_lms.ppdb_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_number VARCHAR(40) NOT NULL UNIQUE,
    academic_period_id UUID REFERENCES academic_lms.academic_periods(id) ON DELETE SET NULL,
    student_id UUID NOT NULL UNIQUE REFERENCES iam_master.students(id) ON DELETE CASCADE,
    admission_track VARCHAR(30) NOT NULL DEFAULT 'REGULER'
        CHECK (admission_track IN ('ZONASI', 'PRESTASI', 'AFIRMASI', 'MUTASI', 'REGULER')),
    previous_school VARCHAR(150),
    parent_name VARCHAR(150) NOT NULL,
    parent_phone VARCHAR(32) NOT NULL,
    parent_email VARCHAR(150),
    documents_jsonb JSONB NOT NULL DEFAULT '[]'::jsonb,
    verification_status VARCHAR(25) NOT NULL DEFAULT 'DRAFT'
        CHECK (verification_status IN ('DRAFT', 'SUBMITTED', 'VERIFIED', 'REJECTED', 'ACCEPTED', 'MIGRATED')),
    verification_notes TEXT,
    verified_by UUID REFERENCES iam_master.users(id),
    verified_at TIMESTAMPTZ,
    invoice_id UUID REFERENCES finance_analytics.invoices(id) ON DELETE SET NULL,
    migrated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ppdb_status_created
    ON academic_lms.ppdb_applications (verification_status, created_at DESC);

CREATE TRIGGER trg_ppdb_applications_updated_at
    BEFORE UPDATE ON academic_lms.ppdb_applications
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


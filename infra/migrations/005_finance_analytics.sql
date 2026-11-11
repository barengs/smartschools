-- 005_finance_analytics.sql
-- Write Owner: Service A (Node.js for invoices) & Service C (Python for ews_student_risk_scores)

CREATE TABLE IF NOT EXISTS finance_analytics.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(64) NOT NULL UNIQUE,
    student_id UUID NOT NULL REFERENCES iam_master.students(id) ON DELETE RESTRICT,
    billing_type VARCHAR(40) NOT NULL CHECK (billing_type IN ('PPDB_FEE', 'SPP', 'BUILDING_FEE', 'EXAM_FEE', 'OTHER')),
    amount BIGINT NOT NULL CHECK (amount > 0),
    due_date DATE NOT NULL,
    status VARCHAR(15) NOT NULL DEFAULT 'UNPAID' CHECK (status IN ('UNPAID', 'PAID', 'EXPIRED', 'CANCELLED')),
    va_number VARCHAR(64),
    qris_string TEXT,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_student_status
    ON finance_analytics.invoices (student_id, status);

CREATE TABLE IF NOT EXISTS finance_analytics.ews_student_risk_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES iam_master.students(id) ON DELETE CASCADE,
    calculated_date DATE NOT NULL,
    attendance_risk_score SMALLINT NOT NULL CHECK (attendance_risk_score BETWEEN 0 AND 100),
    academic_drop_score SMALLINT NOT NULL CHECK (academic_drop_score BETWEEN 0 AND 100),
    risk_level VARCHAR(15) NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'CRITICAL')),
    recommended_action TEXT NOT NULL,
    is_resolved_by_bk BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, calculated_date)
);

CREATE INDEX IF NOT EXISTS idx_ews_risk_level_date
    ON finance_analytics.ews_student_risk_scores (calculated_date DESC, risk_level);

CREATE TRIGGER trg_invoices_updated_at BEFORE UPDATE ON finance_analytics.invoices
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


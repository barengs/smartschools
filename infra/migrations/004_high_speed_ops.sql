-- 004_high_speed_ops.sql
-- Primary Write Owner: Service B (Rust / Axum) | cbt_exams & cbt_questions written by Node.js

CREATE TABLE IF NOT EXISTS high_speed_ops.attendances (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES iam_master.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    check_in_time TIMESTAMPTZ,
    check_out_time TIMESTAMPTZ,
    status VARCHAR(15) NOT NULL CHECK (status IN ('PRESENT', 'LATE', 'SICK', 'PERMIT', 'ALPHA')),
    verification_method VARCHAR(20) NOT NULL CHECK (verification_method IN ('RFID_GATE', 'BIOMETRIC', 'GPS_MOBILE', 'MANUAL')),
    iot_device_id VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_attendances_date_user
    ON high_speed_ops.attendances (date, user_id);

CREATE TABLE IF NOT EXISTS high_speed_ops.cbt_exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES academic_lms.subjects(id) ON DELETE RESTRICT,
    title VARCHAR(200) NOT NULL,
    scheduled_start TIMESTAMPTZ NOT NULL,
    duration_minutes SMALLINT NOT NULL CHECK (duration_minutes > 0),
    is_random BOOLEAN NOT NULL DEFAULT TRUE,
    exam_browser_key VARCHAR(128) NOT NULL,
    created_by UUID NOT NULL REFERENCES iam_master.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS high_speed_ops.cbt_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES high_speed_ops.cbt_exams(id) ON DELETE CASCADE,
    question_order SMALLINT NOT NULL,
    question_type VARCHAR(20) NOT NULL DEFAULT 'MULTIPLE_CHOICE'
        CHECK (question_type IN ('MULTIPLE_CHOICE', 'ESSAY')),
    prompt_text TEXT NOT NULL,
    options_jsonb JSONB,
    correct_answer_key VARCHAR(20),
    weight NUMERIC(5,2) NOT NULL DEFAULT 1.0
);

CREATE INDEX IF NOT EXISTS idx_cbt_questions_exam
    ON high_speed_ops.cbt_questions (exam_id, question_order);

CREATE TABLE IF NOT EXISTS high_speed_ops.cbt_student_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES high_speed_ops.cbt_exams(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES iam_master.students(id) ON DELETE CASCADE,
    answers_jsonb JSONB NOT NULL DEFAULT '{}'::jsonb,
    auto_graded_score NUMERIC(6,2),
    cheat_violation_count INT NOT NULL DEFAULT 0,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    submitted_at TIMESTAMPTZ,
    UNIQUE (exam_id, student_id)
);

CREATE TABLE IF NOT EXISTS high_speed_ops.wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES iam_master.users(id) ON DELETE CASCADE,
    balance BIGINT NOT NULL DEFAULT 0 CHECK (balance >= 0),
    daily_spending_limit BIGINT NOT NULL DEFAULT 0 CHECK (daily_spending_limit >= 0),
    version INT NOT NULL DEFAULT 1,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS high_speed_ops.wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES high_speed_ops.wallets(id) ON DELETE RESTRICT,
    transaction_type VARCHAR(25) NOT NULL
        CHECK (transaction_type IN ('TOPUP', 'POS_PURCHASE', 'LIBRARY_FINE', 'MERCHANT_SETTLEMENT')),
    amount BIGINT NOT NULL CHECK (amount > 0),
    merchant_user_id UUID REFERENCES iam_master.users(id),
    items_summary_jsonb JSONB,
    idempotency_key VARCHAR(128) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallet_tx_wallet_created
    ON high_speed_ops.wallet_transactions (wallet_id, created_at DESC);

CREATE TRIGGER trg_wallets_updated_at BEFORE UPDATE ON high_speed_ops.wallets
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


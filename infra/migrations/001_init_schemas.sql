-- 001_init_schemas.sql
-- Single Source of Truth (PostgreSQL 16+) — Logical Schema Initialization

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE SCHEMA IF NOT EXISTS iam_master;
CREATE SCHEMA IF NOT EXISTS academic_lms;
CREATE SCHEMA IF NOT EXISTS high_speed_ops;
CREATE SCHEMA IF NOT EXISTS finance_analytics;

-- Shared updated_at trigger helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


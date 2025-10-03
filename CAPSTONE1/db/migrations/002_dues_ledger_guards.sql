-- 002_dues_ledger_guards.sql
-- Run after backup. Adds protective constraints and indexes.

-- Ensure monthly_dues has a single row per (user_id, due_month)
ALTER TABLE monthly_dues
  ADD UNIQUE KEY uq_monthly_dues_user_month (user_id, due_month);

-- Persist due_date column if missing
ALTER TABLE monthly_dues
  ADD COLUMN IF NOT EXISTS due_date DATE NULL,
  ADD INDEX idx_monthly_dues_user_date (user_id, due_date);

-- Enforce referential integrity from dues_ledger to monthly_dues (due_id can be NULL)
ALTER TABLE dues_ledger
  ADD CONSTRAINT fk_dues_ledger_due
    FOREIGN KEY (due_id) REFERENCES monthly_dues(id)
    ON DELETE SET NULL;

-- Optional CHECK constraints (MySQL 8.0+). If unsupported, convert to triggers.
ALTER TABLE dues_ledger
  ADD CONSTRAINT chk_amount_nonneg_nonadjust
    CHECK ((entry_type = 'adjustment') OR (amount >= 0)),
  ADD CONSTRAINT chk_amount_any
    CHECK (amount IS NOT NULL);

-- Helpful indexes
CREATE INDEX idx_dues_ledger_user_time ON dues_ledger (user_id, created_at);
CREATE INDEX idx_dues_ledger_due_type ON dues_ledger (due_id, entry_type);

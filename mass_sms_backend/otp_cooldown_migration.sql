-- Migration: add otp_requested_at to support resend cooldown
ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_requested_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_users_otp_requested_at ON users(otp_requested_at);

-- Add attempt tracking and account lockout
ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_attempts INT DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ;

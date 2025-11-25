-- Migration: SMS delivery tracking for audit and debugging
CREATE TABLE IF NOT EXISTS sms_deliveries (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  phone TEXT NOT NULL,
  message_type TEXT NOT NULL, -- 'otp', 'notification', etc.
  provider TEXT NOT NULL, -- 'africastalking', 'stub', etc.
  message_id TEXT, -- provider's message ID
  status TEXT NOT NULL, -- 'sent', 'failed', 'delivered', 'unknown'
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sms_deliveries_user_id ON sms_deliveries(user_id);
CREATE INDEX IF NOT EXISTS idx_sms_deliveries_phone ON sms_deliveries(phone);
CREATE INDEX IF NOT EXISTS idx_sms_deliveries_created_at ON sms_deliveries(created_at);
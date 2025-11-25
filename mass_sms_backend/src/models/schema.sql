-- Users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE,
  password_hash TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  phone TEXT UNIQUE,
  otp_code TEXT,
  otp_expires_at TIMESTAMPTZ,
  otp_requested_at TIMESTAMPTZ,
  otp_attempts INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tokens (balance per user)
CREATE TABLE IF NOT EXISTS user_tokens (
  user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  balance INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SMS deliveries
CREATE TABLE IF NOT EXISTS sms_deliveries (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  phone TEXT NOT NULL,
  message_type TEXT NOT NULL,
  provider TEXT NOT NULL,
  message_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  provider TEXT NOT NULL,
  reference TEXT,
  amount NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  raw_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SMS inbound logs
CREATE TABLE IF NOT EXISTS inbound_sms (
  id SERIAL PRIMARY KEY,
  from_number TEXT NOT NULL,
  to_number TEXT,
  message TEXT NOT NULL,
  received_at TIMESTAMPTZ DEFAULT NOW(),
  raw_payload JSONB
);

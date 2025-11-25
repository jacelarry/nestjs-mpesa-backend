-- Quick setup script for mass_sms database
-- Run this in pgAdmin Query Tool or psql

-- Create database (comment out if already exists)
-- CREATE DATABASE mass_sms;

-- Connect to mass_sms database first, then run the schema
-- The migrations will create these tables:

-- Users table
-- CREATE TABLE IF NOT EXISTS users (
--   id SERIAL PRIMARY KEY,
--   email TEXT UNIQUE NOT NULL,
--   password_hash TEXT NOT NULL,
--   created_at TIMESTAMPTZ DEFAULT NOW()
-- );

-- Tokens table
-- CREATE TABLE IF NOT EXISTS user_tokens (
--   user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
--   balance INT NOT NULL DEFAULT 0,
--   updated_at TIMESTAMPTZ DEFAULT NOW()
-- );

-- Payments table
-- CREATE TABLE IF NOT EXISTS payments (
--   id SERIAL PRIMARY KEY,
--   user_id INT REFERENCES users(id) ON DELETE SET NULL,
--   provider TEXT NOT NULL,
--   reference TEXT,
--   amount NUMERIC(12,2) NOT NULL,
--   status TEXT NOT NULL DEFAULT 'pending',
--   raw_payload JSONB,
--   created_at TIMESTAMPTZ DEFAULT NOW(),
--   updated_at TIMESTAMPTZ DEFAULT NOW()
-- );

-- SMS inbound logs table
-- CREATE TABLE IF NOT EXISTS inbound_sms (
--   id SERIAL PRIMARY KEY,
--   from_number TEXT NOT NULL,
--   to_number TEXT,
--   message TEXT NOT NULL,
--   received_at TIMESTAMPTZ DEFAULT NOW(),
--   raw_payload JSONB
-- );

-- Note: Run 'npm run migrate' instead of this script
-- This is just for reference

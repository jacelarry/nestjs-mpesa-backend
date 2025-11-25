-- Migration: Add role column to users table
-- Run this on your existing database

-- Add role column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='role') THEN
        ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user';
    END IF;
END $$;

-- Set the first registered user as admin (typically your account)
-- This will make the user with ID 1 an admin
UPDATE users SET role = 'admin' WHERE id = (SELECT MIN(id) FROM users);

-- Alternatively, set a specific email as admin:
-- UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';

SELECT id, email, role FROM users ORDER BY id;

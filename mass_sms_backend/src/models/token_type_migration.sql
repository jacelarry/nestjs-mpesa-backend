-- Migration: Add token_type to user_tokens for separate API and phone SMS balances
ALTER TABLE user_tokens DROP CONSTRAINT IF EXISTS user_tokens_pkey;
ALTER TABLE user_tokens ADD COLUMN IF NOT EXISTS token_type TEXT NOT NULL DEFAULT 'phone';
ALTER TABLE user_tokens ADD CONSTRAINT user_tokens_unique UNIQUE (user_id, token_type);

-- Migrate existing balances to 'phone' type
UPDATE user_tokens SET token_type = 'phone';

-- Create API token balances for all users with 0 balance if not present
INSERT INTO user_tokens (user_id, balance, token_type)
SELECT id, 0, 'api' FROM users WHERE id NOT IN (SELECT user_id FROM user_tokens WHERE token_type = 'api');

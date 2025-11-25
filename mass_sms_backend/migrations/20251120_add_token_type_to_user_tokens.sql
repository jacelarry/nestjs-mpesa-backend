-- Migration: Add token_type column to user_tokens for dual-token support
ALTER TABLE user_tokens ADD COLUMN token_type VARCHAR(20) NOT NULL DEFAULT 'api';

-- Add a composite primary key (user_id, token_type) for uniqueness
ALTER TABLE user_tokens DROP CONSTRAINT user_tokens_pkey;
ALTER TABLE user_tokens ADD PRIMARY KEY (user_id, token_type);

-- (Optional) If you have existing users, you may want to insert a 'phone' token row for each user:
-- INSERT INTO user_tokens (user_id, balance, token_type) SELECT id, 0, 'phone' FROM users;

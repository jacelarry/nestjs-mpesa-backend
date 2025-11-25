-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User tokens table
CREATE TABLE IF NOT EXISTS user_tokens (
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  balance INTEGER DEFAULT 0,
  token_type VARCHAR(20) NOT NULL DEFAULT 'api',
  PRIMARY KEY (user_id, token_type)
);

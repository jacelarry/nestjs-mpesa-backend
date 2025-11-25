import { pool } from '../config/database.js';

export async function getBalance(userId: number, tokenType: string = 'phone') {
  const res = await pool.query('SELECT balance FROM user_tokens WHERE user_id=$1 AND token_type=$2', [userId, tokenType]);
  if (!res.rowCount) throw new Error('Token record missing');
  return res.rows[0].balance as number;
}

export async function addTokens(userId: number, amount: number, tokenType: string = 'phone') {
  // Upsert logic: insert if not exists
  await pool.query(`
    INSERT INTO user_tokens (user_id, balance, token_type)
    VALUES ($1, $2, $3)
    ON CONFLICT (user_id, token_type)
    DO UPDATE SET balance = user_tokens.balance + $2, updated_at=NOW()
  `, [userId, amount, tokenType]);
  return getBalance(userId, tokenType);
}

export async function consumeTokens(userId: number, amount: number, tokenType: string = 'phone') {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const balRes = await client.query('SELECT balance FROM user_tokens WHERE user_id=$1 AND token_type=$2 FOR UPDATE', [userId, tokenType]);
    if (!balRes.rowCount) throw new Error('Token record missing');
    const balance = balRes.rows[0].balance as number;
    if (balance < amount) throw new Error('Insufficient tokens');
    await client.query('UPDATE user_tokens SET balance=balance-$3, updated_at=NOW() WHERE user_id=$1 AND token_type=$2', [userId, tokenType, amount]);
    await client.query('COMMIT');
    return balance - amount;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally { client.release(); }
}

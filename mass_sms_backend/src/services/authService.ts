function isNumber(val: any): val is number {
  return typeof val === 'number';
}
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';
import { env } from '../config/env.js';
import { normalizePhone } from './phoneUtil.js';
import { sendSms } from './smsService.js';

export interface AuthPayload { id: number; email?: string; phone?: string; role: string; }

const OTP_EXP_MINUTES = 5;
const OTP_COOLDOWN_SECONDS = 60; // minimum time between requests for same phone
const MAX_OTP_PER_WINDOW = 5; // per hour threshold (basic abuse prevention)
const MAX_OTP_ATTEMPTS = 5; // max failed verification attempts before lockout
const LOCKOUT_MINUTES = 15; // lockout duration after exceeding attempts

// ADMIN registration (email/password)
export async function register(email: string, password: string) {
  const hash = await bcrypt.hash(password, 10);
  const client = await pool.connect();
  try {
    // Check if any admin already exists
    const adminExists = await client.query("SELECT id FROM users WHERE role='admin' LIMIT 1");
    if ((adminExists.rowCount ?? 0) > 0) {
      throw new Error('Admin account already exists. Further admin registration is disabled.');
    }
    // Check if email is already registered
    const existing = await client.query('SELECT id FROM users WHERE email=$1', [email]);
    if (existing.rowCount) throw new Error('Email already registered');
    const res = await client.query('INSERT INTO users(email,password_hash,role) VALUES($1,$2,$3) RETURNING id,email,role', [email, hash, 'admin']);
    await client.query('INSERT INTO user_tokens(user_id,balance) VALUES($1,0)', [res.rows[0].id]);
    return res.rows[0];
  } finally {
    client.release();
  }
}

// ADMIN login
export async function login(email: string, password: string) {
  const res = await pool.query('SELECT id,email,password_hash,role FROM users WHERE email=$1', [email]);
  if (!res.rowCount) throw new Error('Invalid credentials');
  const user = res.rows[0];
  if (!user.password_hash) throw new Error('Password login not enabled for this account');
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) throw new Error('Invalid credentials');
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role || 'user' }, env.JWT_SECRET, { expiresIn: '12h' });
  return { token };
}

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function hashOtp(code: string): Promise<string> {
  return bcrypt.hash(code, 8); // lighter rounds for OTP (ephemeral)
}

async function logSmsDelivery(userId: number, phone: string, messageType: string, result: { success: boolean; provider: string; messageId?: string; error?: string }) {
  try {
    await pool.query(
      'INSERT INTO sms_deliveries(user_id, phone, message_type, provider, message_id, status, error_message) VALUES($1,$2,$3,$4,$5,$6,$7)',
      [
        userId,
        phone,
        messageType,
        result.provider,
        result.messageId || null,
        result.success ? 'sent' : 'failed',
        result.error || null
      ]
    );
  } catch (e) {
    console.error('Failed to log SMS delivery:', e);
  }
}

// Request OTP for user phone (creates user if not exists)
export async function requestOtp(rawPhone: string) {
  if (!rawPhone) throw new Error('phone required');
  const phone = normalizePhone(rawPhone);
  const now = new Date();
  const code = generateOtp();
  const hashedCode = await hashOtp(code);
  const expires = new Date(now.getTime() + OTP_EXP_MINUTES * 60 * 1000);

  let userId: number;
  const client = await pool.connect();
  let existingRowCount = 0;
  let existingUserRow: any = null;
  try {
    await client.query('BEGIN');
    const existing = await client.query('SELECT id, otp_requested_at FROM users WHERE phone=$1', [phone]);
    existingRowCount = existing.rowCount ?? 0;
    if (existingRowCount) {
      existingUserRow = existing.rows[0];
      const rawId: number | null = existingUserRow.id ?? null;
      if (rawId === null) throw new Error('User ID is missing in database row');
      userId = rawId as number;
      const lastReq = existingUserRow.otp_requested_at ? new Date(existingUserRow.otp_requested_at) : null;
      if (lastReq && (now.getTime() - lastReq.getTime()) < OTP_COOLDOWN_SECONDS * 1000) {
        throw new Error(`Please wait ${OTP_COOLDOWN_SECONDS} seconds before requesting another OTP`);
      }
      // Count OTPs requested in past hour
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const countRes = await client.query(
        'SELECT count(*) FROM users WHERE phone=$1 AND otp_requested_at > $2',
        [phone, oneHourAgo]
      );
      const count = parseInt(countRes.rows[0].count, 10);
      if (count >= MAX_OTP_PER_WINDOW) {
        throw new Error('Too many OTP requests, try again later');
      }
      await client.query(
        'UPDATE users SET otp_code=$1, otp_expires_at=$2, otp_requested_at=$3, otp_attempts=0 WHERE phone=$4',
        [hashedCode, expires, now, phone]
      );
    } else {
      const created = await client.query(
        'INSERT INTO users(phone, role, otp_code, otp_expires_at, otp_requested_at, otp_attempts) VALUES($1,$2,$3,$4,$5,0) RETURNING id',
        [phone, 'user', hashedCode, expires, now]
      );
      const rawId: number | null = created.rows[0].id ?? null;
      if (rawId === null) throw new Error('User ID is missing in created row');
      userId = rawId as number;
      await client.query('INSERT INTO user_tokens(user_id,balance) VALUES($1,0)', [userId]);
    }
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }

  const smsRes = await sendSms(phone, `Your verification code is ${code}. Expires in ${OTP_EXP_MINUTES} minutes.`);
  if (!smsRes.success) {
    console.warn(`Failed to send OTP SMS: ${smsRes.error}`);
  }
  // Log delivery attempt
  if (typeof userId === 'undefined') {
    // Fallback: fetch userId if not set
    const userRes = await pool.query('SELECT id FROM users WHERE phone=$1', [phone]);
    if (!userRes.rowCount) throw new Error('User not found after insert');
    const rawId: number | null = userRes.rows[0].id ?? null;
    if (rawId === null) throw new Error('User ID is missing after all attempts');
    userId = rawId as number;
  }
  await logSmsDelivery(userId, phone, 'otp', smsRes);
  return { success: true, expires_at: expires.toISOString(), phone };
}

// Resend OTP (generates new code and enforces cooldown)
export async function resendOtp(rawPhone: string) {
  if (!rawPhone) throw new Error('phone required');
  const phone = normalizePhone(rawPhone);
  const now = new Date();
  const userRes = await pool.query('SELECT id, otp_expires_at, otp_requested_at FROM users WHERE phone=$1', [phone]);
  if (!userRes.rowCount) throw new Error('Phone not found. Request OTP first.');
  const user = userRes.rows[0];
  const lastReq = user.otp_requested_at ? new Date(user.otp_requested_at) : null;
  // Enforce cooldown
  if (lastReq && (now.getTime() - lastReq.getTime()) < OTP_COOLDOWN_SECONDS * 1000) {
    const waitSecs = Math.ceil(OTP_COOLDOWN_SECONDS - (now.getTime() - lastReq.getTime()) / 1000);
    throw new Error(`Please wait ${waitSecs} more seconds before resending`);
  }
  // Generate new OTP
  const code = generateOtp();
  const hashedCode = await hashOtp(code);
  const expires = new Date(now.getTime() + OTP_EXP_MINUTES * 60 * 1000);
  await pool.query(
    'UPDATE users SET otp_code=$1, otp_expires_at=$2, otp_requested_at=$3, otp_attempts=0 WHERE phone=$4',
    [hashedCode, expires, now, phone]
  );
  const smsRes = await sendSms(phone, `Your verification code is ${code}. Expires in ${OTP_EXP_MINUTES} minutes.`);
  if (!smsRes.success) {
    console.warn(`Failed to resend OTP SMS: ${smsRes.error}`);
  }
  await logSmsDelivery(user.id, phone, 'otp_resend', smsRes);
  return { success: true, expires_at: expires.toISOString(), phone };
}

export async function verifyOtp(rawPhone: string, code: string) {
  const phone = normalizePhone(rawPhone);
  const res = await pool.query('SELECT id, otp_code, otp_expires_at, otp_attempts, locked_until, role FROM users WHERE phone=$1', [phone]);
  if (!res.rowCount) throw new Error('Invalid phone');
  const user = res.rows[0];
  // Check if account is locked
  if (user.locked_until) {
    const lockExpiry = new Date(user.locked_until).getTime();
    if (Date.now() < lockExpiry) {
      const minutesLeft = Math.ceil((lockExpiry - Date.now()) / 60000);
      throw new Error(`Account locked. Try again in ${minutesLeft} minutes.`);
    } else {
      // Lock expired, clear it
      await pool.query('UPDATE users SET locked_until=NULL, otp_attempts=0 WHERE id=$1', [user.id]);
    }
  }
  if (!user.otp_code || !user.otp_expires_at) throw new Error('No OTP requested');
  const now = Date.now();
  const exp = new Date(user.otp_expires_at).getTime();
  if (now > exp) throw new Error('OTP expired');
  const isValid = await bcrypt.compare(code, user.otp_code);
  if (!isValid) {
    // Increment attempts
    const newAttempts = (user.otp_attempts || 0) + 1;
    if (newAttempts >= MAX_OTP_ATTEMPTS) {
      const lockUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
      await pool.query('UPDATE users SET otp_attempts=$1, locked_until=$2 WHERE id=$3', [newAttempts, lockUntil, user.id]);
      throw new Error(`Too many failed attempts. Account locked for ${LOCKOUT_MINUTES} minutes.`);
    } else {
      await pool.query('UPDATE users SET otp_attempts=$1 WHERE id=$2', [newAttempts, user.id]);
      const attemptsLeft = MAX_OTP_ATTEMPTS - newAttempts;
      throw new Error(`Invalid OTP. ${attemptsLeft} attempts remaining.`);
    }
  }
  // Success: clear OTP and reset attempts
  await pool.query('UPDATE users SET otp_code=NULL, otp_expires_at=NULL, otp_attempts=0, locked_until=NULL WHERE id=$1', [user.id]);
  const token = jwt.sign({ id: user.id, phone, role: user.role || 'user' }, env.JWT_SECRET, { expiresIn: '12h' });
  return { token };
}

export function verifyToken(token: string): AuthPayload {
  return jwt.verify(token, env.JWT_SECRET) as AuthPayload;
}

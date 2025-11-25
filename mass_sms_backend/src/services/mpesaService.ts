import axios from 'axios';
import { env } from '../config/env.js';
import { pool } from '../config/database.js';
import { addTokens } from './tokenService.js';

interface StkPushParams { amount: number; phone: string; accountReference?: string; transactionDesc?: string; userId: number; }

async function getAccessToken() {
  const key = env.MPESA_CONSUMER_KEY;
  const secret = env.MPESA_CONSUMER_SECRET;
  if (!key || !secret) throw new Error('Mpesa credentials missing');
  const auth = Buffer.from(`${key}:${secret}`).toString('base64');
  const res = await axios.get(`${env.MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` }
  });
  return res.data.access_token as string;
}

function timestamp() {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2,'0');
  return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function password() {
  return Buffer.from(`${env.MPESA_SHORTCODE}${env.MPESA_PASSKEY}${timestamp()}`).toString('base64');
}

export async function initiateStkPush(params: StkPushParams) {
  const token = await getAccessToken();
  const tillNumber = env.MPESA_TILL_NUMBER || env.MPESA_SHORTCODE;
  
  const payload = {
    BusinessShortCode: env.MPESA_SHORTCODE,
    Password: password(),
    Timestamp: timestamp(),
    TransactionType: 'CustomerBuyGoodsOnline',  // Buy Goods, not PayBill
    Amount: params.amount,
    PartyA: params.phone,
    PartyB: tillNumber,  // Your Till Number
    PhoneNumber: params.phone,
    CallBackURL: process.env.MPESA_CALLBACK_URL || 'https://example.com/api/payments/callback/mpesa',
    AccountReference: params.accountReference || 'Tokens',
    TransactionDesc: params.transactionDesc || 'Token Purchase'
  };
  const res = await axios.post(`${env.MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`, payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
  // Record payment row
  const payRes = await pool.query('INSERT INTO payments(user_id, provider, reference, amount, status, raw_payload) VALUES($1,$2,$3,$4,$5,$6) RETURNING id', [
    params.userId,
    'mpesa',
    res.data.CheckoutRequestID || null,
    params.amount,
    'initiated',
    res.data
  ]);
  return { mpesa: res.data, paymentId: payRes.rows[0].id };
}

export async function handleMpesaCallback(callbackBody: any) {
  const ref = callbackBody?.Body?.stkCallback?.CheckoutRequestID;
  if (!ref) return;
  const resultCode = callbackBody.Body.stkCallback.ResultCode;
  const status = resultCode === 0 ? 'success' : 'failed';
  await pool.query('UPDATE payments SET status=$2, raw_payload=$3, updated_at=NOW() WHERE reference=$1', [ref, status, callbackBody]);

  if (status === 'success') {
    // Find payment to get user and amount
    const payRes = await pool.query('SELECT id, user_id, amount, raw_payload FROM payments WHERE reference=$1', [ref]);
    if (payRes.rowCount) {
      const payment = payRes.rows[0];
      const amount = Number(payment.amount) || 0;
      const factor = Number(process.env.TOKEN_PER_CURRENCY || '1');
      const tokens = Math.floor(amount * factor);
      if (tokens > 0 && payment.user_id) {
        // Determine tokenType from payment raw_payload if present
        let tokenType = 'phone';
        try {
          const raw = payment.raw_payload;
          if (raw && typeof raw === 'object' && raw.tokenType) {
            tokenType = raw.tokenType;
          } else if (typeof raw === 'string') {
            const parsed = JSON.parse(raw);
            if (parsed.tokenType) tokenType = parsed.tokenType;
          }
        } catch {}
        await addTokens(payment.user_id, tokens, tokenType);
        await pool.query('UPDATE payments SET status=$2, updated_at=NOW() WHERE id=$1', [payment.id, 'credited']);
      }
    }
  }
}

import axios from 'axios';
import { env } from '../config/env.js';

// Abstraction for sending SMS. Initially supports Africa's Talking; can add other providers.
// Environment variables expected:
// AFRICAS_TALKING_USERNAME, AFRICAS_TALKING_API_KEY, AFRICAS_TALKING_SENDER_ID (optional)

interface SmsResult { success: boolean; provider: string; messageId?: string; error?: string; }

export async function sendSms(to: string, message: string): Promise<SmsResult> {
  // Basic guard
  if (!to || !message) return { success: false, provider: 'none', error: 'Missing to or message' };

  const username = env.AFRICAS_TALKING_USERNAME;
  const apiKey = env.AFRICAS_TALKING_API_KEY;
  const senderId = env.AFRICAS_TALKING_SENDER_ID || undefined;

  if (!username || !apiKey) {
    console.log(`[SMS] (stub) Would send to ${to}: ${message}`);
    return { success: true, provider: 'stub' };
  }

  try {
    const url = 'https://api.africastalking.com/version1/messaging';
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('to', to);
    params.append('message', message);
    if (senderId) params.append('from', senderId);

    const start = Date.now();
    const res = await axios.post(url, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'apiKey': apiKey,
        'Accept': 'application/json',
      },
    });
    const elapsed = Date.now() - start;
    console.log(`[SMS] Sent to ${to} in ${elapsed}ms`);

    // Africa's Talking response parsing
    const data = res.data;
    const msgData = data?.SMSMessageData;
    const recipients = msgData?.Recipients || [];
    const first = recipients[0];
    if (first && first.status === 'Success') {
      return { success: true, provider: 'africastalking', messageId: first.messageId };
    }
    return { success: false, provider: 'africastalking', error: first?.status || 'Unknown failure' };
  } catch (e: any) {
    console.log(`[SMS] Error sending to ${to}: ${e.message}`);
    return { success: false, provider: 'africastalking', error: e.message || 'Request error' };
  }
}

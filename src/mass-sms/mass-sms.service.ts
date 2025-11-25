import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class MassSmsService {
  private readonly logger = new Logger(MassSmsService.name);

  async sendSms(to: string, message: string): Promise<{ success: boolean; provider: string; messageId?: string; error?: string }> {
    // TODO: Replace with NestJS config service or env variables
    const username = process.env.AFRICAS_TALKING_USERNAME;
    const apiKey = process.env.AFRICAS_TALKING_API_KEY;
    const senderId = process.env.AFRICAS_TALKING_SENDER_ID || undefined;

    if (!to || !message) return { success: false, provider: 'none', error: 'Missing to or message' };
    if (!username || !apiKey) {
      this.logger.log(`[SMS] (stub) Would send to ${to}: ${message}`);
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
      this.logger.log(`[SMS] Sent to ${to} in ${elapsed}ms`);
      // TODO: Parse Africa's Talking response for messageId
      return { success: true, provider: 'africastalking', messageId: res.data.SMSMessageData.Message[0]?.id };
    } catch (error: any) {
      this.logger.error(`[SMS] Error sending to ${to}: ${error.message}`);
      return { success: false, provider: 'africastalking', error: error.message };
    }
  }
}

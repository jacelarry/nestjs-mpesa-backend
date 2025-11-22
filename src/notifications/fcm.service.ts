import * as admin from 'firebase-admin';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FcmService {
  private readonly logger = new Logger(FcmService.name);
  private initialized = false;

  constructor(private config: ConfigService) {
    const key = this.config.get('FCM_SERVER_KEY');
    if (key && !admin.apps.length) {
      // You can initialize with service account JSON if you prefer
      admin.initializeApp({
        credential: admin.credential.applicationDefault?.(),
      });
      this.initialized = true;
    }
  }

  async sendToToken(token: string, title: string, body: string, data?: any) {
    if (!this.initialized) {
      this.logger.warn('FCM not initialized');
      return;
    }
    try {
      const message: admin.messaging.Message = {
        token,
        notification: { title, body },
        data: data || {}
      };
      const res = await admin.messaging().send(message);
      this.logger.log('FCM sent: ' + res);
    } catch (err) {
      this.logger.error('FCM error', err);
    }
  }
}

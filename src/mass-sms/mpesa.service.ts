import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MpesaService {
  constructor(private readonly prisma: PrismaService) {}

  async initiateStkPush(params: any): Promise<any> {
    // Record payment initiation in database
    const payment = await this.prisma.payment.create({
      data: {
        msisdn: params.phone,
        amount: params.amount,
        transactionId: `stk-${Date.now()}`,
        businessShortCode: params.businessShortCode || '',
        status: 'PENDING',
        meta: params,
      }
    });

    // Retry logic for Mpesa API call
    const maxRetries = 3;
    let attempt = 0;
    let success = false;
    let lastError = null;
    while (attempt < maxRetries && !success) {
      try {
        // TODO: Replace with actual Mpesa API call
        // Simulate API call
        // await axios.post(...)
        success = true; // Set to true if API call succeeds
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'COMPLETED' }
        });
      } catch (err) {
        lastError = err;
        attempt++;
        await new Promise(res => setTimeout(res, 1000 * Math.pow(2, attempt))); // Exponential backoff
      }
    }
    if (!success) {
      // Queue for later processing
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'QUEUED', meta: { ...params, error: lastError?.message } }
      });
      // Optionally notify user of delay
    }
    return payment;
  }
}

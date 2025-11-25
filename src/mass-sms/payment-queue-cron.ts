import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PaymentQueueProcessorService } from './payment-queue-processor.service';

@Injectable()
export class PaymentQueueCron {
  constructor(private readonly processor: PaymentQueueProcessorService) {}

  @Cron('*/5 * * * *') // Every 5 minutes
  async handleCron() {
    await this.processor.processQueuedPayments();
  }
}

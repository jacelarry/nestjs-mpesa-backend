import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MassSmsService } from './mass-sms.service';

@Injectable()
export class PaymentQueueProcessorService {
  private readonly logger = new Logger(PaymentQueueProcessorService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly smsService: MassSmsService,
  ) {}

  async processQueuedPayments() {
    const queuedPayments = await this.prisma.payment.findMany({ where: { status: 'QUEUED' } });
    for (const payment of queuedPayments) {
      try {
        // TODO: Replace with actual Mpesa API call
        // Simulate API call
        // await axios.post(...)
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'COMPLETED' }
        });
        this.logger.log(`Processed queued payment ${payment.id}`);
        // Send SMS notification to user
        if (payment.msisdn) {
          await this.smsService.sendSms(payment.msisdn, `Your payment for bundle purchase is now completed.`);
        }
      } catch (err) {
        this.logger.error(`Failed to process payment ${payment.id}: ${err.message}`);
      }
    }
  }
}

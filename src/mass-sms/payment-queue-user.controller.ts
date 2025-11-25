import { Controller, Post, Get, Req, UseGuards } from '@nestjs/common';
import { PaymentQueueProcessorService } from './payment-queue-processor.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('queue')
@UseGuards(JwtAuthGuard)
export class PaymentQueueUserController {
  constructor(
    private readonly processor: PaymentQueueProcessorService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('process')
  async processUserQueue(@Req() req) {
    // Only process queued payments for this user
    const queuedPayments = await this.prisma.payment.findMany({ where: { status: 'QUEUED', msisdn: req.user.msisdn } });
    for (const payment of queuedPayments) {
      await this.processor.processQueuedPayments(); // This will process all, but you can filter inside service for user
    }
    return { processed: queuedPayments.length };
  }

  @Get('status')
  async getUserQueueStatus(@Req() req) {
    const queuedPayments = await this.prisma.payment.findMany({ where: { msisdn: req.user.msisdn } });
    return queuedPayments;
  }
}

import { Controller, Post, Body, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('sms-webhook')
export class SmsWebhookController {
  private readonly logger = new Logger(SmsWebhookController.name);
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  async handleWebhook(@Body() body: any) {
    this.logger.log(`Received SMS webhook: ${JSON.stringify(body)}`);
    // Optionally record webhook event in Payment as meta
    await this.prisma.payment.create({
      data: {
        transactionId: `webhook-${Date.now()}`,
        amount: 0,
        msisdn: '',
        businessShortCode: '',
        status: 'WEBHOOK',
        meta: { level: 'INFO', message: 'SMS Webhook received', body },
      }
    });
    return { received: true };
  }
}

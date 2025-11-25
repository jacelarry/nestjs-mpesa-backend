import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PaymentQueueProcessorService } from './payment-queue-processor.service';
import { MassSmsService } from './mass-sms.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [PaymentQueueProcessorService, MassSmsService, PrismaService],
})
export class PaymentQueueModule {}

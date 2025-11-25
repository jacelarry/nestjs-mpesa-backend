import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MpesaModule } from './mpesa/mpesa.module';
import { BundleModule } from './bundles/bundle.module';
import { UserEngagementModule } from './user-engagement/user-engagement.module';
import { PrismaModule } from './prisma/prisma.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuthModule } from './auth/auth.module';
import { AuthController } from './auth/auth.controller';
import { MassSmsModule } from './mass-sms/mass-sms.module';
import { PaymentQueueModule } from './mass-sms/payment-queue.module';
import { UssdModule } from './ussd/ussd.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    MpesaModule,
    NotificationsModule,
    AuthModule,
    MassSmsModule,
    PaymentQueueModule,
    UserEngagementModule,
    BundleModule,
    UssdModule
  ],
  controllers: [AuthController],
})
export class AppModule {}

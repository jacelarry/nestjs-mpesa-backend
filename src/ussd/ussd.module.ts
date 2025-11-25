import { Module } from '@nestjs/common';
import { UssdService } from './ussd.service';
import { UssdController } from './ussd.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UserEngagementModule } from '../user-engagement/user-engagement.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { BundleModule } from '../bundles/bundle.module';

@Module({
  imports: [PrismaModule, UserEngagementModule, NotificationsModule, BundleModule],
  providers: [UssdService],
  controllers: [UssdController],
  exports: [UssdService],
})
export class UssdModule {}

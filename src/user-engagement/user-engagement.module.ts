import { Module } from '@nestjs/common';
import { UserEngagementService } from './user-engagement.service';
import { UserEngagementController } from './user-engagement.controller';

@Module({
  providers: [UserEngagementService],
  controllers: [UserEngagementController],
  exports: [UserEngagementService],
})
export class UserEngagementModule {}

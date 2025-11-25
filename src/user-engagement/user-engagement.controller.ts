import { Controller, Post, Body } from '@nestjs/common';
import { UserEngagementService } from './user-engagement.service';

@Controller('user-engagement')
export class UserEngagementController {
  constructor(private readonly userEngagementService: UserEngagementService) {}

  @Post('recommend')
  recommend(@Body('userId') userId: string) {
    this.userEngagementService.recommendUser(userId);
    return { status: 'recommended', userId };
  }

  @Post('check')
  check(@Body('userId') userId: string) {
    const recommended = this.userEngagementService.hasBeenRecommended(userId);
    return { userId, recommended };
  }

  @Post('reset')
  reset(@Body('userId') userId: string) {
    this.userEngagementService.resetRecommendation(userId);
    return { status: 'reset', userId };
  }
}

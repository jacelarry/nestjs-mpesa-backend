import { Injectable } from '@nestjs/common';

@Injectable()
export class UserEngagementService {
  // Track user engagement and recommendations
  private recommendedUsers: Set<string> = new Set();

  hasBeenRecommended(userId: string): boolean {
    return this.recommendedUsers.has(userId);
  }

  recommendUser(userId: string): void {
    this.recommendedUsers.add(userId);
  }

  resetRecommendation(userId: string): void {
    this.recommendedUsers.delete(userId);
  }
}

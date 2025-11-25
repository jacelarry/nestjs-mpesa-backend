// ...existing code...
import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserEngagementService } from '../user-engagement/user-engagement.service';
import { FcmService } from '../notifications/fcm.service';
import { BundleService } from '../bundles/bundle.service';

export type UssdType = 'simple' | 'advanced' | 'normal';

export interface UssdCode {
  id: number;
  code: string;
  type: UssdType;
  description?: string;
  ownerId: number;
}

@Injectable()
export class UssdService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userEngagement: UserEngagementService,
    private readonly fcm: FcmService,
    private readonly bundleService: BundleService
  ) {}

  async executeUssdCode(
    code: string,
    params: { [key: string]: string | number },
    intendedBundle?: string,
    userId?: string
  ): Promise<{ success: boolean; message: string; matchedBundle?: string; alternatives?: string[] }> {
    // Render USSD code with dynamic parameters
    const rendered = this.renderUssdCode(code, params);
    // Simulate response: if code contains intendedBundle, success; else, fail and suggest
    if (intendedBundle && rendered.includes(intendedBundle)) {
      // Engage user if already recommended
      if (userId && this.userEngagement && this.userEngagement.hasBeenRecommended(userId)) {
        // Example engagement: send FCM notification (replace with SMS logic as needed)
        if (this.fcm) {
          await this.fcm.sendToToken(userId, 'Engagement', `You have already been recommended to enable this bundle.`);
        }
      }
      return { success: true, message: `Bundle ${intendedBundle} purchased successfully.` };
    } else {
      // Simulate bundle matching logic
      // Example: find closest bundle in code string
      const bundleMatch = /\*([0-9]+)\*/.exec(rendered);
      const matchedBundle = bundleMatch ? bundleMatch[1] : undefined;
      // Use BundleService to find the closest alternative
      const requested = { price: params['price'] as number, dataAmount: params['dataAmount'] as number };
      const closest = this.bundleService.findClosestBundle(requested);
      const alternatives = closest ? [closest.name] : ['No alternative found'];
      // Send alternatives via SMS (simulate with FCM for now)
      if (userId && this.fcm) {
        await this.fcm.sendToToken(userId, 'Alternatives', `Alternatives available: ${alternatives.join(', ')}`);
      }
      return { success: false, message: 'Failed to purchase intended bundle. Suggesting closest match.', matchedBundle, alternatives };
    }
  }

  // Render USSD code with dynamic parameters
  renderUssdCode(code: string, params: { [key: string]: string | number }): string {
    let rendered = code;
    Object.entries(params).forEach(([key, value]) => {
      const regex = new RegExp(key, 'g');
      rendered = rendered.replace(regex, String(value));
    });
    return rendered;
  }

  async createUssdCode(ownerId: number, code: string, type: UssdType, description?: string) {
    // Format validation: starts with *, ends with #, only digits, * and # allowed
    if (!/^\*[0-9*#]+#$/.test(code)) {
      throw new Error('Invalid USSD code format. Must start with * and end with #, only digits, * and # allowed.');
    }
    // Type validation
    if (!['simple', 'advanced', 'normal'].includes(type)) {
      throw new Error('Invalid USSD type.');
    }
    // Duplicate prevention
    const existing = await this.prisma.ussdCode.findFirst({ where: { code, ownerId } });
    if (existing) {
      throw new Error('USSD code already exists for this user.');
    }
    return this.prisma.ussdCode.create({
      data: { code, type, description, ownerId }
    });
  }

  async listUssdCodes(ownerId: number, type?: UssdType) {
    return this.prisma.ussdCode.findMany({
      where: { ownerId, ...(type ? { type } : {}) }
    });
  }

  async updateUssdCode(id: number, ownerId: number, data: Partial<UssdCode>) {
    return this.prisma.ussdCode.updateMany({
      where: { id, ownerId },
      data
    });
  }

  async deleteUssdCode(id: number, ownerId: number) {
    return this.prisma.ussdCode.deleteMany({
      where: { id, ownerId }
    });
  }
}

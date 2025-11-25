import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BundlesService {
  constructor(private readonly prisma: PrismaService) {}

  async listBundles() {
    return this.prisma.bundle.findMany();
  }

  async purchaseBundle(clientId: number, bundleId: number) {
    let bundle = await this.prisma.bundle.findUnique({ where: { id: bundleId } });
    if (!bundle) throw new Error('Bundle not found');

    // Bingwa Sokoni daily limit
    if (bundle.name && bundle.name.toLowerCase().includes('bingwa sokoni')) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const alreadyPurchased = await this.prisma.payment.findFirst({
        where: {
          msisdn: '', // fill with client msisdn
          meta: { path: ['bundleId'], equals: bundleId },
          createdAt: { gte: today, lt: tomorrow },
        },
      });
      if (alreadyPurchased) {
        throw new Error('You can only buy Bingwa Sokoni bundles once per day.');
      }
    }

    // Simulate purchase attempt (replace with real API call)
    const purchaseSuccess = Math.random() > 0.3; // 70% success rate for demo
    if (!purchaseSuccess) {
      // Fallback: find alternative bundle (closest price)
      const alternatives = await this.prisma.bundle.findMany();
      const sorted = alternatives
        .filter(b => b.id !== bundleId)
        .sort((a, b) => Math.abs(a.price - bundle.price) - Math.abs(b.price - bundle.price));
      const fallback = sorted[0];
      if (fallback) {
        // Attempt to purchase fallback
        await this.prisma.payment.create({
          data: {
            msisdn: '',
            amount: fallback.price,
            transactionId: `bundle-fallback-${Date.now()}`,
            businessShortCode: '',
            status: 'COMPLETED',
            meta: { bundleId: fallback.id, fallback: true },
          }
        });
        // Notify user (extend with SMS/email as needed)
        return { bundle: fallback, fallback: true, message: 'Original bundle unavailable. Purchased closest alternative.' };
      } else {
        throw new Error('No alternative bundles available.');
      }
    }
    // Record payment for original bundle
    await this.prisma.payment.create({
      data: {
        msisdn: '',
        amount: bundle.price,
        transactionId: `bundle-${Date.now()}`,
        businessShortCode: '',
        status: 'COMPLETED',
        meta: { bundleId },
      }
    });
    return { bundle, fallback: false, message: 'Bundle purchased successfully.' };
  }
}

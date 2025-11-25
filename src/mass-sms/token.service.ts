import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TokenService {
  constructor(private readonly prisma: PrismaService) {}

  async getBalance(clientId: number): Promise<number> {
    // Example: get total payments for client as token balance
    const payments = await this.prisma.payment.findMany({
      where: { msisdn: String(clientId) },
      select: { amount: true }
    });
    return payments.reduce((sum, p) => sum + p.amount, 0);
  }

  async addTokens(clientId: number, amount: number): Promise<number> {
    // Example: add a payment record as token purchase
    await this.prisma.payment.create({
      data: {
        msisdn: '', // fill with client msisdn
        amount,
        transactionId: `manual-${Date.now()}`,
        businessShortCode: '',
        status: 'COMPLETED',
      }
    });
    return this.getBalance(clientId);
  }

  async consumeTokens(clientId: number, amount: number): Promise<number> {
    // Example: deduct tokens by creating a negative payment log
    await this.prisma.payment.create({
      data: {
        transactionId: `consume-${Date.now()}`,
        amount: -amount,
        msisdn: String(clientId),
        businessShortCode: '',
        status: 'CONSUMED',
        meta: { message: `Consumed ${amount} tokens for client ${clientId}` }
      }
    });
    // For demo, just return new balance
    return this.getBalance(clientId);
  }
}

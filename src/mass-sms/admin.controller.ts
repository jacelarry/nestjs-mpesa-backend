import { Controller, Get, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('payments')
  async getPayments() {
    return this.prisma.payment.findMany();
  }

  @Get('logs')
  async getLogs() {
    // Fallback: return all payments as logs
    return this.prisma.payment.findMany();
  }

  @Get('clients')
  async getClients() {
    return this.prisma.client.findMany();
  }
}

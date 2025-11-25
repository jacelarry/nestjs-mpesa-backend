import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register(email: string, password: string): Promise<any> {
    const hash = await bcrypt.hash(password, 10);
    const existing = await this.prisma.client.findUnique({ where: { msisdn: email } });
    if (existing) throw new Error('Email already registered');
    const user = await this.prisma.client.create({
      data: { msisdn: email, name: '' }
    });
    // You may want to store password hash in a separate model/table
    return user;
  }

  async login(email: string, password: string): Promise<any> {
    // You may want to store password hash in a separate model/table
    const user = await this.prisma.client.findUnique({ where: { msisdn: email } });
    if (!user) throw new Error('Invalid credentials');
    // For demo, skip password check
    const token = jwt.sign({ id: user.id, msisdn: user.msisdn }, process.env.JWT_SECRET || 'secret', { expiresIn: '12h' });
    return { token };
  }

  async generateOtp(): Promise<string> {
    // Simple OTP generation
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}

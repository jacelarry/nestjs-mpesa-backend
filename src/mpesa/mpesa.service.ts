

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';
import { FcmService } from '../notifications/fcm.service';
import { PaymentDto } from './payment.dto';

@Injectable()
export class MpesaService {
  private readonly logger = new Logger(MpesaService.name);
  private tokenCache: { token: string; expiresAt: number } | null = null;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private fcm: FcmService
  ) {}

    /**
     Get the base URL for M-Pesa API depending on environment.
     @returns {string} Base URL
    */
  private getBaseUrl() {
    return this.config.get('DAR_AJA_ENV') === 'production'
      ? this.config.get('DAR_AJA_BASEURL_PROD')
      : this.config.get('DAR_AJA_BASEURL_SANDBOX');
  }

    /**
     Get OAuth token for M-Pesa API requests, with caching.
     @returns {Promise<string>} OAuth token
    */
  async getOAuthToken() {
    if (this.tokenCache && Date.now() < this.tokenCache.expiresAt - 30000) {
      return this.tokenCache.token;
    }
    const key = this.config.get('DAR_AJA_CONSUMER_KEY');
    const secret = this.config.get('DAR_AJA_CONSUMER_SECRET');
    const url = `${this.getBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`;
    const res = await axios.get(url, {
      auth: { username: key, password: secret },
      headers: { 'Content-Type': 'application/json' },
    });
    const token = res.data.access_token;
    this.tokenCache = { token, expiresAt: Date.now() + 3600 * 1000 };
    return token;
  }

    /**
     Query transaction status from M-Pesa API.
     @param {string} transactionId - Transaction ID to query
     @returns {Promise<any>} Transaction status response
    */
  async queryTransactionStatus(transactionId: string) {
    const token = await this.getOAuthToken();
    const url = `${this.getBaseUrl()}/mpesa/transactionstatus/v1/query`;
    const body = { TransactionID: transactionId };
    const res = await axios.post(url, body, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  }

    /**
     Simulate payment processing (replace with real integration).
     @param {object} data - Payment data
     @returns {object} Payment result
     @throws {Error} If required fields are missing
    */
  async processPayment(data: { msisdn: string; amount: number; businessShortCode: string }) {
    // Simulate payment logic (replace with real M-Pesa integration as needed)
    if (!data.msisdn || !data.amount || !data.businessShortCode) {
      throw new Error('Missing required payment fields');
    }
    // Here you would call M-Pesa API, save to DB, etc.
    return {
      status: 'success',
      message: `Payment request for ${data.amount} to ${data.msisdn} received.`
    };
  }
      /**
       Create a new payment record in the database.
       @param {PaymentDto} body - Payment DTO
       @returns {Promise<any>} Created payment
      */
    async pay(body: PaymentDto) {
      // Create a new payment record
      return await this.prisma.payment.create({
        data: {
          transactionId: `TX-${Date.now()}`,
          amount: body.amount,
          msisdn: body.msisdn,
          businessShortCode: body.businessShortCode,
          status: 'PENDING',
        },
      });
    }

      /**
       Get all payments from the database.
       @returns {Promise<any[]>} List of payments
      */
    async getPayments() {
      return await this.prisma.payment.findMany();
    }

      /**
       Get a payment by its ID.
       @param {number} id - Payment ID
       @returns {Promise<any>} Payment record
      */
    async getPaymentById(id: number) {
      return await this.prisma.payment.findUnique({ where: { id } });
    }

      /**
       Update a payment record by ID.
       @param {number} id - Payment ID
       @param {Partial<PaymentDto>} data - Fields to update
       @returns {Promise<any>} Updated payment
      */
    async updatePayment(id: number, data: Partial<PaymentDto>) {
      return await this.prisma.payment.update({
        where: { id },
        data,
      });
    }

      /**
       Delete a payment record by ID.
       @param {number} id - Payment ID
       @returns {Promise<any>} Deleted payment
      */
    async deletePayment(id: number) {
      return await this.prisma.payment.delete({ where: { id } });
    }
}

import { Controller, Get, Post, Body, BadRequestException, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiKeyGuard } from '../common/api-key.guard';
import { MpesaService } from './mpesa.service';
import { PaymentDto } from './payment.dto';
import { validatePaymentFields } from '../common/utils';

// ...existing code...



@Controller('mpesa')
export class MpesaController {
  constructor(private readonly mpesaService: MpesaService) {}

    /**
     Returns a hello message from the controller.
     @returns {string}
    */
  @Get('hello')
  getHello(): string {
    return 'Hello from MpesaController!';
  }

    /**
     Processes a payment request.
     @param {PaymentDto} body - Payment DTO
     @returns {Promise<any>} Payment result
     @throws {BadRequestException} If validation fails
    */
  @UseGuards(ApiKeyGuard)
  @Post('pay')
  async pay(@Body() body: PaymentDto) {
    try {
      return await this.mpesaService.pay(body);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

    /**
     Gets all payments.
     @returns {Promise<any[]>} List of payments
    */
  @Get('payments')
  async getPayments() {
    return await this.mpesaService.getPayments();
  }

    /**
     Gets a payment by ID.
     @param {number} id - Payment ID
     @returns {Promise<any>} Payment record
    */
  @Get('payments/:id')
  async getPaymentById(@Body('id') id: number) {
    return await this.mpesaService.getPaymentById(id);
  }

    /**
     Updates a payment by ID.
     @param {number} id - Payment ID
     @param {Partial<PaymentDto>} data - Fields to update
     @returns {Promise<any>} Updated payment
     @throws {BadRequestException} If validation fails
    */
  @Post('payments/:id')
  async updatePayment(@Body('id') id: number, @Body() data: Partial<PaymentDto>) {
    const error = validatePaymentFields(data);
    if (error) {
      throw new BadRequestException(error);
    }
    return await this.mpesaService.updatePayment(id, data);
  }

    /**
     Deletes a payment by ID.
     @param {number} id - Payment ID
     @returns {Promise<any>} Deleted payment
    */
  @Post('payments/:id/delete')
  async deletePayment(@Body('id') id: number) {
    return await this.mpesaService.deletePayment(id);
  }
}

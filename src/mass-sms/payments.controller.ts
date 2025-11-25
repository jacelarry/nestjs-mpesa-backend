import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { MpesaService } from './mpesa.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly mpesaService: MpesaService) {}

  @Post('stk-push')
  @UseGuards(JwtAuthGuard)
  async initiateStkPush(@Req() req, @Body('phone') phone: string, @Body('amount') amount: number) {
    // You may want to get user/client info from req.user
    return this.mpesaService.initiateStkPush({ phone, amount, businessShortCode: '', userId: req.user?.id });
  }
}

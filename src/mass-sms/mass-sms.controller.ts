import { Controller, Post, Body } from '@nestjs/common';
import { MassSmsService } from './mass-sms.service';

@Controller('mass-sms')
export class MassSmsController {
  constructor(private readonly smsService: MassSmsService) {}

  @Post('send')
  async sendSms(@Body('to') to: string, @Body('message') message: string) {
    return this.smsService.sendSms(to, message);
  }
}

import { Controller, Post, Body, Req, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { MassSmsService } from './mass-sms.service';
import { TokenService } from './token.service';

// TODO: Replace with NestJS AuthGuard
// import { AuthGuard } from '../auth/auth.guard';

@Controller('mass-sms')
export class MassSmsApiController {
  constructor(
    private readonly smsService: MassSmsService,
    private readonly tokenService: TokenService,
  ) {}

  @Post('send')
  @UseGuards(JwtAuthGuard)
  async sendSms(@Req() req, @Body('to') to: string, @Body('message') message: string) {
    if (!to || !message) {
      throw new HttpException('to and message required', HttpStatus.BAD_REQUEST);
    }
    // Check and deduct API tokens (1 per SMS)
    await this.tokenService.consumeTokens(req.user.id, 1);
    // Send SMS using admin's Africa's Talking credentials
    const result = await this.smsService.sendSms(to, message);
    if (result.success) {
      return { sent: true, provider: result.provider, messageId: result.messageId };
    } else {
      throw new HttpException(result.error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

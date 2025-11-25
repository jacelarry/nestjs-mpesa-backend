import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { TokenService } from './token.service';

@Controller('tokens')
export class TokensController {
  constructor(private readonly tokenService: TokenService) {}

  @Get('balance')
  @UseGuards(JwtAuthGuard)
  async getBalance(@Req() req) {
    // You may want to get user/client info from req.user
    return { balance: await this.tokenService.getBalance(req.user?.id) };
  }
}

import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(private jwtService: JwtService) {}

  // Simple login endpoint for demonstration (no real user validation)
  @Post('login')
  async login(@Request() req) {
    // In production, validate user credentials here
    const payload = { username: req.body.username || 'test', sub: 1 };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}

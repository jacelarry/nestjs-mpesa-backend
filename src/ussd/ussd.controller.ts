import { Controller, Post, Get, Put, Delete, Body, Req, Query, UseGuards } from '@nestjs/common';
import { UssdCode } from './ussd.service';
import { UssdService, UssdType } from './ussd.service';
import { JwtAuthGuard } from '../mass-sms/jwt-auth.guard';

@Controller('ussd')
@UseGuards(JwtAuthGuard)
export class UssdController {
  constructor(private readonly ussdService: UssdService) {}

  @Post('create')
  async createUssd(@Req() req, @Body('code') code: string, @Body('type') type: UssdType, @Body('description') description?: string) {
    return this.ussdService.createUssdCode(req.user.id, code, type, description);
  }

  @Get('list')
  async listUssd(@Req() req, @Query('type') type?: UssdType) {
    return this.ussdService.listUssdCodes(req.user.id, type);
  }
  @Put('update')
  async updateUssd(@Req() req, @Body('id') id: number, @Body() data: any) {
    return this.ussdService.updateUssdCode(id, req.user.id, data);
  }

  @Delete('delete')
  async deleteUssd(@Req() req, @Body('id') id: number) {
    return this.ussdService.deleteUssdCode(id, req.user.id);
  }
  @Post('backup')
  async backupUssd(@Req() req) {
    return this.ussdService.listUssdCodes(req.user.id);
  }

  @Post('restore')
  async restoreUssd(@Req() req, @Body('codes') codes: UssdCode[]) {
    const results = [];
    for (const code of codes) {
      results.push(await this.ussdService.createUssdCode(req.user.id, code.code, code.type, code.description));
    }
    return results;
  }

  @Post('execute')
  async executeUssd(@Req() req, @Body('code') code: string, @Body('params') params: any, @Body('intendedBundle') intendedBundle?: string) {
    // Integrate user engagement and fallback alternatives
    return this.ussdService.executeUssdCode(code, params, intendedBundle, req.user.id);
  }
}

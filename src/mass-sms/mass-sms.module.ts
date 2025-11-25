import { Module } from '@nestjs/common';
import { MassSmsService } from './mass-sms.service';
import { MassSmsController } from './mass-sms.controller';

@Module({
  providers: [MassSmsService],
  controllers: [MassSmsController],
})
export class MassSmsModule {}

import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MpesaService } from './mpesa.service';
import { MpesaController } from './mpesa.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [HttpModule, PrismaModule, NotificationsModule],
  providers: [MpesaService],
  controllers: [MpesaController],
})
export class MpesaModule {}

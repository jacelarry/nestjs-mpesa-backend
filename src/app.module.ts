import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MpesaModule } from './mpesa/mpesa.module';
import { PrismaModule } from './prisma/prisma.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuthModule } from './auth/auth.module';
import { AuthController } from './auth/auth.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    MpesaModule,
    NotificationsModule,
    AuthModule
  ],
  controllers: [AuthController],
})
export class AppModule {}

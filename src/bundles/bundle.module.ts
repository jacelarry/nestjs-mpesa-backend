import { Module } from '@nestjs/common';
import { BundleService } from './bundle.service';
import { BundleController } from './bundle.controller';
import { BundleUpdateService } from './bundle-update.service';
import { BundleUpdateController } from './bundle-update.controller';
import { BundleCronService } from './bundle-cron.service';

@Module({
  providers: [BundleService, BundleUpdateService, BundleCronService],
  controllers: [BundleController, BundleUpdateController],
  exports: [BundleService],
})
export class BundleModule {}

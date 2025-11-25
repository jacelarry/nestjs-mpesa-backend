import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { BundleUpdateService } from './bundle-update.service';

@Injectable()
export class BundleCronService {
  constructor(private readonly bundleUpdateService: BundleUpdateService) {}

  // Runs every day at midnight
  @Cron('0 0 * * *')
  async handleCron() {
    await this.bundleUpdateService.updateBundles();
    console.log('Bundles auto-updated from Safaricom');
  }
}

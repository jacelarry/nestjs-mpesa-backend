import { Controller, Post } from '@nestjs/common';
import { BundleUpdateService } from './bundle-update.service';

@Controller('bundles')
export class BundleUpdateController {
  constructor(private readonly bundleUpdateService: BundleUpdateService) {}

  @Post('update')
  async updateBundles() {
    await this.bundleUpdateService.updateBundles();
    return { status: 'Bundles updated' };
  }
}

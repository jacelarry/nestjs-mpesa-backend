import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { BundlesService } from './bundles.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('bundles')
export class BundlesController {
  constructor(private readonly bundlesService: BundlesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async listBundles() {
    return this.bundlesService.listBundles();
  }

  @Post('purchase')
  @UseGuards(JwtAuthGuard)
  async purchaseBundle(@Req() req, @Body('bundleId') bundleId: number) {
    return this.bundlesService.purchaseBundle(req.user.id, bundleId);
  }
}

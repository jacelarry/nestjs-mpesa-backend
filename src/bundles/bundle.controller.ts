import { Controller, Post, Body, Req } from '@nestjs/common';
import { BundleService } from './bundle.service';

@Controller('bundles')
export class BundleController {
  constructor(private readonly bundleService: BundleService) {}

  @Post('purchase')
  async purchaseBundle(@Req() req, @Body('price') price: number, @Body('dataAmount') dataAmount: number) {
    // Simulate purchase attempt (always fail for test)
    // Find closest alternative
    const closest = this.bundleService.findClosestBundle({ price, dataAmount });
    return {
      requested: { price, dataAmount },
      alternative: closest ? closest : null,
      message: closest ? `Alternative found: ${closest.name}` : 'No alternative available',
    };
  }
}

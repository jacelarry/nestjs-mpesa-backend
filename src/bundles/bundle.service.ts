import { Injectable } from '@nestjs/common';
import { bundles, Bundle } from './bundle.data';

@Injectable()
export class BundleService {
  // Find the closest bundle by price, data, or validity
  findClosestBundle(requested: Partial<Bundle>): Bundle | null {
    // Example: match by price, then dataAmount
    let candidates = bundles;
    if (requested.price) {
      candidates = candidates.filter(b => b.price <= requested.price);
    }
    if (requested.dataAmount) {
      candidates = candidates.filter(b => b.dataAmount >= requested.dataAmount);
    }
    // Sort by closest price
    candidates = candidates.sort((a, b) => Math.abs(a.price - (requested.price || 0)) - Math.abs(b.price - (requested.price || 0)));
    return candidates.length > 0 ? candidates[0] : null;
  }
}

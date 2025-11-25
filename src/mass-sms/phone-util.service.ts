import { Injectable } from '@nestjs/common';

@Injectable()
export class PhoneUtilService {
  normalizePhone(raw: string): string {
    if (!raw) return raw;
    let p = raw.trim();
    p = p.replace(/[^0-9+]/g, ''); // remove spaces, dashes
    if (p.startsWith('+')) p = p.substring(1);
    if (p.startsWith('07')) {
      p = '2547' + p.substring(2);
    } else if (p.startsWith('01')) {
      p = '2541' + p.substring(2);
    }
    if (p.startsWith('254')) return p;
    if (p.startsWith('7')) return '254' + p;
    if (p.startsWith('1')) return '254' + p;
    return p;
  }
}

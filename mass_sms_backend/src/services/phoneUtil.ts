// Utility for normalizing Kenyan phone numbers to international format (e.g., 07XXXXXXXX -> 2547XXXXXXXX)
// Adjust logic if supporting multiple countries later.

export function normalizePhone(raw: string): string {
  if (!raw) return raw;
  let p = raw.trim();
  p = p.replace(/[^0-9+]/g, ''); // remove spaces, dashes
  if (p.startsWith('+')) p = p.substring(1);
  // If starts with 07 or 01 (Safaricom uses 07...), convert to 2547/2541
  if (p.startsWith('07')) {
    p = '2547' + p.substring(2);
  } else if (p.startsWith('01')) {
    p = '2541' + p.substring(2);
  }
  // If already starts with 254 and length ok just keep
  if (p.startsWith('254')) return p;
  // Fallback: if local starting with 7 or 1 assume missing country code
  if (p.startsWith('7')) return '254' + p;
  if (p.startsWith('1')) return '254' + p;
  return p; // return as-is if it doesn't match patterns
}

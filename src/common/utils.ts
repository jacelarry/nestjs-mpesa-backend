/**
 * Validates payment fields for msisdn, amount, and businessShortCode.
 * @param {Partial<{ msisdn: string; amount: number; businessShortCode: string }>} data
 * @returns {string|null} Error message if invalid, otherwise null
 */
export function validatePaymentFields(data: Partial<{ msisdn: string; amount: number; businessShortCode: string }>): string | null {
  if (data.msisdn && !/^2547\d{8}$/.test(data.msisdn)) {
    return 'Invalid msisdn format';
  }
  if (data.amount !== undefined && data.amount < 1) {
    return 'Amount must be at least 1';
  }
  if (data.businessShortCode !== undefined && !data.businessShortCode.trim()) {
    return 'businessShortCode is required';
  }
  return null;
}
export function someUtilityFunction() {
  // Add utility logic here
}

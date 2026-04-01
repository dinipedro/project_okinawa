/**
 * Card Validation Utilities
 *
 * Shared Luhn algorithm, expiry validation, CVV validation,
 * and card-brand detection used by PaymentScreen and
 * UnifiedPaymentScreen.
 *
 * @module shared/utils/card-validation
 */

/**
 * Validate a credit/debit card number using the Luhn algorithm.
 * Accepts numbers with or without spaces.
 *
 * @see https://en.wikipedia.org/wiki/Luhn_algorithm
 */
export function validateCardNumber(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\s/g, '');

  // Must be 13-19 digits (standard card lengths)
  if (!/^\d{13,19}$/.test(cleaned)) {
    return false;
  }

  // Luhn algorithm
  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Validate card expiry date.
 *
 * @param month - Two-digit month string (e.g. "01"-"12")
 * @param year  - Two-digit year string (e.g. "26" for 2026)
 * @returns true when the month is 01-12 and the expiry date is not in the past
 */
export function validateExpiry(month: string, year: string): boolean {
  const monthNum = parseInt(month, 10);
  if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
    return false;
  }

  const yearNum = parseInt(year, 10);
  if (isNaN(yearNum)) {
    return false;
  }

  const expDate = new Date(2000 + yearNum, monthNum - 1);
  const now = new Date();
  now.setDate(1); // Compare by month only
  return expDate >= now;
}

/**
 * Validate a card CVV / CVC code.
 *
 * @param cvv   - The CVV string (digits only)
 * @param brand - Optional brand name; "Amex" expects 4 digits, others 3
 */
export function validateCVV(cvv: string, brand?: string): boolean {
  if (!cvv || !/^\d+$/.test(cvv)) {
    return false;
  }

  const expectedLength = brand === 'Amex' ? 4 : 3;
  return cvv.length === expectedLength;
}

/**
 * Detect the card brand from the card number prefix.
 *
 * Supports: Visa, Mastercard, Amex, Discover, Diners, JCB, Maestro.
 * Returns "Unknown" when no pattern matches.
 */
export function getCardBrand(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\s/g, '');

  if (/^4/.test(cleaned)) return 'Visa';
  if (/^5[1-5]/.test(cleaned)) return 'Mastercard';
  if (/^3[47]/.test(cleaned)) return 'Amex';
  if (/^6011|65|64[4-9]/.test(cleaned)) return 'Discover';
  if (/^36|38|30[0-5]/.test(cleaned)) return 'Diners';
  if (/^35/.test(cleaned)) return 'JCB';
  if (/^50|5[6-9]|6/.test(cleaned)) return 'Maestro';

  return 'Unknown';
}

/**
 * Format a raw card number string into groups of 4 digits.
 * e.g. "4111111111111111" -> "4111 1111 1111 1111"
 */
export function formatCardNumber(text: string): string {
  const cleaned = text.replace(/\D/g, '');
  const formatted = cleaned.replace(/(\d{4})/g, '$1 ').trim();
  return formatted.substring(0, 19); // Max 16 digits + 3 spaces
}

/**
 * Format a raw expiry string into MM/YY.
 * e.g. "1226" -> "12/26"
 */
export function formatExpiry(text: string): string {
  const cleaned = text.replace(/\D/g, '');
  if (cleaned.length >= 2) {
    return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
  }
  return cleaned;
}

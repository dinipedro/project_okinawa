/**
 * Phone Validation & Formatting Utilities
 *
 * Centralized Brazilian phone number validation and formatting
 * used across both Client and Restaurant mobile apps.
 *
 * @module shared/utils/phone-validation
 */

/**
 * Validate a Brazilian phone number.
 *
 * Accepts raw digits or formatted strings (parentheses, dashes, spaces
 * are stripped before validation). Valid lengths are 10 (landline) and
 * 11 (mobile with 9th digit).
 *
 * @param phone - Phone number string (raw or formatted)
 * @returns true when the cleaned number has 10 or 11 digits
 */
export function validateBrazilianPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 11;
}

/**
 * Format a Brazilian phone number for display.
 *
 * - 11 digits (mobile):  (XX) XXXXX-XXXX
 * - 10 digits (landline): (XX) XXXX-XXXX
 * - Other lengths: returned as-is
 *
 * @param phone - Phone number string (raw or formatted)
 * @returns Formatted phone string
 */
export function formatBrazilianPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

/**
 * Validate a phone number with country-code awareness.
 *
 * Currently supports:
 * - BR (+55): 10-11 digits
 * - US (+1):  10 digits
 * - Generic:  7-15 digits
 *
 * @param phone       - Phone number string (raw or formatted)
 * @param countryCode - Country dial code (e.g. "+55")
 */
export function validatePhone(phone: string, countryCode: string = '+55'): boolean {
  const cleaned = phone.replace(/\D/g, '');

  switch (countryCode) {
    case '+55': // Brazil
      return cleaned.length >= 10 && cleaned.length <= 11;
    case '+1': // US/Canada
      return cleaned.length === 10;
    default:
      return cleaned.length >= 7 && cleaned.length <= 15;
  }
}

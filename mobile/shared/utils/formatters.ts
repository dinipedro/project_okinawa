/**
 * Internationalized Formatters for Currency, Date, and Numbers
 * Supports: pt-BR, en-US, es-ES
 */

export type SupportedLocale = 'pt-BR' | 'en-US' | 'es-ES';

interface CurrencyConfig {
  locale: string;
  currency: string;
  symbol: string;
}

const CURRENCY_CONFIG: Record<SupportedLocale, CurrencyConfig> = {
  'pt-BR': { locale: 'pt-BR', currency: 'BRL', symbol: 'R$' },
  'en-US': { locale: 'en-US', currency: 'USD', symbol: '$' },
  'es-ES': { locale: 'es-ES', currency: 'EUR', symbol: '€' },
};

/**
 * Format currency value for display
 * @param amount - The numeric amount
 * @param locale - The locale (pt-BR, en-US, es-ES)
 * @param options - Additional formatting options
 */
export function formatCurrency(
  amount: number,
  locale: SupportedLocale = 'pt-BR',
  options?: {
    showCents?: boolean;
    showSymbol?: boolean;
  }
): string {
  const config = CURRENCY_CONFIG[locale] || CURRENCY_CONFIG['pt-BR'];
  const { showCents = true, showSymbol = true } = options || {};

  try {
    const formatter = new Intl.NumberFormat(config.locale, {
      style: showSymbol ? 'currency' : 'decimal',
      currency: config.currency,
      minimumFractionDigits: showCents ? 2 : 0,
      maximumFractionDigits: showCents ? 2 : 0,
    });

    return formatter.format(amount);
  } catch {
    // Fallback for older environments
    const formatted = amount.toFixed(showCents ? 2 : 0);
    return showSymbol ? `${config.symbol} ${formatted}` : formatted;
  }
}

/**
 * Format date for display
 * @param date - Date object or ISO string
 * @param locale - The locale (pt-BR, en-US, es-ES)
 * @param format - Predefined format: 'short', 'medium', 'long', 'full'
 */
export function formatDate(
  date: Date | string,
  locale: SupportedLocale = 'pt-BR',
  format: 'short' | 'medium' | 'long' | 'full' = 'medium'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return '—';
  }

  const options: Intl.DateTimeFormatOptions = {
    short: { day: '2-digit', month: '2-digit', year: '2-digit' },
    medium: { day: '2-digit', month: '2-digit', year: 'numeric' },
    long: { day: 'numeric', month: 'long', year: 'numeric' },
    full: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
  }[format];

  try {
    return new Intl.DateTimeFormat(locale, options).format(dateObj);
  } catch {
    return dateObj.toLocaleDateString();
  }
}

/**
 * Format time for display
 * @param date - Date object or ISO string
 * @param locale - The locale (pt-BR, en-US, es-ES)
 * @param showSeconds - Whether to show seconds
 */
export function formatTime(
  date: Date | string,
  locale: SupportedLocale = 'pt-BR',
  showSeconds: boolean = false
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return '—';
  }

  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    ...(showSeconds && { second: '2-digit' }),
  };

  try {
    return new Intl.DateTimeFormat(locale, options).format(dateObj);
  } catch {
    return dateObj.toLocaleTimeString();
  }
}

/**
 * Format date and time together
 * @param date - Date object or ISO string
 * @param locale - The locale (pt-BR, en-US, es-ES)
 */
export function formatDateTime(
  date: Date | string,
  locale: SupportedLocale = 'pt-BR'
): string {
  return `${formatDate(date, locale, 'medium')} ${formatTime(date, locale)}`;
}

/**
 * Format number with locale-specific separators
 * @param number - The numeric value
 * @param locale - The locale (pt-BR, en-US, es-ES)
 * @param decimals - Number of decimal places
 */
export function formatNumber(
  number: number,
  locale: SupportedLocale = 'pt-BR',
  decimals: number = 0
): string {
  try {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(number);
  } catch {
    return number.toFixed(decimals);
  }
}

/**
 * Format percentage
 * @param value - The decimal value (0.5 = 50%)
 * @param locale - The locale (pt-BR, en-US, es-ES)
 * @param decimals - Number of decimal places
 */
export function formatPercent(
  value: number,
  locale: SupportedLocale = 'pt-BR',
  decimals: number = 0
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  } catch {
    return `${(value * 100).toFixed(decimals)}%`;
  }
}

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 * @param date - Date object or ISO string
 * @param locale - The locale (pt-BR, en-US, es-ES)
 */
export function formatRelativeTime(
  date: Date | string,
  locale: SupportedLocale = 'pt-BR'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return '—';
  }

  const now = new Date();
  const diffMs = dateObj.getTime() - now.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);

  try {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

    if (Math.abs(diffSec) < 60) {
      return rtf.format(diffSec, 'second');
    } else if (Math.abs(diffMin) < 60) {
      return rtf.format(diffMin, 'minute');
    } else if (Math.abs(diffHour) < 24) {
      return rtf.format(diffHour, 'hour');
    } else if (Math.abs(diffDay) < 30) {
      return rtf.format(diffDay, 'day');
    } else {
      return formatDate(dateObj, locale, 'medium');
    }
  } catch {
    // Fallback for older environments
    if (Math.abs(diffMin) < 60) {
      return `${Math.abs(diffMin)} min`;
    } else if (Math.abs(diffHour) < 24) {
      return `${Math.abs(diffHour)}h`;
    } else {
      return `${Math.abs(diffDay)}d`;
    }
  }
}

/**
 * Format phone number for display
 * @param phone - The phone number string
 * @param locale - The locale (pt-BR, en-US, es-ES)
 */
export function formatPhone(
  phone: string,
  locale: SupportedLocale = 'pt-BR'
): string {
  // Remove non-numeric characters
  const digits = phone.replace(/\D/g, '');

  switch (locale) {
    case 'pt-BR':
      // Brazilian format: (11) 99999-9999 or (11) 9999-9999
      if (digits.length === 11) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
      } else if (digits.length === 10) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
      }
      break;

    case 'en-US':
      // US format: (123) 456-7890
      if (digits.length === 10) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
      } else if (digits.length === 11 && digits[0] === '1') {
        return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
      }
      break;

    case 'es-ES':
      // Spanish format: 612 34 56 78 or +34 612 34 56 78
      if (digits.length === 9) {
        return `${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 7)} ${digits.slice(7)}`;
      } else if (digits.length === 11 && digits.slice(0, 2) === '34') {
        return `+34 ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)} ${digits.slice(9)}`;
      }
      break;
  }

  // Return original if format doesn't match
  return phone;
}

/**
 * Get currency symbol for locale
 */
export function getCurrencySymbol(locale: SupportedLocale = 'pt-BR'): string {
  return CURRENCY_CONFIG[locale]?.symbol || 'R$';
}

/**
 * Get currency code for locale
 */
export function getCurrencyCode(locale: SupportedLocale = 'pt-BR'): string {
  return CURRENCY_CONFIG[locale]?.currency || 'BRL';
}

/**
 * Parse currency string to number
 * @param value - The formatted currency string
 * @param locale - The locale (pt-BR, en-US, es-ES)
 */
export function parseCurrency(
  value: string,
  locale: SupportedLocale = 'pt-BR'
): number {
  // Remove currency symbols and spaces
  let cleaned = value.replace(/[^\d,.-]/g, '');

  // Handle different decimal separators
  if (locale === 'pt-BR' || locale === 'es-ES') {
    // In pt-BR and es-ES, comma is decimal separator, period is thousands
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else {
    // In en-US, period is decimal separator, comma is thousands
    cleaned = cleaned.replace(/,/g, '');
  }

  const result = parseFloat(cleaned);
  return isNaN(result) ? 0 : result;
}

export default {
  formatCurrency,
  formatDate,
  formatTime,
  formatDateTime,
  formatNumber,
  formatPercent,
  formatRelativeTime,
  formatPhone,
  getCurrencySymbol,
  getCurrencyCode,
  parseCurrency,
};

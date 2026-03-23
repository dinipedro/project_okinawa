import { ThrottlerModuleOptions } from '@nestjs/throttler';

/**
 * Validate and clamp TTL value
 * @param value TTL in milliseconds
 * @param min Minimum allowed (default: 1000ms)
 * @param max Maximum allowed (default: 3600000ms = 1 hour)
 */
function validateTtl(value: number, min = 1000, max = 3600000): number {
  if (isNaN(value) || value < min) return min;
  if (value > max) return max;
  return value;
}

/**
 * Validate and clamp limit value
 * @param value Request limit
 * @param min Minimum allowed (default: 1)
 * @param max Maximum allowed (default: 10000)
 */
function validateLimit(value: number, min = 1, max = 10000): number {
  if (isNaN(value) || value < min) return min;
  if (value > max) return max;
  return value;
}

/**
 * Throttler configuration with multiple profiles:
 * - default: 100 requests per minute (general API)
 * - strict: 10 requests per minute (auth, sensitive operations)
 * - payment: 30 requests per minute (payment operations)
 */
export const throttlerConfig = (): ThrottlerModuleOptions => ({
  throttlers: [
    {
      name: 'default',
      ttl: validateTtl(parseInt(process.env.THROTTLE_TTL || '60000', 10)),
      limit: validateLimit(parseInt(process.env.THROTTLE_LIMIT || '100', 10)),
    },
    {
      name: 'strict',
      ttl: validateTtl(parseInt(process.env.THROTTLE_STRICT_TTL || '60000', 10)),
      limit: validateLimit(parseInt(process.env.THROTTLE_STRICT_LIMIT || '10', 10), 1, 50),
    },
    {
      name: 'payment',
      ttl: validateTtl(parseInt(process.env.THROTTLE_PAYMENT_TTL || '60000', 10)),
      limit: validateLimit(parseInt(process.env.THROTTLE_PAYMENT_LIMIT || '30', 10), 1, 100),
    },
  ],
});

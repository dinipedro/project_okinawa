/**
 * Integration module i18n message keys.
 * Used as constants throughout the integrations module for consistent error/success messaging.
 */
export const INTEGRATION_MESSAGES = {
  PLATFORM_NOT_FOUND: 'integrations.errors.platform_not_found',
  CONNECTION_NOT_FOUND: 'integrations.errors.connection_not_found',
  WEBHOOK_INVALID: 'integrations.errors.webhook_invalid',
  CAPACITY_EXCEEDED: 'integrations.errors.capacity_exceeded',
  SYNC_FAILED: 'integrations.errors.sync_failed',
  ORDER_ACCEPTED: 'integrations.success.order_accepted',
  ORDER_REJECTED: 'integrations.success.order_rejected',
} as const;

/**
 * Payment Gateway i18n message keys.
 * Used as constants throughout the payment-gateway module for consistent messaging.
 */
export const PAYMENT_GATEWAY_MESSAGES = {
  // ─── Errors ─────────────────────────────────────────────────────────────────
  GATEWAY_NOT_CONFIGURED: 'payment_gateway.errors.gateway_not_configured',
  GATEWAY_UNAVAILABLE: 'payment_gateway.errors.gateway_unavailable',
  INVALID_PAYMENT_METHOD: 'payment_gateway.errors.invalid_payment_method',
  PAYMENT_FAILED: 'payment_gateway.errors.payment_failed',
  REFUND_FAILED: 'payment_gateway.errors.refund_failed',
  DUPLICATE_PAYMENT: 'payment_gateway.errors.duplicate_payment',
  ORDER_NOT_FOUND: 'payment_gateway.errors.order_not_found',
  TRANSACTION_NOT_FOUND: 'payment_gateway.errors.transaction_not_found',
  AMOUNT_MISMATCH: 'payment_gateway.errors.amount_mismatch',
  INSUFFICIENT_BALANCE: 'payment_gateway.errors.insufficient_balance',
  INVALID_CARD_TOKEN: 'payment_gateway.errors.invalid_card_token',
  PIX_EXPIRED: 'payment_gateway.errors.pix_expired',
  WEBHOOK_SIGNATURE_INVALID: 'payment_gateway.errors.webhook_signature_invalid',
  WEBHOOK_PROCESSING_FAILED: 'payment_gateway.errors.webhook_processing_failed',
  CONNECTION_TOKEN_FAILED: 'payment_gateway.errors.connection_token_failed',
  REFUND_EXCEEDS_AMOUNT: 'payment_gateway.errors.refund_exceeds_amount',
  ALREADY_REFUNDED: 'payment_gateway.errors.already_refunded',

  // ─── Success ────────────────────────────────────────────────────────────────
  PAYMENT_COMPLETED: 'payment_gateway.success.payment_completed',
  PAYMENT_PENDING: 'payment_gateway.success.payment_pending',
  PIX_QR_GENERATED: 'payment_gateway.success.pix_qr_generated',
  REFUND_COMPLETED: 'payment_gateway.success.refund_completed',
  WEBHOOK_PROCESSED: 'payment_gateway.success.webhook_processed',
  CONNECTION_TOKEN_CREATED: 'payment_gateway.success.connection_token_created',
  TAP_TO_PAY_INTENT_CREATED: 'payment_gateway.success.tap_to_pay_intent_created',

  // ─── Webhook Events ────────────────────────────────────────────────────────
  ASAAS_PAYMENT_CONFIRMED: 'payment_gateway.webhook.asaas_payment_confirmed',
  ASAAS_PAYMENT_RECEIVED: 'payment_gateway.webhook.asaas_payment_received',
  ASAAS_PAYMENT_OVERDUE: 'payment_gateway.webhook.asaas_payment_overdue',
  ASAAS_PAYMENT_REFUNDED: 'payment_gateway.webhook.asaas_payment_refunded',
  STRIPE_PAYMENT_SUCCEEDED: 'payment_gateway.webhook.stripe_payment_succeeded',
  STRIPE_PAYMENT_FAILED: 'payment_gateway.webhook.stripe_payment_failed',
} as const;

/**
 * Fiscal module i18n message keys.
 * Used as constants throughout the fiscal module for consistent messaging.
 */
export const FISCAL_MESSAGES = {
  // ─── Errors ──────────────────────────────────────────────────────────────
  CONFIG_NOT_FOUND: 'fiscal.errors.config_not_found',
  CONFIG_INACTIVE: 'fiscal.errors.config_inactive',
  DOCUMENT_NOT_FOUND: 'fiscal.errors.document_not_found',
  EMISSION_FAILED: 'fiscal.errors.emission_failed',
  CANCEL_FAILED: 'fiscal.errors.cancel_failed',
  CANCEL_EXPIRED: 'fiscal.errors.cancel_expired',
  PROVIDER_NONE: 'fiscal.errors.provider_none',
  INVALID_CNPJ: 'fiscal.errors.invalid_cnpj',
  ORDER_NOT_FOUND: 'fiscal.errors.order_not_found',
  ALREADY_EMITTED: 'fiscal.errors.already_emitted',
  CERTIFICATE_REQUIRED: 'fiscal.errors.certificate_required',
  CSC_REQUIRED: 'fiscal.errors.csc_required',
  WEBHOOK_INVALID_TOKEN: 'fiscal.errors.webhook_invalid_token',

  // ─── Success ─────────────────────────────────────────────────────────────
  NFCE_EMITTED: 'fiscal.success.nfce_emitted',
  NFCE_CANCELLED: 'fiscal.success.nfce_cancelled',
  CONFIG_SAVED: 'fiscal.success.config_saved',
  CERTIFICATE_UPLOADED: 'fiscal.success.certificate_uploaded',
  WEBHOOK_PROCESSED: 'fiscal.success.webhook_processed',

  // ─── Status ──────────────────────────────────────────────────────────────
  NFCE_AUTHORIZED: 'fiscal.status.authorized',
  NFCE_PENDING: 'fiscal.status.pending',
  NFCE_DENIED: 'fiscal.status.denied',
  NFCE_FAILED: 'fiscal.status.failed',
} as const;

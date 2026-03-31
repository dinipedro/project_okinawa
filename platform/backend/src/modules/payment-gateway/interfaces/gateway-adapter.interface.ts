/**
 * Gateway Adapter Interface
 *
 * Defines the contract for all payment gateway adapters (Asaas, Stripe Terminal, Wallet).
 * Each adapter implements this interface to provide a uniform payment processing API.
 *
 * Amount convention: ALL amounts are in centavos (integer).
 * Example: R$ 98,90 = 9890 centavos.
 * Conversion to/from DECIMAL(10,2) happens at service boundaries.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type PaymentMethodType =
  | 'credit_card'
  | 'debit_card'
  | 'pix'
  | 'wallet'
  | 'cash'
  | 'tap_to_pay';

export type GatewayProvider = 'asaas' | 'stripe_terminal' | 'wallet' | 'cash';

export type PaymentStatusValue =
  | 'completed'
  | 'pending'
  | 'failed'
  | 'refunded'
  | 'partially_refunded'
  | 'expired';

// ─── Params ───────────────────────────────────────────────────────────────────

export interface ProcessPaymentParams {
  /** Amount in centavos (e.g., 9890 = R$ 98,90) */
  amount: number;
  payment_method: PaymentMethodType;
  order_id: string;
  restaurant_id: string;
  customer_id?: string;
  idempotency_key: string;

  /** Card token from Asaas.js SDK (credit_card / debit_card) */
  card_token?: string;
  /** Installments 1-12 (credit_card only) */
  installments?: number;

  /** PIX QR code expiration in seconds (default: 600 = 10 min) */
  pix_expiration_seconds?: number;

  /** Stripe PaymentIntent ID (tap_to_pay flow) */
  stripe_payment_intent_id?: string;

  metadata?: Record<string, any>;
}

// ─── Results ──────────────────────────────────────────────────────────────────

export interface PaymentResult {
  success: boolean;
  /** Internal transaction ID (GatewayTransaction.id) */
  transaction_id: string;
  /** External ID in the gateway (Asaas charge ID, Stripe PaymentIntent ID, etc.) */
  external_id: string;
  status: 'completed' | 'pending' | 'failed';

  /** PIX-specific: base64-encoded QR code image */
  pix_qr_code?: string;
  /** PIX-specific: copy-and-paste code */
  pix_copy_paste?: string;
  /** PIX-specific: QR code expiration timestamp */
  pix_expiration?: Date;

  /** Stripe Terminal specific: client_secret for mobile SDK */
  client_secret?: string;

  error_code?: string;
  error_message?: string;
}

export interface RefundResult {
  success: boolean;
  refund_id: string;
  refunded_amount: number;
  status: 'refunded' | 'partially_refunded' | 'failed';
  error_code?: string;
  error_message?: string;
}

export interface PaymentStatus {
  transaction_id: string;
  external_id: string;
  status: PaymentStatusValue;
  amount: number;
  refunded_amount: number;
  payment_method: PaymentMethodType;
  updated_at: Date;
}

// ─── Adapter Interface ───────────────────────────────────────────────────────

export interface GatewayAdapter {
  readonly provider: GatewayProvider;

  /** Process a payment through this gateway */
  processPayment(params: ProcessPaymentParams): Promise<PaymentResult>;

  /** Refund a payment (full or partial) */
  refundPayment(transactionId: string, amount?: number): Promise<RefundResult>;

  /** Get current payment status from the gateway */
  getPaymentStatus(transactionId: string): Promise<PaymentStatus>;
}

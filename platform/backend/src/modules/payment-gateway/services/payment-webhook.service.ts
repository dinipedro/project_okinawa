import {
  Injectable,
  Logger,
  BadRequestException,
  UnauthorizedException,
  Inject,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { GatewayTransaction } from '../entities/gateway-transaction.entity';
import { GatewayConfig } from '../entities/gateway-config.entity';
import { PAYMENT_GATEWAY_MESSAGES } from '../i18n/payment-gateway.i18n';
import { FinancialEventListenerService } from '@/modules/financial/services/financial-event-listener.service';

/**
 * PaymentWebhookService — Processes incoming webhooks from Asaas and Stripe.
 *
 * Webhook verification, transaction status update, and event emission.
 *
 * ─── Asaas Webhook Events ─────────────────────────────────────────────
 * PAYMENT_CONFIRMED  → Card charge approved
 * PAYMENT_RECEIVED   → PIX received
 * PAYMENT_OVERDUE    → Payment expired (PIX timeout)
 * PAYMENT_REFUNDED   → Refund completed
 * PAYMENT_DELETED    → Charge cancelled
 *
 * ─── Stripe Webhook Events ────────────────────────────────────────────
 * payment_intent.succeeded → Terminal payment confirmed
 * payment_intent.payment_failed → Terminal payment failed
 * charge.refunded → Refund completed
 */
@Injectable()
export class PaymentWebhookService {
  private readonly logger = new Logger(PaymentWebhookService.name);

  constructor(
    @InjectRepository(GatewayTransaction)
    private readonly transactionRepository: Repository<GatewayTransaction>,
    @InjectRepository(GatewayConfig)
    private readonly configRepository: Repository<GatewayConfig>,
    @Optional()
    @Inject(FinancialEventListenerService)
    private readonly financialEventListener?: FinancialEventListenerService,
  ) {}

  // ─── Asaas Webhooks ───────────────────────────────────────────────────────────

  /**
   * Process an incoming Asaas webhook.
   *
   * Asaas sends webhooks as JSON with an access_token header for verification.
   * The payment ID is in event.payment.id.
   */
  async processAsaasWebhook(
    body: any,
    headers: Record<string, string>,
  ): Promise<{ status: string; transaction_id?: string }> {
    const event = body?.event;
    const paymentId = body?.payment?.id;

    if (!event || !paymentId) {
      this.logger.warn(
        `Invalid Asaas webhook payload: missing event or payment.id`,
      );
      throw new BadRequestException(
        PAYMENT_GATEWAY_MESSAGES.WEBHOOK_PROCESSING_FAILED,
      );
    }

    this.logger.log(
      `Asaas webhook received | event=${event} | paymentId=${paymentId}`,
    );

    // Validate webhook signature (via access_token header) — REQUIRED
    const webhookToken = headers['asaas-access-token'] || headers['access_token'];
    const isValid = await this.validateAsaasSignature(
      webhookToken,
      paymentId,
    );
    if (!isValid) {
      this.logger.warn(
        `${PAYMENT_GATEWAY_MESSAGES.WEBHOOK_SIGNATURE_INVALID} | paymentId=${paymentId}`,
      );
      throw new UnauthorizedException(
        PAYMENT_GATEWAY_MESSAGES.WEBHOOK_SIGNATURE_INVALID,
      );
    }

    // Find the GatewayTransaction by external_id
    const gatewayTx = await this.transactionRepository.findOne({
      where: { external_id: paymentId, provider: 'asaas' },
    });

    if (!gatewayTx) {
      this.logger.warn(
        `Asaas webhook: transaction not found for paymentId=${paymentId}`,
      );
      // Return OK to avoid Asaas retrying for unknown payments
      return { status: 'ignored' };
    }

    // Map Asaas event to internal status
    const statusMap: Record<string, string> = {
      PAYMENT_CONFIRMED: 'completed',
      PAYMENT_RECEIVED: 'completed',
      PAYMENT_OVERDUE: 'expired',
      PAYMENT_REFUNDED: 'refunded',
      PAYMENT_DELETED: 'failed',
    };

    const newStatus = statusMap[event];
    if (!newStatus) {
      this.logger.log(
        `Asaas webhook: unhandled event type=${event} | paymentId=${paymentId}`,
      );
      return { status: 'ignored' };
    }

    // Update transaction status
    const previousStatus = gatewayTx.status;
    gatewayTx.status = newStatus;
    gatewayTx.metadata = {
      ...gatewayTx.metadata,
      webhook_event: event,
      webhook_received_at: new Date().toISOString(),
      previous_status: previousStatus,
    };

    // If refunded, update refunded amount from webhook data
    if (event === 'PAYMENT_REFUNDED' && body?.payment?.refundedValue) {
      gatewayTx.refunded_amount_cents = Math.round(
        body.payment.refundedValue * 100,
      );
    }

    await this.transactionRepository.save(gatewayTx);

    this.logger.log(
      `Asaas webhook processed | ` +
        `event=${event} | ` +
        `transactionId=${gatewayTx.id} | ` +
        `status: ${previousStatus} → ${newStatus} | ` +
        `correlationId=${gatewayTx.correlation_id}`,
    );

    // Emit domain event for downstream consumers
    this.emitPaymentEvent(gatewayTx, newStatus);

    return { status: 'processed', transaction_id: gatewayTx.id };
  }

  /**
   * Validate Asaas webhook signature.
   *
   * Asaas sends a webhook_token (configured in the Asaas dashboard) in the
   * 'asaas-access-token' header. We compare it against the token stored in
   * the GatewayConfig credentials for the restaurant.
   *
   * Lookup strategy: first try finding the transaction to get restaurant_id,
   * then load the GatewayConfig for that restaurant's Asaas provider.
   * If no config exists, reject the webhook.
   */
  private async validateAsaasSignature(
    receivedToken: string,
    paymentId: string,
  ): Promise<boolean> {
    if (!receivedToken) {
      this.logger.warn(
        `Asaas webhook signature validation failed: no token received | paymentId=${paymentId}`,
      );
      return false;
    }

    // Find the transaction to get restaurant_id
    const tx = await this.transactionRepository.findOne({
      where: { external_id: paymentId, provider: 'asaas' },
      select: ['restaurant_id'],
    });

    // If we can't find the transaction, try matching against all Asaas configs
    let expectedToken: string | undefined;

    if (tx?.restaurant_id) {
      const config = await this.configRepository.findOne({
        where: { restaurant_id: tx.restaurant_id, provider: 'asaas', is_active: true },
      });
      expectedToken = config?.credentials?.webhook_token;
    }

    if (!expectedToken) {
      // Fallback: try to find any active Asaas config with matching token
      const configs = await this.configRepository.find({
        where: { provider: 'asaas', is_active: true },
      });
      const match = configs.find((c) => c.credentials?.webhook_token === receivedToken);
      if (match) {
        expectedToken = match.credentials.webhook_token;
      }
    }

    if (!expectedToken) {
      this.logger.warn(
        `Asaas webhook: no webhook_token configured for payment ${paymentId}. Rejecting.`,
      );
      return false;
    }

    // Timing-safe comparison to prevent timing attacks
    try {
      const receivedBuf = Buffer.from(receivedToken);
      const expectedBuf = Buffer.from(expectedToken);
      if (receivedBuf.length !== expectedBuf.length) return false;
      return crypto.timingSafeEqual(receivedBuf, expectedBuf);
    } catch {
      return false;
    }
  }

  // ─── Stripe Webhooks ──────────────────────────────────────────────────────────

  /**
   * Process an incoming Stripe webhook.
   *
   * Stripe sends webhooks with a Stripe-Signature header for verification.
   * The PaymentIntent ID is in data.object.id.
   */
  async processStripeWebhook(
    body: any,
    headers: Record<string, string>,
  ): Promise<{ status: string; transaction_id?: string }> {
    const eventType = body?.type;
    const paymentIntentId = body?.data?.object?.id;

    if (!eventType || !paymentIntentId) {
      this.logger.warn(
        `Invalid Stripe webhook payload: missing type or data.object.id`,
      );
      throw new BadRequestException(
        PAYMENT_GATEWAY_MESSAGES.WEBHOOK_PROCESSING_FAILED,
      );
    }

    this.logger.log(
      `Stripe webhook received | type=${eventType} | paymentIntentId=${paymentIntentId}`,
    );

    // Validate Stripe webhook signature — REQUIRED
    const signature = headers['stripe-signature'];
    const isValid = await this.validateStripeSignature(
      signature,
      body,
      paymentIntentId,
    );
    if (!isValid) {
      this.logger.warn(
        `${PAYMENT_GATEWAY_MESSAGES.WEBHOOK_SIGNATURE_INVALID} | paymentIntentId=${paymentIntentId}`,
      );
      throw new UnauthorizedException(
        PAYMENT_GATEWAY_MESSAGES.WEBHOOK_SIGNATURE_INVALID,
      );
    }

    // Find the GatewayTransaction by external_id
    const gatewayTx = await this.transactionRepository.findOne({
      where: { external_id: paymentIntentId, provider: 'stripe_terminal' },
    });

    if (!gatewayTx) {
      this.logger.warn(
        `Stripe webhook: transaction not found for paymentIntentId=${paymentIntentId}`,
      );
      return { status: 'ignored' };
    }

    // Map Stripe event to internal status
    const statusMap: Record<string, string> = {
      'payment_intent.succeeded': 'completed',
      'payment_intent.payment_failed': 'failed',
      'charge.refunded': 'refunded',
    };

    const newStatus = statusMap[eventType];
    if (!newStatus) {
      this.logger.log(
        `Stripe webhook: unhandled event type=${eventType} | paymentIntentId=${paymentIntentId}`,
      );
      return { status: 'ignored' };
    }

    // Update transaction status
    const previousStatus = gatewayTx.status;
    gatewayTx.status = newStatus;
    gatewayTx.metadata = {
      ...gatewayTx.metadata,
      webhook_event: eventType,
      webhook_received_at: new Date().toISOString(),
      previous_status: previousStatus,
    };

    // If failed, capture error info
    if (eventType === 'payment_intent.payment_failed') {
      const lastError = body?.data?.object?.last_payment_error;
      if (lastError) {
        gatewayTx.error_code = lastError.code || 'STRIPE_FAILED';
        gatewayTx.error_message = lastError.message || 'Payment failed';
      }
    }

    // If refunded, update refunded amount
    if (eventType === 'charge.refunded') {
      const amountRefunded = body?.data?.object?.amount_refunded;
      if (amountRefunded) {
        gatewayTx.refunded_amount_cents = amountRefunded;
        gatewayTx.status =
          amountRefunded >= gatewayTx.amount_cents
            ? 'refunded'
            : 'partially_refunded';
      }
    }

    await this.transactionRepository.save(gatewayTx);

    this.logger.log(
      `Stripe webhook processed | ` +
        `type=${eventType} | ` +
        `transactionId=${gatewayTx.id} | ` +
        `status: ${previousStatus} → ${gatewayTx.status} | ` +
        `correlationId=${gatewayTx.correlation_id}`,
    );

    // Emit domain event
    this.emitPaymentEvent(gatewayTx, gatewayTx.status);

    return { status: 'processed', transaction_id: gatewayTx.id };
  }

  /**
   * Validate Stripe webhook signature.
   *
   * Stripe sends a 'Stripe-Signature' header with format:
   *   t=<timestamp>,v1=<signature>
   *
   * Verification: HMAC-SHA256 of "<timestamp>.<rawBody>" with the webhook
   * endpoint secret stored in GatewayConfig credentials.
   *
   * Includes timestamp tolerance check (5 minutes) for replay protection.
   */
  private async validateStripeSignature(
    signature: string,
    body: any,
    paymentIntentId: string,
  ): Promise<boolean> {
    if (!signature) {
      this.logger.warn(
        `Stripe webhook signature validation failed: no signature | paymentIntentId=${paymentIntentId}`,
      );
      return false;
    }

    // Parse Stripe-Signature header: t=<ts>,v1=<sig>
    const parts = signature.split(',');
    const tsEntry = parts.find((p) => p.startsWith('t='));
    const sigEntry = parts.find((p) => p.startsWith('v1='));

    if (!tsEntry || !sigEntry) {
      this.logger.warn('Stripe webhook: malformed Stripe-Signature header');
      return false;
    }

    const timestamp = tsEntry.replace('t=', '');
    const receivedSig = sigEntry.replace('v1=', '');

    // Replay protection: reject webhooks older than 5 minutes
    const TOLERANCE_SECONDS = 300;
    const tsNum = parseInt(timestamp, 10);
    const now = Math.floor(Date.now() / 1000);
    if (isNaN(tsNum) || Math.abs(now - tsNum) > TOLERANCE_SECONDS) {
      this.logger.warn(
        `Stripe webhook: timestamp out of tolerance | t=${timestamp} | now=${now}`,
      );
      return false;
    }

    // Find transaction to get restaurant_id
    const tx = await this.transactionRepository.findOne({
      where: { external_id: paymentIntentId, provider: 'stripe_terminal' },
      select: ['restaurant_id'],
    });

    let webhookSecret: string | undefined;

    if (tx?.restaurant_id) {
      const config = await this.configRepository.findOne({
        where: { restaurant_id: tx.restaurant_id, provider: 'stripe_terminal', is_active: true },
      });
      webhookSecret = config?.credentials?.webhook_secret;
    }

    if (!webhookSecret) {
      this.logger.warn(
        `Stripe webhook: no webhook_secret configured for paymentIntent ${paymentIntentId}. Rejecting.`,
      );
      return false;
    }

    // Compute expected signature: HMAC-SHA256("<timestamp>.<rawBody>")
    const rawBody = typeof body === 'string' ? body : JSON.stringify(body);
    const signedPayload = `${timestamp}.${rawBody}`;
    const expectedSig = crypto
      .createHmac('sha256', webhookSecret)
      .update(signedPayload)
      .digest('hex');

    // Timing-safe comparison
    try {
      const receivedBuf = Buffer.from(receivedSig, 'hex');
      const expectedBuf = Buffer.from(expectedSig, 'hex');
      if (receivedBuf.length !== expectedBuf.length) return false;
      return crypto.timingSafeEqual(receivedBuf, expectedBuf);
    } catch {
      return false;
    }
  }

  // ─── Event Emission ───────────────────────────────────────────────────────────

  /**
   * Emit a domain event for downstream consumers.
   *
   * GAP-2: Now calls FinancialEventListenerService directly for payment.confirmed events.
   * When @nestjs/event-emitter is added, this becomes an EventEmitter2 emit.
   */
  private emitPaymentEvent(
    gatewayTx: GatewayTransaction,
    status: string,
  ): void {
    const eventName =
      status === 'completed' || status === 'refunded'
        ? `payment.${status === 'completed' ? 'confirmed' : 'refunded'}`
        : `payment.${status}`;

    this.logger.log(
      `[EVENT] ${eventName} | ` +
        `transactionId=${gatewayTx.id} | ` +
        `orderId=${gatewayTx.order_id} | ` +
        `provider=${gatewayTx.provider} | ` +
        `amount_cents=${gatewayTx.amount_cents}`,
    );

    // GAP-2: Direct call to financial event listener for payment confirmed
    if (status === 'completed' && gatewayTx.order_id && this.financialEventListener) {
      const amountDecimal = gatewayTx.amount_cents / 100;
      this.financialEventListener
        .onPaymentConfirmed(
          gatewayTx.order_id,
          amountDecimal,
          gatewayTx.payment_method,
          gatewayTx.restaurant_id,
        )
        .catch((err) => {
          const error = err instanceof Error ? err.message : 'Unknown error';
          this.logger.warn(
            `Financial event (onPaymentConfirmed) failed for tx ${gatewayTx.id}: ${error}`,
          );
        });
    }
  }
}

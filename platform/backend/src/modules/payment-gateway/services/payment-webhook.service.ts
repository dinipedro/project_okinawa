import {
  Injectable,
  Logger,
  BadRequestException,
  Inject,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

    // Validate webhook signature (via access_token header)
    const webhookToken = headers['asaas-access-token'] || headers['access_token'];
    if (webhookToken) {
      const isValid = await this.validateAsaasSignature(
        webhookToken,
        paymentId,
      );
      if (!isValid) {
        this.logger.warn(
          `${PAYMENT_GATEWAY_MESSAGES.WEBHOOK_SIGNATURE_INVALID} | paymentId=${paymentId}`,
        );
        throw new BadRequestException(
          PAYMENT_GATEWAY_MESSAGES.WEBHOOK_SIGNATURE_INVALID,
        );
      }
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
   * Asaas uses a webhook_token configured per GatewayConfig.
   *
   * TODO: Implement actual signature validation against stored webhook_token.
   * For now, logs the validation attempt.
   */
  private async validateAsaasSignature(
    receivedToken: string,
    paymentId: string,
  ): Promise<boolean> {
    this.logger.log(
      `[TODO] Validating Asaas webhook signature | ` +
        `receivedToken=${receivedToken ? '***present' : 'MISSING'} | ` +
        `paymentId=${paymentId}`,
    );

    // TODO: Look up the GatewayConfig for this payment's restaurant
    // and compare the receivedToken against config.credentials.webhook_token
    // For now, accept all webhooks in development
    return true;
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

    // Validate Stripe webhook signature
    const signature = headers['stripe-signature'];
    if (signature) {
      const isValid = await this.validateStripeSignature(
        signature,
        body,
        paymentIntentId,
      );
      if (!isValid) {
        this.logger.warn(
          `${PAYMENT_GATEWAY_MESSAGES.WEBHOOK_SIGNATURE_INVALID} | paymentIntentId=${paymentIntentId}`,
        );
        throw new BadRequestException(
          PAYMENT_GATEWAY_MESSAGES.WEBHOOK_SIGNATURE_INVALID,
        );
      }
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
   * TODO: Implement actual Stripe signature verification using
   * stripe.webhooks.constructEvent(rawBody, signature, webhookSecret).
   * Requires the raw body buffer and the endpoint secret from GatewayConfig.
   */
  private async validateStripeSignature(
    signature: string,
    _body: any,
    paymentIntentId: string,
  ): Promise<boolean> {
    this.logger.log(
      `[TODO] Validating Stripe webhook signature | ` +
        `signature=${signature ? '***present' : 'MISSING'} | ` +
        `paymentIntentId=${paymentIntentId}`,
    );

    // TODO: Look up the GatewayConfig for this payment's restaurant
    // and verify using stripe.webhooks.constructEvent()
    // For now, accept all webhooks in development
    return true;
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

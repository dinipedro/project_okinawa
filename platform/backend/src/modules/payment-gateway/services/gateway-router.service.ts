import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GatewayTransaction } from '../entities/gateway-transaction.entity';
import { GatewayConfig } from '../entities/gateway-config.entity';
import {
  PaymentMethodType,
  GatewayProvider,
  PaymentResult,
  RefundResult,
  ProcessPaymentParams,
} from '../interfaces/gateway-adapter.interface';
import { AsaasAdapter } from '../adapters/asaas/asaas.adapter';
import { AsaasPixService } from '../adapters/asaas/asaas.pix.service';
import { StripeTerminalAdapter } from '../adapters/stripe-terminal/stripe-terminal.adapter';
import { WalletAdapter } from '../adapters/wallet/wallet.adapter';
import { ProcessGatewayPaymentDto } from '../dto/process-gateway-payment.dto';
import { PAYMENT_GATEWAY_MESSAGES } from '../i18n/payment-gateway.i18n';

/**
 * GatewayRouterService — Central payment routing engine.
 *
 * Routes payments to the correct adapter based on payment_method:
 *   credit_card, debit_card → AsaasAdapter
 *   pix                     → AsaasAdapter (via AsaasPixService)
 *   tap_to_pay              → StripeTerminalAdapter
 *   wallet                  → WalletAdapter
 *   cash                    → returns {success: true, status: 'pending'} directly
 *
 * Creates a GatewayTransaction for every operation.
 * Uses idempotency_key to prevent duplicate charges.
 * Logs correlation_id for distributed tracing.
 */
@Injectable()
export class GatewayRouterService {
  private readonly logger = new Logger(GatewayRouterService.name);

  constructor(
    @InjectRepository(GatewayTransaction)
    private readonly transactionRepository: Repository<GatewayTransaction>,
    @InjectRepository(GatewayConfig)
    private readonly configRepository: Repository<GatewayConfig>,
    private readonly asaasAdapter: AsaasAdapter,
    private readonly asaasPixService: AsaasPixService,
    private readonly stripeTerminalAdapter: StripeTerminalAdapter,
    private readonly walletAdapter: WalletAdapter,
  ) {}

  /**
   * Resolve which gateway provider handles a given payment method.
   */
  private resolveProvider(paymentMethod: PaymentMethodType): GatewayProvider {
    switch (paymentMethod) {
      case 'credit_card':
      case 'debit_card':
      case 'pix':
        return 'asaas';
      case 'tap_to_pay':
        return 'stripe_terminal';
      case 'wallet':
        return 'wallet';
      case 'cash':
        return 'cash';
      default:
        throw new BadRequestException(
          PAYMENT_GATEWAY_MESSAGES.INVALID_PAYMENT_METHOD,
        );
    }
  }

  /**
   * Process a payment — routes to the correct adapter.
   */
  async processPayment(
    dto: ProcessGatewayPaymentDto,
    customerId?: string,
  ): Promise<PaymentResult> {
    const correlationId = `gw_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const idempotencyKey =
      dto.idempotency_key ||
      `auto_${dto.order_id}_${dto.payment_method}_${Date.now()}`;

    this.logger.log(
      `Processing payment | ` +
        `method=${dto.payment_method} | ` +
        `amount_cents=${dto.amount_cents} | ` +
        `orderId=${dto.order_id} | ` +
        `restaurantId=${dto.restaurant_id} | ` +
        `correlationId=${correlationId}`,
    );

    // Check idempotency — prevent duplicate charges
    const existingTx = await this.transactionRepository.findOne({
      where: { idempotency_key: idempotencyKey },
    });
    if (existingTx) {
      this.logger.warn(
        `Duplicate payment detected | ` +
          `idempotency_key=${idempotencyKey} | ` +
          `existingTx=${existingTx.id} | ` +
          `correlationId=${correlationId}`,
      );
      return {
        success: existingTx.status === 'completed',
        transaction_id: existingTx.id,
        external_id: existingTx.external_id || '',
        status: existingTx.status as 'completed' | 'pending' | 'failed',
      };
    }

    const provider = this.resolveProvider(dto.payment_method);

    // Handle cash payments directly — no external gateway needed
    if (provider === 'cash') {
      return this.processCashPayment(dto, idempotencyKey, correlationId);
    }

    // Build ProcessPaymentParams for the adapter
    const params: ProcessPaymentParams = {
      amount: dto.amount_cents,
      payment_method: dto.payment_method,
      order_id: dto.order_id,
      restaurant_id: dto.restaurant_id,
      customer_id: customerId,
      idempotency_key: idempotencyKey,
      card_token: dto.card_token,
      installments: dto.installments,
      pix_expiration_seconds: dto.pix_expiration_seconds,
      stripe_payment_intent_id: dto.stripe_payment_intent_id,
      metadata: {
        ...dto.metadata,
        correlation_id: correlationId,
      },
    };

    // Route to the correct adapter
    switch (provider) {
      case 'asaas':
        return this.asaasAdapter.processPayment(params);
      case 'stripe_terminal':
        return this.stripeTerminalAdapter.processPayment(params);
      case 'wallet':
        return this.walletAdapter.processPayment(params);
      default:
        throw new BadRequestException(
          PAYMENT_GATEWAY_MESSAGES.INVALID_PAYMENT_METHOD,
        );
    }
  }

  /**
   * Process a cash payment — creates a GatewayTransaction directly.
   * Cash is handled at the register, no external gateway.
   */
  private async processCashPayment(
    dto: ProcessGatewayPaymentDto,
    idempotencyKey: string,
    correlationId: string,
  ): Promise<PaymentResult> {
    const gatewayTx = this.transactionRepository.create({
      restaurant_id: dto.restaurant_id,
      order_id: dto.order_id,
      provider: 'cash',
      payment_method: 'cash',
      amount_cents: dto.amount_cents,
      status: 'pending',
      idempotency_key: idempotencyKey,
      correlation_id: correlationId,
      external_id: `cash_${Date.now()}`,
      metadata: {
        ...dto.metadata,
        correlation_id: correlationId,
      },
    });
    await this.transactionRepository.save(gatewayTx);

    this.logger.log(
      `Cash payment recorded | ` +
        `transactionId=${gatewayTx.id} | ` +
        `amount_cents=${dto.amount_cents} | ` +
        `correlationId=${correlationId}`,
    );

    return {
      success: true,
      transaction_id: gatewayTx.id,
      external_id: gatewayTx.external_id,
      status: 'pending',
    };
  }

  /**
   * Refund a payment — routes to the correct adapter based on the original transaction's provider.
   */
  async refundPayment(
    transactionId: string,
    amountCents?: number,
  ): Promise<RefundResult> {
    const gatewayTx = await this.transactionRepository.findOne({
      where: { id: transactionId },
    });

    if (!gatewayTx) {
      throw new NotFoundException(
        PAYMENT_GATEWAY_MESSAGES.TRANSACTION_NOT_FOUND,
      );
    }

    this.logger.log(
      `Processing refund | ` +
        `transactionId=${transactionId} | ` +
        `provider=${gatewayTx.provider} | ` +
        `amount_cents=${amountCents || 'FULL'} | ` +
        `correlationId=${gatewayTx.correlation_id}`,
    );

    // Route to the correct adapter
    switch (gatewayTx.provider) {
      case 'asaas':
        return this.asaasAdapter.refundPayment(transactionId, amountCents);
      case 'stripe_terminal':
        return this.stripeTerminalAdapter.refundPayment(
          transactionId,
          amountCents,
        );
      case 'wallet':
        return this.walletAdapter.refundPayment(transactionId, amountCents);
      case 'cash':
        return this.refundCashPayment(gatewayTx, amountCents);
      default:
        return {
          success: false,
          refund_id: '',
          refunded_amount: 0,
          status: 'failed',
          error_code: 'UNKNOWN_PROVIDER',
          error_message: `Unknown provider: ${gatewayTx.provider}`,
        };
    }
  }

  /**
   * Refund a cash payment — updates the GatewayTransaction directly.
   */
  private async refundCashPayment(
    gatewayTx: GatewayTransaction,
    amountCents?: number,
  ): Promise<RefundResult> {
    const refundAmount = amountCents || gatewayTx.amount_cents;

    if (
      gatewayTx.refunded_amount_cents + refundAmount >
      gatewayTx.amount_cents
    ) {
      return {
        success: false,
        refund_id: '',
        refunded_amount: 0,
        status: 'failed',
        error_code: 'REFUND_EXCEEDS_AMOUNT',
        error_message: PAYMENT_GATEWAY_MESSAGES.REFUND_EXCEEDS_AMOUNT,
      };
    }

    gatewayTx.refunded_amount_cents += refundAmount;
    gatewayTx.status =
      gatewayTx.refunded_amount_cents >= gatewayTx.amount_cents
        ? 'refunded'
        : 'partially_refunded';
    await this.transactionRepository.save(gatewayTx);

    const refundId = `cash_refund_${Date.now()}`;

    this.logger.log(
      `Cash refund completed | ` +
        `refundId=${refundId} | ` +
        `amount_cents=${refundAmount} | ` +
        `status=${gatewayTx.status}`,
    );

    return {
      success: true,
      refund_id: refundId,
      refunded_amount: refundAmount,
      status: gatewayTx.status as 'refunded' | 'partially_refunded',
    };
  }

  /**
   * Create a Stripe Terminal connection token for the mobile SDK.
   */
  async createConnectionToken(restaurantId: string): Promise<string> {
    return this.stripeTerminalAdapter.createConnectionToken(restaurantId);
  }

  /**
   * Create a Stripe Terminal PaymentIntent for Tap to Pay.
   */
  async createTapToPayIntent(
    orderId: string,
    restaurantId: string,
    amountCents: number,
    metadata?: Record<string, any>,
  ): Promise<{ client_secret: string; payment_intent_id: string }> {
    return this.stripeTerminalAdapter.createPaymentIntent({
      amount: amountCents,
      payment_method: 'tap_to_pay',
      order_id: orderId,
      restaurant_id: restaurantId,
      idempotency_key: `ttp_${orderId}_${Date.now()}`,
      metadata,
    });
  }

  /**
   * Retrieve a PIX QR code for an existing transaction.
   */
  async getPixQrCode(orderId: string) {
    // Find the PIX transaction for this order
    const gatewayTx = await this.transactionRepository.findOne({
      where: { order_id: orderId, payment_method: 'pix' },
      order: { created_at: 'DESC' },
    });

    if (!gatewayTx) {
      throw new NotFoundException(
        PAYMENT_GATEWAY_MESSAGES.TRANSACTION_NOT_FOUND,
      );
    }

    return this.asaasPixService.getPixQrCode(gatewayTx.id);
  }

  /**
   * Get gateway config for a restaurant.
   */
  async getGatewayConfig(restaurantId: string): Promise<GatewayConfig[]> {
    return this.configRepository.find({
      where: { restaurant_id: restaurantId },
      order: { provider: 'ASC' },
    });
  }

  /**
   * Upsert gateway config for a restaurant.
   */
  async upsertGatewayConfig(
    restaurantId: string,
    provider: string,
    credentials: Record<string, any>,
    isActive?: boolean,
    settings?: Record<string, any>,
  ): Promise<GatewayConfig> {
    let config = await this.configRepository.findOne({
      where: { restaurant_id: restaurantId, provider },
    });

    if (config) {
      // Update existing
      config.credentials = credentials;
      if (isActive !== undefined) config.is_active = isActive;
      if (settings !== undefined) config.settings = settings;
    } else {
      // Create new
      config = this.configRepository.create() as GatewayConfig;
      config.restaurant_id = restaurantId;
      config.provider = provider;
      config.credentials = credentials;
      config.is_active = isActive !== undefined ? isActive : true;
      config.settings = settings || ({} as any);
    }

    const saved = await this.configRepository.save(config as any);
    return saved as unknown as GatewayConfig;
  }
}

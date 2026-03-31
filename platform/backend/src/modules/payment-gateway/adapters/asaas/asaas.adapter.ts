import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  GatewayAdapter,
  ProcessPaymentParams,
  PaymentResult,
  RefundResult,
  PaymentStatus,
} from '../../interfaces/gateway-adapter.interface';
import { GatewayConfig } from '../../entities/gateway-config.entity';
import { GatewayTransaction } from '../../entities/gateway-transaction.entity';
import { AsaasPixService } from './asaas.pix.service';

/**
 * Adapter for Asaas API v3 (https://docs.asaas.com)
 *
 * Handles credit card, debit card, and PIX payments via Asaas gateway.
 *
 * ─── Card Payment Flow ───────────────────────────────────────────────
 * 1. Frontend tokenizes card via Asaas.js SDK -> returns card_token
 * 2. Backend creates customer on Asaas (if not exists)
 * 3. Backend creates charge: POST /v3/payments
 *    - billingType: CREDIT_CARD or DEBIT_CARD
 *    - creditCardToken (from frontend)
 * 4. Asaas processes and returns status
 * 5. Webhook confirms async payment
 *
 * ─── PIX Payment Flow ────────────────────────────────────────────────
 * 1. Backend creates charge: POST /v3/payments (billingType: PIX)
 * 2. Asaas returns: encodedImage (QR base64) + payload (copy-paste code)
 * 3. Frontend displays QR Code
 * 4. Webhook PAYMENT_RECEIVED confirms payment
 *
 * ─── Asaas Endpoints Used ────────────────────────────────────────────
 * - POST /v3/customers           -> Create/find customer
 * - POST /v3/payments            -> Create charge
 * - GET  /v3/payments/:id        -> Check charge status
 * - POST /v3/payments/:id/refund -> Refund charge
 * - GET  /v3/payments/:id/pixQrCode -> Get PIX QR Code
 *
 * ─── Asaas Webhooks ──────────────────────────────────────────────────
 * - PAYMENT_CONFIRMED    -> Card approved
 * - PAYMENT_RECEIVED     -> PIX received
 * - PAYMENT_OVERDUE      -> Payment expired
 * - PAYMENT_REFUNDED     -> Refund processed
 *
 * Auth: API Key in header "access_token"
 * Base URL prod:    https://api.asaas.com
 * Base URL sandbox: https://sandbox.asaas.com/api
 *
 * IMPORTANT: All API calls are LOG PLACEHOLDERS (marked TODO).
 * Consult https://docs.asaas.com before implementing real integration.
 */
@Injectable()
export class AsaasAdapter implements GatewayAdapter {
  readonly provider = 'asaas' as const;
  private readonly logger = new Logger(AsaasAdapter.name);

  constructor(
    @InjectRepository(GatewayConfig)
    private readonly configRepository: Repository<GatewayConfig>,
    @InjectRepository(GatewayTransaction)
    private readonly transactionRepository: Repository<GatewayTransaction>,
    private readonly pixService: AsaasPixService,
  ) {}

  /**
   * Get Asaas config for a restaurant.
   * Returns credentials and settings needed for API calls.
   */
  private async getConfig(restaurantId: string): Promise<GatewayConfig | null> {
    return this.configRepository.findOne({
      where: { restaurant_id: restaurantId, provider: 'asaas', is_active: true },
    });
  }

  /**
   * Build the Asaas API base URL based on environment setting.
   */
  private getBaseUrl(config: GatewayConfig): string {
    const env = config.credentials?.environment || 'sandbox';
    return env === 'production'
      ? 'https://api.asaas.com'
      : 'https://sandbox.asaas.com/api';
  }

  /**
   * Process a payment via Asaas.
   *
   * Routes to card payment or PIX based on payment_method.
   */
  async processPayment(params: ProcessPaymentParams): Promise<PaymentResult> {
    const config = await this.getConfig(params.restaurant_id);

    if (!config) {
      this.logger.warn(
        `Asaas not configured for restaurant ${params.restaurant_id}`,
      );
      return {
        success: false,
        transaction_id: '',
        external_id: '',
        status: 'failed',
        error_code: 'GATEWAY_NOT_CONFIGURED',
        error_message: 'Asaas gateway is not configured for this restaurant',
      };
    }

    const baseUrl = this.getBaseUrl(config);

    // Check idempotency — prevent duplicate charges
    const existingTx = await this.transactionRepository.findOne({
      where: { idempotency_key: params.idempotency_key },
    });
    if (existingTx) {
      this.logger.warn(
        `Duplicate payment detected: idempotency_key=${params.idempotency_key}`,
      );
      return {
        success: existingTx.status === 'completed',
        transaction_id: existingTx.id,
        external_id: existingTx.external_id || '',
        status: existingTx.status as 'completed' | 'pending' | 'failed',
      };
    }

    // Create GatewayTransaction record
    const correlationId = `asaas_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const gatewayTx = this.transactionRepository.create({
      restaurant_id: params.restaurant_id,
      order_id: params.order_id,
      provider: 'asaas',
      payment_method: params.payment_method,
      amount_cents: params.amount,
      status: 'pending',
      idempotency_key: params.idempotency_key,
      correlation_id: correlationId,
      metadata: params.metadata || {},
    });
    await this.transactionRepository.save(gatewayTx);

    // Route to the correct payment method handler
    if (params.payment_method === 'pix') {
      return this.processPixPayment(params, config, baseUrl, gatewayTx);
    }

    return this.processCardPayment(params, config, baseUrl, gatewayTx);
  }

  /**
   * Process credit/debit card payment via Asaas.
   *
   * TODO: Replace log placeholders with actual Asaas API calls:
   *   1. POST /v3/customers — find or create customer
   *   2. POST /v3/payments — create charge with creditCardToken
   */
  private async processCardPayment(
    params: ProcessPaymentParams,
    config: GatewayConfig,
    baseUrl: string,
    gatewayTx: GatewayTransaction,
  ): Promise<PaymentResult> {
    const billingType =
      params.payment_method === 'credit_card' ? 'CREDIT_CARD' : 'DEBIT_CARD';

    this.logger.log(
      `[TODO] Asaas card payment | ` +
        `POST ${baseUrl}/v3/payments | ` +
        `billingType=${billingType} | ` +
        `amount=${(params.amount / 100).toFixed(2)} | ` +
        `cardToken=${params.card_token ? '***' : 'MISSING'} | ` +
        `installments=${params.installments || 1} | ` +
        `apiKey=${config.credentials?.api_key ? '***configured' : 'MISSING'} | ` +
        `orderId=${params.order_id} | ` +
        `correlationId=${gatewayTx.correlation_id}`,
    );

    // TODO: Step 1 — Find or create customer on Asaas
    // const customerResponse = await fetch(`${baseUrl}/v3/customers`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'access_token': config.credentials.api_key,
    //   },
    //   body: JSON.stringify({
    //     name: params.metadata?.customer_name || 'Customer',
    //     cpfCnpj: params.metadata?.customer_cpf,
    //     email: params.metadata?.customer_email,
    //   }),
    // });

    // TODO: Step 2 — Create charge on Asaas
    // const chargeResponse = await fetch(`${baseUrl}/v3/payments`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'access_token': config.credentials.api_key,
    //   },
    //   body: JSON.stringify({
    //     customer: customerId,
    //     billingType,
    //     value: params.amount / 100,
    //     creditCardToken: params.card_token,
    //     installmentCount: params.installments || 1,
    //     externalReference: params.order_id,
    //     description: `Order ${params.order_id}`,
    //   }),
    // });
    // const charge = await chargeResponse.json();

    // Simulated response for development
    const simulatedExternalId = `asaas_sim_${Date.now()}`;
    gatewayTx.external_id = simulatedExternalId;
    gatewayTx.status = 'completed';
    gatewayTx.metadata = {
      ...gatewayTx.metadata,
      billing_type: billingType,
      installments: params.installments || 1,
      simulated: true,
    };
    await this.transactionRepository.save(gatewayTx);

    this.logger.log(
      `[SIMULATED] Asaas card payment completed | ` +
        `transactionId=${gatewayTx.id} | ` +
        `externalId=${simulatedExternalId} | ` +
        `amount_cents=${params.amount}`,
    );

    return {
      success: true,
      transaction_id: gatewayTx.id,
      external_id: simulatedExternalId,
      status: 'completed',
    };
  }

  /**
   * Process PIX payment via Asaas.
   * Delegates to AsaasPixService for QR code generation.
   *
   * TODO: Replace with actual Asaas PIX API call:
   *   POST /v3/payments (billingType: PIX)
   */
  private async processPixPayment(
    params: ProcessPaymentParams,
    config: GatewayConfig,
    baseUrl: string,
    gatewayTx: GatewayTransaction,
  ): Promise<PaymentResult> {
    return this.pixService.createPixCharge(params, config, baseUrl, gatewayTx);
  }

  /**
   * Refund a payment via Asaas.
   *
   * TODO: Replace with actual API call:
   *   POST /v3/payments/:id/refund
   */
  async refundPayment(
    transactionId: string,
    amount?: number,
  ): Promise<RefundResult> {
    const gatewayTx = await this.transactionRepository.findOne({
      where: { id: transactionId },
    });

    if (!gatewayTx) {
      return {
        success: false,
        refund_id: '',
        refunded_amount: 0,
        status: 'failed',
        error_code: 'TRANSACTION_NOT_FOUND',
        error_message: `Transaction ${transactionId} not found`,
      };
    }

    const refundAmount = amount || gatewayTx.amount_cents;

    // Validate refund doesn't exceed original amount
    if (gatewayTx.refunded_amount_cents + refundAmount > gatewayTx.amount_cents) {
      return {
        success: false,
        refund_id: '',
        refunded_amount: 0,
        status: 'failed',
        error_code: 'REFUND_EXCEEDS_AMOUNT',
        error_message: 'Refund amount exceeds original payment',
      };
    }

    const config = await this.getConfig(gatewayTx.restaurant_id);
    const baseUrl = config ? this.getBaseUrl(config) : 'https://sandbox.asaas.com/api';

    this.logger.log(
      `[TODO] Asaas refund | ` +
        `POST ${baseUrl}/v3/payments/${gatewayTx.external_id}/refund | ` +
        `amount=${(refundAmount / 100).toFixed(2)} | ` +
        `transactionId=${transactionId} | ` +
        `externalId=${gatewayTx.external_id}`,
    );

    // TODO: Actual Asaas refund API call
    // const refundResponse = await fetch(
    //   `${baseUrl}/v3/payments/${gatewayTx.external_id}/refund`,
    //   {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'access_token': config.credentials.api_key,
    //     },
    //     body: JSON.stringify({ value: refundAmount / 100 }),
    //   },
    // );

    // Update transaction
    gatewayTx.refunded_amount_cents += refundAmount;
    gatewayTx.status =
      gatewayTx.refunded_amount_cents >= gatewayTx.amount_cents
        ? 'refunded'
        : 'partially_refunded';
    await this.transactionRepository.save(gatewayTx);

    const simulatedRefundId = `refund_sim_${Date.now()}`;

    this.logger.log(
      `[SIMULATED] Asaas refund completed | ` +
        `refundId=${simulatedRefundId} | ` +
        `amount_cents=${refundAmount} | ` +
        `status=${gatewayTx.status}`,
    );

    return {
      success: true,
      refund_id: simulatedRefundId,
      refunded_amount: refundAmount,
      status: gatewayTx.status as 'refunded' | 'partially_refunded',
    };
  }

  /**
   * Get payment status from Asaas.
   *
   * TODO: Replace with actual API call:
   *   GET /v3/payments/:id
   */
  async getPaymentStatus(transactionId: string): Promise<PaymentStatus> {
    const gatewayTx = await this.transactionRepository.findOne({
      where: { id: transactionId },
    });

    if (!gatewayTx) {
      throw new Error(`Transaction ${transactionId} not found`);
    }

    const config = await this.getConfig(gatewayTx.restaurant_id);
    const baseUrl = config ? this.getBaseUrl(config) : 'https://sandbox.asaas.com/api';

    this.logger.log(
      `[TODO] Asaas status check | ` +
        `GET ${baseUrl}/v3/payments/${gatewayTx.external_id} | ` +
        `transactionId=${transactionId}`,
    );

    // TODO: Actual Asaas status API call
    // const statusResponse = await fetch(
    //   `${baseUrl}/v3/payments/${gatewayTx.external_id}`,
    //   {
    //     headers: { 'access_token': config.credentials.api_key },
    //   },
    // );
    // const statusData = await statusResponse.json();
    // Map Asaas status to internal status

    return {
      transaction_id: gatewayTx.id,
      external_id: gatewayTx.external_id || '',
      status: gatewayTx.status as any,
      amount: gatewayTx.amount_cents,
      refunded_amount: gatewayTx.refunded_amount_cents,
      payment_method: gatewayTx.payment_method as any,
      updated_at: gatewayTx.updated_at,
    };
  }
}

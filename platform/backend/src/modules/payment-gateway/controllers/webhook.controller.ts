import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { PaymentWebhookService } from '../services/payment-webhook.service';

/**
 * Webhook Controller for Payment Gateways
 *
 * Receives payment status webhooks from Asaas and Stripe.
 * Endpoints are @Public() — no JWT required.
 * Validation is done via provider-specific webhook signature verification.
 */
@ApiTags('payment-gateway')
@Controller('payment-gateway/webhooks')
export class PaymentWebhookController {
  private readonly logger = new Logger(PaymentWebhookController.name);

  constructor(
    private readonly paymentWebhookService: PaymentWebhookService,
  ) {}

  /**
   * POST /payment-gateway/webhooks/asaas
   *
   * Receives payment status webhooks from Asaas.
   * Events: PAYMENT_CONFIRMED, PAYMENT_RECEIVED, PAYMENT_OVERDUE, PAYMENT_REFUNDED
   */
  @Post('asaas')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Receive Asaas payment webhook' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  @ApiResponse({ status: 400, description: 'Invalid webhook payload or signature' })
  async handleAsaasWebhook(
    @Headers() headers: Record<string, string>,
    @Body() body: any,
  ) {
    this.logger.log(
      `Asaas webhook endpoint hit | event=${body?.event || 'unknown'}`,
    );
    return this.paymentWebhookService.processAsaasWebhook(body, headers);
  }

  /**
   * POST /payment-gateway/webhooks/stripe
   *
   * Receives payment status webhooks from Stripe.
   * Events: payment_intent.succeeded, payment_intent.payment_failed, charge.refunded
   */
  @Post('stripe')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Receive Stripe Terminal payment webhook' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  @ApiResponse({ status: 400, description: 'Invalid webhook payload or signature' })
  async handleStripeWebhook(
    @Headers() headers: Record<string, string>,
    @Body() body: any,
  ) {
    this.logger.log(
      `Stripe webhook endpoint hit | type=${body?.type || 'unknown'}`,
    );
    return this.paymentWebhookService.processStripeWebhook(body, headers);
  }
}

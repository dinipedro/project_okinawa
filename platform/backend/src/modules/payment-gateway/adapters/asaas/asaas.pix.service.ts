import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ProcessPaymentParams,
  PaymentResult,
} from '../../interfaces/gateway-adapter.interface';
import { GatewayConfig } from '../../entities/gateway-config.entity';
import { GatewayTransaction } from '../../entities/gateway-transaction.entity';

/**
 * Dedicated service for PIX payments via Asaas.
 *
 * ─── Flow ─────────────────────────────────────────────────────────────
 * 1. Create PIX charge -> receive QR code (base64) + copy-paste code
 * 2. Frontend displays QR code to customer
 * 3. Customer scans and pays via their banking app
 * 4. Asaas webhook PAYMENT_RECEIVED confirms payment
 * 5. WebSocket event `payment:pix_confirmed` sent to frontend
 *
 * The QR code has a configurable expiration (default 10 min = 600s).
 * If expired, a new charge must be created.
 *
 * TODO: All Asaas API calls are LOG PLACEHOLDERS.
 * Implement with actual Asaas PIX endpoints when ready.
 */
@Injectable()
export class AsaasPixService {
  private readonly logger = new Logger(AsaasPixService.name);

  constructor(
    @InjectRepository(GatewayTransaction)
    private readonly transactionRepository: Repository<GatewayTransaction>,
  ) {}

  /**
   * Create a PIX charge on Asaas and return QR code data.
   *
   * TODO: Replace with actual Asaas API call:
   *   POST /v3/payments
   *   {
   *     customer: customerId,
   *     billingType: 'PIX',
   *     value: amount / 100,
   *     dueDate: expirationDate,
   *     externalReference: orderId,
   *   }
   *
   * Then fetch QR code:
   *   GET /v3/payments/:id/pixQrCode
   *   Returns: { encodedImage, payload, expirationDate }
   */
  async createPixCharge(
    params: ProcessPaymentParams,
    config: GatewayConfig,
    baseUrl: string,
    gatewayTx: GatewayTransaction,
  ): Promise<PaymentResult> {
    const expirationSeconds = params.pix_expiration_seconds || 600;
    const expirationDate = new Date(Date.now() + expirationSeconds * 1000);

    this.logger.log(
      `[TODO] Asaas PIX charge | ` +
        `POST ${baseUrl}/v3/payments | ` +
        `billingType=PIX | ` +
        `amount=${(params.amount / 100).toFixed(2)} | ` +
        `expiration=${expirationSeconds}s | ` +
        `apiKey=${config.credentials?.api_key ? '***configured' : 'MISSING'} | ` +
        `orderId=${params.order_id} | ` +
        `correlationId=${gatewayTx.correlation_id}`,
    );

    // TODO: Step 1 — Create PIX charge on Asaas
    // const chargeResponse = await fetch(`${baseUrl}/v3/payments`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'access_token': config.credentials.api_key,
    //   },
    //   body: JSON.stringify({
    //     customer: customerId,
    //     billingType: 'PIX',
    //     value: params.amount / 100,
    //     dueDate: expirationDate.toISOString().split('T')[0],
    //     externalReference: params.order_id,
    //     description: `Order ${params.order_id}`,
    //   }),
    // });
    // const charge = await chargeResponse.json();

    // TODO: Step 2 — Get QR code
    // const qrResponse = await fetch(
    //   `${baseUrl}/v3/payments/${charge.id}/pixQrCode`,
    //   { headers: { 'access_token': config.credentials.api_key } },
    // );
    // const qrData = await qrResponse.json();
    // qrData.encodedImage = base64 QR code
    // qrData.payload = copy-paste code

    // Simulated response for development
    const simulatedExternalId = `asaas_pix_sim_${Date.now()}`;
    const simulatedQrCode = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`;
    const simulatedCopyPaste = `00020126580014br.gov.bcb.pix0136${simulatedExternalId}5204000053039865802BR5913NOOWE_SIM6009SAO_PAULO62070503***6304ABCD`;

    // Update transaction
    gatewayTx.external_id = simulatedExternalId;
    gatewayTx.status = 'pending'; // PIX is pending until customer pays
    gatewayTx.metadata = {
      ...gatewayTx.metadata,
      billing_type: 'PIX',
      pix_expiration: expirationDate.toISOString(),
      pix_expiration_seconds: expirationSeconds,
      simulated: true,
    };
    await this.transactionRepository.save(gatewayTx);

    this.logger.log(
      `[SIMULATED] Asaas PIX charge created | ` +
        `transactionId=${gatewayTx.id} | ` +
        `externalId=${simulatedExternalId} | ` +
        `amount_cents=${params.amount} | ` +
        `expiresAt=${expirationDate.toISOString()}`,
    );

    return {
      success: true,
      transaction_id: gatewayTx.id,
      external_id: simulatedExternalId,
      status: 'pending',
      pix_qr_code: simulatedQrCode,
      pix_copy_paste: simulatedCopyPaste,
      pix_expiration: expirationDate,
    };
  }

  /**
   * Retrieve the PIX QR code for an existing charge.
   * Used when the customer needs to re-display the QR code.
   *
   * TODO: Replace with actual Asaas API call:
   *   GET /v3/payments/:id/pixQrCode
   */
  async getPixQrCode(
    transactionId: string,
  ): Promise<{
    qr_code: string;
    copy_paste: string;
    expiration: Date;
    status: string;
  } | null> {
    const gatewayTx = await this.transactionRepository.findOne({
      where: { id: transactionId, payment_method: 'pix' },
    });

    if (!gatewayTx) {
      return null;
    }

    // Check if PIX is expired
    const expiration = gatewayTx.metadata?.pix_expiration
      ? new Date(gatewayTx.metadata.pix_expiration)
      : new Date();

    if (expiration < new Date() && gatewayTx.status === 'pending') {
      gatewayTx.status = 'expired';
      await this.transactionRepository.save(gatewayTx);
      return {
        qr_code: '',
        copy_paste: '',
        expiration,
        status: 'expired',
      };
    }

    this.logger.log(
      `[TODO] Asaas get PIX QR code | ` +
        `GET /v3/payments/${gatewayTx.external_id}/pixQrCode | ` +
        `transactionId=${transactionId}`,
    );

    // TODO: Fetch fresh QR code from Asaas
    // For now return stored simulated data
    return {
      qr_code: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`,
      copy_paste: `00020126580014br.gov.bcb.pix0136${gatewayTx.external_id}5204000053039865802BR5913NOOWE6009SAO_PAULO62070503***6304ABCD`,
      expiration,
      status: gatewayTx.status,
    };
  }
}

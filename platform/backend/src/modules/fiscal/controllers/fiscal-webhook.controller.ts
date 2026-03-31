import {
  Controller,
  Post,
  Body,
  Headers,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Public } from '@/common/decorators/public.decorator';
import { FiscalDocument } from '../entities/fiscal-document.entity';
import { FiscalEventService } from '../services/fiscal-event.service';

/**
 * FiscalWebhookController -- receives callbacks from Focus NFe.
 *
 * POST /fiscal/webhooks/focus-nfe
 *
 * Focus NFe sends webhook when:
 * - NFC-e is authorized (can take up to 30s in peak hours)
 * - NFC-e is cancelled
 * - Emission error
 *
 * Flow:
 * 1. Validate webhook authenticity (token in header)
 * 2. Find FiscalDocument by external_ref
 * 3. Update status, access_key, protocol, xml
 * 4. Emit internal event (fiscal.nfce.authorized or fiscal.nfce.failed)
 */
@ApiTags('fiscal-webhooks')
@Controller('fiscal/webhooks')
export class FiscalWebhookController {
  private readonly logger = new Logger(FiscalWebhookController.name);

  constructor(
    @InjectRepository(FiscalDocument)
    private readonly fiscalDocRepo: Repository<FiscalDocument>,

    private readonly fiscalEvents: FiscalEventService,
  ) {}

  @Post('focus-nfe')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook endpoint for Focus NFe callbacks' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  async handleFocusNfeWebhook(
    @Body() body: any,
    @Headers() headers: any,
  ) {
    this.logger.log(
      `[Focus NFe Webhook] Received callback: ${JSON.stringify(body).substring(0, 500)}`,
    );

    // 1. Validate webhook token
    // [PLACEHOLDER] In production, validate: headers['x-webhook-token'] === expected
    const webhookToken = headers['x-webhook-token'] || headers['authorization'];
    this.logger.debug(`[Focus NFe Webhook] Token: ${webhookToken ? 'present' : 'missing'}`);

    // 2. Extract data from Focus NFe callback
    const ref = body.ref || body.external_ref;
    const status = body.status; // 'autorizado', 'cancelado', 'erro_autorizacao'
    const accessKey = body.chave_nfe || body.access_key;
    const protocol = body.protocolo || body.protocol;
    const xml = body.xml;
    const qrCodeUrl = body.url_qrcode || body.qr_code_url;
    const danfeUrl = body.url_danfe || body.danfe_url;
    const errorMessage = body.mensagem_sefaz || body.error_message;

    if (!ref) {
      this.logger.warn('[Focus NFe Webhook] Missing ref in webhook payload');
      return { received: true, processed: false, reason: 'missing_ref' };
    }

    // 3. Find FiscalDocument by external_ref
    const doc = await this.fiscalDocRepo.findOne({
      where: { external_ref: ref },
    });

    if (!doc) {
      this.logger.warn(`[Focus NFe Webhook] Document not found for ref: ${ref}`);
      return { received: true, processed: false, reason: 'document_not_found' };
    }

    // 4. Update document based on status
    switch (status) {
      case 'autorizado':
      case 'authorized':
        doc.status = 'authorized';
        doc.access_key = accessKey || doc.access_key;
        doc.protocol = protocol || doc.protocol;
        doc.xml = xml || doc.xml;
        doc.qr_code_url = qrCodeUrl || doc.qr_code_url;
        doc.danfe_url = danfeUrl || doc.danfe_url;
        break;

      case 'cancelado':
      case 'cancelled':
        doc.status = 'cancelled';
        doc.protocol = protocol || doc.protocol;
        break;

      case 'erro_autorizacao':
      case 'denied':
        doc.status = 'denied';
        doc.error_message = errorMessage;
        break;

      default:
        this.logger.warn(`[Focus NFe Webhook] Unknown status: ${status}`);
        doc.error_message = `Unknown webhook status: ${status}`;
        break;
    }

    await this.fiscalDocRepo.save(doc);

    // 5. Emit internal event
    if (doc.status === 'authorized') {
      this.fiscalEvents.emit('fiscal.nfce.authorized', {
        documentId: doc.id,
        orderId: doc.order_id,
        accessKey: doc.access_key,
        restaurantId: doc.restaurant_id,
      });
    } else if (doc.status === 'denied' || doc.status === 'failed') {
      this.fiscalEvents.emit('fiscal.nfce.failed', {
        documentId: doc.id,
        orderId: doc.order_id,
        errorMessage: doc.error_message,
        restaurantId: doc.restaurant_id,
      });
    }

    this.logger.log(
      `[Focus NFe Webhook] Processed | Ref: ${ref} | Status: ${doc.status}`,
    );

    return { received: true, processed: true, status: doc.status };
  }
}

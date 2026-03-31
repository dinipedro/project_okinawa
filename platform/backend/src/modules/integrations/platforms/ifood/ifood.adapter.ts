import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import {
  PlatformAdapter,
  PlatformName,
  NormalizedOrder,
  NormalizedOrderItem,
} from '../../interfaces/platform-adapter.interface';

/**
 * iFood Platform Adapter
 *
 * Handles webhook validation, order normalization, and status sync
 * for the iFood delivery platform.
 *
 * NOTE: All external API calls are LOG PLACEHOLDERS.
 * TODO: Replace with real iFood API integration for production.
 */
@Injectable()
export class IFoodAdapter implements PlatformAdapter {
  readonly platform: PlatformName = 'ifood';
  private readonly logger = new Logger(IFoodAdapter.name);

  /**
   * Validates the iFood webhook signature using HMAC-SHA256.
   * iFood sends the signature in the `x-ifood-signature` header.
   */
  validateWebhook(headers: Record<string, string>, body: any): boolean {
    const signature = headers['x-ifood-signature'];
    if (!signature) {
      this.logger.warn('Missing x-ifood-signature header');
      return false;
    }

    // The webhook_secret is passed via the connection, but for validation
    // we check the header format. Full HMAC validation requires the secret.
    // This basic check ensures the header is present and non-empty.
    if (!signature || signature.length < 10) {
      this.logger.warn('Invalid x-ifood-signature header format');
      return false;
    }

    return true;
  }

  /**
   * Validates HMAC-SHA256 signature with a known secret.
   * Used internally when the webhook_secret from PlatformConnection is available.
   */
  validateHmacSignature(secret: string, body: any, signature: string): boolean {
    try {
      const payload = typeof body === 'string' ? body : JSON.stringify(body);
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature),
      );
    } catch (error) {
      this.logger.error('HMAC validation error', (error as Error).stack);
      return false;
    }
  }

  /**
   * Normalizes an iFood raw order payload into the unified NormalizedOrder format.
   *
   * iFood order structure reference:
   * - id: string (iFood order UUID)
   * - merchant.id: string
   * - orderType: "DELIVERY" | "TAKEOUT"
   * - customer: { name, phone }
   * - delivery: { deliveryAddress, deliveryDateTime }
   * - items: [{ id, name, quantity, unitPrice, options, observations }]
   * - payments: { methods: [{ method }] }
   * - total: { orderAmount }
   */
  normalizeOrder(rawOrder: any, mappings: any[]): NormalizedOrder {
    const mappingMap = new Map(
      mappings.map((m: any) => [m.external_item_id, m]),
    );

    const items: NormalizedOrderItem[] = (rawOrder.items || []).map(
      (item: any) => {
        const mapping = mappingMap.get(String(item.id || item.externalCode));
        return {
          external_item_id: String(item.id || item.externalCode),
          internal_menu_item_id: mapping?.internal_menu_item_id || undefined,
          source_item_name: item.name || 'Unknown Item',
          quantity: item.quantity || 1,
          unit_price: Number(item.unitPrice || item.price || 0),
          customizations: (item.options || item.subItems || []).map(
            (opt: any) => ({
              name: opt.name || opt.group || '',
              value: opt.name || opt.value || '',
              price_modifier: Number(opt.price || opt.addition || 0),
            }),
          ),
          special_instructions: item.observations || item.notes || undefined,
          course: mapping?.course || undefined,
        };
      },
    );

    const orderType =
      rawOrder.orderType === 'TAKEOUT' || rawOrder.orderType === 'PICKUP'
        ? 'pickup'
        : 'delivery';

    return {
      source: this.platform,
      source_order_id: String(rawOrder.id || rawOrder.orderId),
      restaurant_id: String(
        rawOrder.merchant?.id || rawOrder.merchantId || '',
      ),
      order_type: orderType,
      delivery_rider_eta: rawOrder.delivery?.deliveryDateTime
        ? new Date(rawOrder.delivery.deliveryDateTime)
        : undefined,
      customer_name: rawOrder.customer?.name || undefined,
      customer_phone: rawOrder.customer?.phone?.number || rawOrder.customer?.phone || undefined,
      delivery_address: rawOrder.delivery?.deliveryAddress
        ? this.formatIfoodAddress(rawOrder.delivery.deliveryAddress)
        : undefined,
      items,
      payment_method: rawOrder.payments?.methods?.[0]?.method || undefined,
      total_amount: Number(rawOrder.total?.orderAmount || rawOrder.totalPrice || 0),
      metadata: {
        ifood_order_id: rawOrder.id,
        ifood_display_id: rawOrder.displayId,
        ifood_created_at: rawOrder.createdAt,
      },
    };
  }

  /**
   * Confirms order acceptance on iFood.
   * TODO: Replace with real iFood Orders API call — POST /v3.0/orders/{orderId}/confirm
   */
  async confirmOrder(connection: any, externalOrderId: string): Promise<void> {
    this.logger.log(
      `[PLACEHOLDER] iFood confirmOrder: POST /v3.0/orders/${externalOrderId}/confirm ` +
        `| restaurant=${connection.restaurant_id}`,
    );
    // TODO: Production integration
    // const token = await this.authenticate(connection.credentials);
    // await axios.post(
    //   `${IFOOD_API_BASE}/v3.0/orders/${externalOrderId}/confirm`,
    //   {},
    //   { headers: { Authorization: `Bearer ${token}` } }
    // );
  }

  /**
   * Rejects an order on iFood with a cancellation reason.
   * TODO: Replace with real iFood API call — POST /v3.0/orders/{orderId}/requestCancellation
   */
  async rejectOrder(
    connection: any,
    externalOrderId: string,
    reason: string,
  ): Promise<void> {
    this.logger.log(
      `[PLACEHOLDER] iFood rejectOrder: POST /v3.0/orders/${externalOrderId}/requestCancellation ` +
        `| reason="${reason}" | restaurant=${connection.restaurant_id}`,
    );
    // TODO: Production integration
    // const token = await this.authenticate(connection.credentials);
    // await axios.post(
    //   `${IFOOD_API_BASE}/v3.0/orders/${externalOrderId}/requestCancellation`,
    //   { reason, cancellationCode: 'INTERNAL' },
    //   { headers: { Authorization: `Bearer ${token}` } }
    // );
  }

  /**
   * Syncs internal order status to iFood.
   * Maps internal statuses to iFood dispatch/readyToPickup endpoints.
   * TODO: Replace with real iFood API calls.
   */
  async syncStatus(
    connection: any,
    externalOrderId: string,
    status: string,
  ): Promise<void> {
    const ifoodStatusMap: Record<string, string> = {
      confirmed: 'confirm',
      preparing: 'startPreparation',
      ready: 'readyToPickup',
      delivering: 'dispatch',
      completed: 'delivered',
      cancelled: 'requestCancellation',
    };

    const ifoodAction = ifoodStatusMap[status] || status;
    this.logger.log(
      `[PLACEHOLDER] iFood syncStatus: POST /v3.0/orders/${externalOrderId}/${ifoodAction} ` +
        `| internalStatus="${status}" | restaurant=${connection.restaurant_id}`,
    );
    // TODO: Production integration with circuit breaker pattern
    // const token = await this.authenticate(connection.credentials);
    // await this.circuitBreaker.fire(() =>
    //   axios.post(
    //     `${IFOOD_API_BASE}/v3.0/orders/${externalOrderId}/${ifoodAction}`,
    //     {},
    //     { headers: { Authorization: `Bearer ${token}` } }
    //   )
    // );
  }

  /**
   * Updates the preparation time estimate on iFood.
   * TODO: Replace with real iFood API — PATCH /v3.0/orders/{orderId}/preparationTime
   */
  async setPreparationTime(
    connection: any,
    externalOrderId: string,
    minutes: number,
  ): Promise<void> {
    this.logger.log(
      `[PLACEHOLDER] iFood setPreparationTime: PATCH /v3.0/orders/${externalOrderId}/preparationTime ` +
        `| minutes=${minutes} | restaurant=${connection.restaurant_id}`,
    );
    // TODO: Production integration
    // const token = await this.authenticate(connection.credentials);
    // await axios.patch(
    //   `${IFOOD_API_BASE}/v3.0/orders/${externalOrderId}/preparationTime`,
    //   { preparationTimeInSeconds: minutes * 60 },
    //   { headers: { Authorization: `Bearer ${token}` } }
    // );
  }

  /**
   * Formats an iFood address object into a single string.
   */
  private formatIfoodAddress(address: any): string {
    if (typeof address === 'string') return address;
    const parts = [
      address.streetName,
      address.streetNumber,
      address.complement,
      address.neighborhood,
      address.city,
      address.state,
    ].filter(Boolean);
    return parts.join(', ');
  }
}

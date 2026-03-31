import { Injectable, Logger } from '@nestjs/common';
import {
  PlatformAdapter,
  PlatformName,
  NormalizedOrder,
  NormalizedOrderItem,
} from '../../interfaces/platform-adapter.interface';

/**
 * UberEats Platform Adapter
 *
 * Handles webhook validation, order normalization, and status sync
 * for the Uber Eats delivery platform.
 *
 * NOTE: All external API calls are LOG PLACEHOLDERS.
 * TODO: Replace with real UberEats API integration for production.
 */
@Injectable()
export class UberEatsAdapter implements PlatformAdapter {
  readonly platform: PlatformName = 'ubereats';
  private readonly logger = new Logger(UberEatsAdapter.name);

  /**
   * Validates the UberEats webhook signature.
   * UberEats uses an HMAC-SHA256 signature in the `x-uber-signature` header.
   */
  validateWebhook(headers: Record<string, string>, body: any): boolean {
    const signature =
      headers['x-uber-signature'] || headers['X-Uber-Signature'];
    if (!signature) {
      this.logger.warn('Missing x-uber-signature header');
      return false;
    }

    if (!signature || signature.length < 10) {
      this.logger.warn('Invalid x-uber-signature header format');
      return false;
    }

    return true;
  }

  /**
   * Normalizes an UberEats raw order payload into the unified NormalizedOrder format.
   *
   * UberEats order structure reference:
   * - id: string (UberEats order UUID)
   * - store.id: string
   * - type: "DELIVERY" | "PICKUP"
   * - eater: { first_name, last_name, phone }
   * - deliveries: [{ eta, location: { address } }]
   * - cart: { items: [{ id, title, quantity, price, selected_modifier_groups, special_instructions }] }
   * - payment: { charges: { total } }
   */
  normalizeOrder(rawOrder: any, mappings: any[]): NormalizedOrder {
    const mappingMap = new Map(
      mappings.map((m: any) => [m.external_item_id, m]),
    );

    const cartItems = rawOrder.cart?.items || rawOrder.items || [];
    const items: NormalizedOrderItem[] = cartItems.map((item: any) => {
      const externalId = String(item.id || item.external_data);
      const mapping = mappingMap.get(externalId);

      // UberEats modifiers are grouped
      const customizations: Array<{
        name: string;
        value: string;
        price_modifier: number;
      }> = [];

      const modifierGroups =
        item.selected_modifier_groups || item.modifierGroups || [];
      for (const group of modifierGroups) {
        const groupName = group.title || group.name || '';
        for (const modifier of group.selected_items ||
          group.modifiers ||
          []) {
          customizations.push({
            name: groupName,
            value: modifier.title || modifier.name || '',
            price_modifier: Number(modifier.price?.amount || modifier.price || 0),
          });
        }
      }

      return {
        external_item_id: externalId,
        internal_menu_item_id: mapping?.internal_menu_item_id || undefined,
        source_item_name: item.title || item.name || 'Unknown Item',
        quantity: item.quantity || 1,
        unit_price: Number(item.price?.amount || item.price || 0),
        customizations,
        special_instructions:
          item.special_instructions || item.specialInstructions || undefined,
        course: mapping?.course || undefined,
      };
    });

    const orderType =
      rawOrder.type === 'PICK_UP' || rawOrder.type === 'PICKUP'
        ? 'pickup'
        : 'delivery';

    const delivery = rawOrder.deliveries?.[0] || rawOrder.delivery;
    const eaterName = rawOrder.eater
      ? [rawOrder.eater.first_name, rawOrder.eater.last_name]
          .filter(Boolean)
          .join(' ')
      : undefined;

    return {
      source: this.platform,
      source_order_id: String(rawOrder.id || rawOrder.order_id),
      restaurant_id: String(
        rawOrder.store?.id || rawOrder.storeId || rawOrder.restaurant_id || '',
      ),
      order_type: orderType,
      delivery_rider_eta: delivery?.eta
        ? new Date(delivery.eta)
        : undefined,
      customer_name: eaterName,
      customer_phone: rawOrder.eater?.phone || undefined,
      delivery_address:
        delivery?.location?.address ||
        delivery?.address ||
        undefined,
      items,
      payment_method: rawOrder.payment?.payment_type || undefined,
      total_amount: Number(
        rawOrder.payment?.charges?.total?.amount ||
          rawOrder.total ||
          0,
      ),
      metadata: {
        ubereats_order_id: rawOrder.id,
        ubereats_display_id: rawOrder.display_id,
        ubereats_created_at: rawOrder.placed_at || rawOrder.created_at,
      },
    };
  }

  /**
   * Confirms order acceptance on UberEats.
   * TODO: Replace with real UberEats API — POST /v1/eats/orders/{orderId}/accept_pos_order
   */
  async confirmOrder(connection: any, externalOrderId: string): Promise<void> {
    this.logger.log(
      `[PLACEHOLDER] UberEats confirmOrder: POST /v1/eats/orders/${externalOrderId}/accept_pos_order ` +
        `| restaurant=${connection.restaurant_id}`,
    );
    // TODO: Production integration
    // const token = await this.getOAuthToken(connection.credentials);
    // await axios.post(
    //   `${UBEREATS_API_BASE}/v1/eats/orders/${externalOrderId}/accept_pos_order`,
    //   { reason: 'ACCEPTED' },
    //   { headers: { Authorization: `Bearer ${token}` } }
    // );
  }

  /**
   * Rejects an order on UberEats with a cancellation reason.
   * TODO: Replace with real UberEats API — POST /v1/eats/orders/{orderId}/deny_pos_order
   */
  async rejectOrder(
    connection: any,
    externalOrderId: string,
    reason: string,
  ): Promise<void> {
    this.logger.log(
      `[PLACEHOLDER] UberEats rejectOrder: POST /v1/eats/orders/${externalOrderId}/deny_pos_order ` +
        `| reason="${reason}" | restaurant=${connection.restaurant_id}`,
    );
    // TODO: Production integration
    // const token = await this.getOAuthToken(connection.credentials);
    // await axios.post(
    //   `${UBEREATS_API_BASE}/v1/eats/orders/${externalOrderId}/deny_pos_order`,
    //   { reason: { explanation: reason, code: 'STORE_BUSY' } },
    //   { headers: { Authorization: `Bearer ${token}` } }
    // );
  }

  /**
   * Syncs internal order status to UberEats.
   * Maps internal statuses to UberEats status API endpoints.
   * TODO: Replace with real UberEats API calls.
   */
  async syncStatus(
    connection: any,
    externalOrderId: string,
    status: string,
  ): Promise<void> {
    const uberEatsStatusMap: Record<string, string> = {
      confirmed: 'accept_pos_order',
      preparing: 'accept_pos_order',
      ready: 'ready_for_pickup',
      cancelled: 'deny_pos_order',
    };

    const uberAction = uberEatsStatusMap[status] || status;
    this.logger.log(
      `[PLACEHOLDER] UberEats syncStatus: POST /v1/eats/orders/${externalOrderId}/${uberAction} ` +
        `| internalStatus="${status}" | restaurant=${connection.restaurant_id}`,
    );
    // TODO: Production integration with circuit breaker pattern
    // const token = await this.getOAuthToken(connection.credentials);
    // await this.circuitBreaker.fire(() =>
    //   axios.post(
    //     `${UBEREATS_API_BASE}/v1/eats/orders/${externalOrderId}/${uberAction}`,
    //     {},
    //     { headers: { Authorization: `Bearer ${token}` } }
    //   )
    // );
  }

  /**
   * Updates the preparation time estimate on UberEats.
   * TODO: Replace with real UberEats API
   */
  async setPreparationTime(
    connection: any,
    externalOrderId: string,
    minutes: number,
  ): Promise<void> {
    this.logger.log(
      `[PLACEHOLDER] UberEats setPreparationTime: PATCH /v1/eats/orders/${externalOrderId} ` +
        `| minutes=${minutes} | restaurant=${connection.restaurant_id}`,
    );
    // TODO: Production integration
    // const token = await this.getOAuthToken(connection.credentials);
    // await axios.patch(
    //   `${UBEREATS_API_BASE}/v1/eats/orders/${externalOrderId}`,
    //   { estimated_ready_for_pickup_at: new Date(Date.now() + minutes * 60000).toISOString() },
    //   { headers: { Authorization: `Bearer ${token}` } }
    // );
  }
}

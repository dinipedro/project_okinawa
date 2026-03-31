import { Injectable, Logger } from '@nestjs/common';
import {
  PlatformAdapter,
  PlatformName,
  NormalizedOrder,
  NormalizedOrderItem,
} from '../../interfaces/platform-adapter.interface';

/**
 * Rappi Platform Adapter
 *
 * Handles webhook validation, order normalization, and status sync
 * for the Rappi delivery platform.
 *
 * NOTE: All external API calls are LOG PLACEHOLDERS.
 * TODO: Replace with real Rappi API integration for production.
 */
@Injectable()
export class RappiAdapter implements PlatformAdapter {
  readonly platform: PlatformName = 'rappi';
  private readonly logger = new Logger(RappiAdapter.name);

  /**
   * Validates the Rappi webhook using the Authorization bearer token.
   * Rappi typically sends a bearer token or API key in the Authorization header.
   */
  validateWebhook(headers: Record<string, string>, body: any): boolean {
    const authorization =
      headers['authorization'] || headers['Authorization'];
    if (!authorization) {
      this.logger.warn('Missing Authorization header for Rappi webhook');
      return false;
    }

    // Rappi uses a pre-shared token in the Authorization header
    if (!authorization.startsWith('Bearer ') && !authorization.startsWith('Token ')) {
      this.logger.warn('Invalid Authorization header format for Rappi webhook');
      return false;
    }

    return true;
  }

  /**
   * Normalizes a Rappi raw order payload into the unified NormalizedOrder format.
   *
   * Rappi order structure reference:
   * - order_id: string
   * - store_id: string
   * - order_type: "delivery" | "pickup"
   * - client: { first_name, last_name, phone }
   * - delivery_information: { address, estimated_arrival }
   * - products: [{ id, name, quantity, price, toppings, comments }]
   * - payment: { method }
   * - total_value: number
   */
  normalizeOrder(rawOrder: any, mappings: any[]): NormalizedOrder {
    const mappingMap = new Map(
      mappings.map((m: any) => [m.external_item_id, m]),
    );

    const items: NormalizedOrderItem[] = (
      rawOrder.products || rawOrder.items || []
    ).map((item: any) => {
      const externalId = String(item.id || item.sku);
      const mapping = mappingMap.get(externalId);
      return {
        external_item_id: externalId,
        internal_menu_item_id: mapping?.internal_menu_item_id || undefined,
        source_item_name: item.name || item.description || 'Unknown Item',
        quantity: item.quantity || item.units || 1,
        unit_price: Number(item.price || item.unit_price || 0),
        customizations: (item.toppings || item.modifiers || []).map(
          (topping: any) => ({
            name: topping.category_name || topping.name || '',
            value: topping.name || topping.description || '',
            price_modifier: Number(topping.price || 0),
          }),
        ),
        special_instructions: item.comments || item.instructions || undefined,
        course: mapping?.course || undefined,
      };
    });

    const orderType =
      rawOrder.order_type === 'pickup' || rawOrder.order_type === 'PICKUP'
        ? 'pickup'
        : 'delivery';

    const customerName = rawOrder.client
      ? [rawOrder.client.first_name, rawOrder.client.last_name]
          .filter(Boolean)
          .join(' ')
      : undefined;

    return {
      source: this.platform,
      source_order_id: String(rawOrder.order_id || rawOrder.id),
      restaurant_id: String(rawOrder.store_id || rawOrder.storeId || ''),
      order_type: orderType,
      delivery_rider_eta: rawOrder.delivery_information?.estimated_arrival
        ? new Date(rawOrder.delivery_information.estimated_arrival)
        : undefined,
      customer_name: customerName,
      customer_phone: rawOrder.client?.phone || undefined,
      delivery_address:
        rawOrder.delivery_information?.address ||
        rawOrder.delivery_address ||
        undefined,
      items,
      payment_method: rawOrder.payment?.method || undefined,
      total_amount: Number(rawOrder.total_value || rawOrder.total || 0),
      metadata: {
        rappi_order_id: rawOrder.order_id || rawOrder.id,
        rappi_store_id: rawOrder.store_id,
        rappi_created_at: rawOrder.created_at,
      },
    };
  }

  /**
   * Confirms order acceptance on Rappi.
   * TODO: Replace with real Rappi API call — POST /api/v1/orders/{orderId}/take
   */
  async confirmOrder(connection: any, externalOrderId: string): Promise<void> {
    this.logger.log(
      `[PLACEHOLDER] Rappi confirmOrder: POST /api/v1/orders/${externalOrderId}/take ` +
        `| restaurant=${connection.restaurant_id}`,
    );
    // TODO: Production integration
    // await axios.post(
    //   `${RAPPI_API_BASE}/api/v1/orders/${externalOrderId}/take`,
    //   {},
    //   { headers: { Authorization: `Bearer ${connection.credentials.api_token}` } }
    // );
  }

  /**
   * Rejects an order on Rappi with a reason.
   * TODO: Replace with real Rappi API call — POST /api/v1/orders/{orderId}/reject
   */
  async rejectOrder(
    connection: any,
    externalOrderId: string,
    reason: string,
  ): Promise<void> {
    this.logger.log(
      `[PLACEHOLDER] Rappi rejectOrder: POST /api/v1/orders/${externalOrderId}/reject ` +
        `| reason="${reason}" | restaurant=${connection.restaurant_id}`,
    );
    // TODO: Production integration
    // await axios.post(
    //   `${RAPPI_API_BASE}/api/v1/orders/${externalOrderId}/reject`,
    //   { reason },
    //   { headers: { Authorization: `Bearer ${connection.credentials.api_token}` } }
    // );
  }

  /**
   * Syncs internal order status to Rappi.
   * Maps internal statuses to Rappi-specific status endpoints.
   * TODO: Replace with real Rappi API calls.
   */
  async syncStatus(
    connection: any,
    externalOrderId: string,
    status: string,
  ): Promise<void> {
    const rappiStatusMap: Record<string, string> = {
      confirmed: 'take',
      preparing: 'cooking',
      ready: 'ready_for_pickup',
      delivering: 'on_the_way',
      completed: 'delivered',
      cancelled: 'reject',
    };

    const rappiAction = rappiStatusMap[status] || status;
    this.logger.log(
      `[PLACEHOLDER] Rappi syncStatus: POST /api/v1/orders/${externalOrderId}/${rappiAction} ` +
        `| internalStatus="${status}" | restaurant=${connection.restaurant_id}`,
    );
    // TODO: Production integration with circuit breaker pattern
    // await this.circuitBreaker.fire(() =>
    //   axios.post(
    //     `${RAPPI_API_BASE}/api/v1/orders/${externalOrderId}/${rappiAction}`,
    //     {},
    //     { headers: { Authorization: `Bearer ${connection.credentials.api_token}` } }
    //   )
    // );
  }

  /**
   * Updates the preparation time estimate on Rappi.
   * TODO: Replace with real Rappi API — PUT /api/v1/orders/{orderId}/cooking_time
   */
  async setPreparationTime(
    connection: any,
    externalOrderId: string,
    minutes: number,
  ): Promise<void> {
    this.logger.log(
      `[PLACEHOLDER] Rappi setPreparationTime: PUT /api/v1/orders/${externalOrderId}/cooking_time ` +
        `| minutes=${minutes} | restaurant=${connection.restaurant_id}`,
    );
    // TODO: Production integration
    // await axios.put(
    //   `${RAPPI_API_BASE}/api/v1/orders/${externalOrderId}/cooking_time`,
    //   { cooking_time: minutes },
    //   { headers: { Authorization: `Bearer ${connection.credentials.api_token}` } }
    // );
  }
}

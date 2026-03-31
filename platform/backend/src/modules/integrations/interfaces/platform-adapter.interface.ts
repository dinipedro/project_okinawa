/**
 * Platform Adapter Interface
 *
 * Defines the contract for third-party delivery platform integrations
 * (iFood, Rappi, UberEats, etc.). Each adapter normalizes platform-specific
 * webhook payloads into a unified NormalizedOrder format.
 */

export type PlatformName = 'ifood' | 'rappi' | 'ubereats';

export interface PlatformAdapter {
  readonly platform: PlatformName;

  /**
   * Validates the webhook signature from the platform.
   * Each platform uses a different signing mechanism (HMAC, token, etc.).
   */
  validateWebhook(headers: Record<string, string>, body: any): boolean;

  /**
   * Normalizes a raw platform order into the unified NormalizedOrder format.
   * Uses ExternalMenuMapping entries to resolve internal menu item IDs.
   */
  normalizeOrder(rawOrder: any, mappings: any[]): NormalizedOrder;

  /**
   * Confirms acceptance of an order on the platform.
   */
  confirmOrder(connection: any, externalOrderId: string): Promise<void>;

  /**
   * Rejects an order on the platform with a reason.
   */
  rejectOrder(connection: any, externalOrderId: string, reason: string): Promise<void>;

  /**
   * Syncs internal order status back to the platform.
   */
  syncStatus(connection: any, externalOrderId: string, status: string): Promise<void>;

  /**
   * Updates the preparation time estimate on the platform.
   */
  setPreparationTime(connection: any, externalOrderId: string, minutes: number): Promise<void>;
}

export interface NormalizedOrder {
  source: PlatformName;
  source_order_id: string;
  restaurant_id: string;
  order_type: 'delivery' | 'pickup';
  delivery_rider_eta?: Date;
  customer_name?: string;
  customer_phone?: string;
  delivery_address?: string;
  items: NormalizedOrderItem[];
  payment_method?: string;
  total_amount?: number;
  metadata?: Record<string, any>;
}

export interface NormalizedOrderItem {
  external_item_id: string;
  internal_menu_item_id?: string;
  source_item_name: string;
  quantity: number;
  unit_price: number;
  customizations: Array<{ name: string; value: string; price_modifier: number }>;
  special_instructions?: string;
  course?: string;
}

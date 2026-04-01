/**
 * OrderCard — Restaurant App
 *
 * Re-exports the canonical shared OrderCard to eliminate duplication.
 * The shared version supports restaurant-specific props (onStatusChange,
 * showActions, compact) so no local extension is needed.
 */

// Re-export shared OrderCard for backward compatibility
export { OrderCard } from '@okinawa/shared/components/orders/OrderCard';
export { default } from '@okinawa/shared/components/orders/OrderCard';
export type {
  OrderCardProps,
  OrderCardOrder,
  OrderCardItem,
  OrderStatus,
} from '@okinawa/shared/components/orders/OrderCard';

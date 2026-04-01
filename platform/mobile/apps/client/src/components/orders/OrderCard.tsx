/**
 * OrderCard — Client Components
 *
 * Re-exports the canonical shared OrderCard to eliminate duplication.
 * All props and types are forwarded from the shared component.
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

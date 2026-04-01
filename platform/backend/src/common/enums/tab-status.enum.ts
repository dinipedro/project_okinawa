/**
 * Tab status for Pub & Bar digital tabs
 */
export enum TabStatus {
  OPEN = 'open',
  PENDING_PAYMENT = 'pending_payment',
  REQUESTED_CLOSE = 'requested_close',
  CLOSED = 'closed',
}

/**
 * Tab type - individual or group
 */
export enum TabType {
  INDIVIDUAL = 'individual',
  GROUP = 'group',
}

/**
 * Tab member role
 */
export enum TabMemberRole {
  HOST = 'host',
  MEMBER = 'member',
}

/**
 * Tab member status
 */
export enum TabMemberStatus {
  ACTIVE = 'active',
  LEFT = 'left',
  REMOVED = 'removed',
}

/**
 * Tab item status - tracks order lifecycle
 */
export enum TabItemStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

/**
 * Tab payment status
 */
export enum TabPaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

/**
 * Waiter call status
 */
export enum WaiterCallStatus {
  PENDING = 'pending',
  ACKNOWLEDGED = 'acknowledged',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

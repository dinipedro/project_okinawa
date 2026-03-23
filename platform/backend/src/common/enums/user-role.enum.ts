/**
 * User roles for role-based access control (RBAC)
 *
 * @description Defines the hierarchy of roles in the restaurant system.
 * Each role has specific permissions defined in USER_ROLE_PERMISSIONS.
 *
 * Hierarchy (highest to lowest):
 * 1. OWNER - Full control over restaurant
 * 2. MANAGER - Management capabilities without ownership
 * 3. MAITRE - Table and reservation management
 * 4. CHEF - Kitchen and menu management
 * 5. WAITER - Order taking and table service
 * 6. BARMAN - Beverage preparation and order status
 * 7. CUSTOMER - End user placing orders and reservations
 */
export enum UserRole {
  /** Restaurant customer - can browse, order, and make reservations */
  CUSTOMER = 'customer',
  /** Restaurant owner - full administrative access */
  OWNER = 'owner',
  /** Restaurant manager - manages staff and operations */
  MANAGER = 'manager',
  /** Kitchen chef - manages menu and prepares food orders */
  CHEF = 'chef',
  /** Waiter/server - handles table service and orders */
  WAITER = 'waiter',
  /** Bartender - handles beverage orders */
  BARMAN = 'barman',
  /** Maitre d'hotel - manages reservations and seating */
  MAITRE = 'maitre',
}

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.CUSTOMER]: 'Cliente',
  [UserRole.OWNER]: 'Proprietário',
  [UserRole.MANAGER]: 'Gerente',
  [UserRole.CHEF]: 'Chef',
  [UserRole.WAITER]: 'Garçom',
  [UserRole.BARMAN]: 'Barman',
  [UserRole.MAITRE]: 'Maître',
};

export const USER_ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.CUSTOMER]: [
    'view_restaurants',
    'create_order',
    'view_own_orders',
    'create_reservation',
    'view_own_reservations',
    'manage_wallet',
    'view_own_reviews',
    'create_review',
  ],
  [UserRole.OWNER]: [
    'manage_restaurant',
    'manage_staff',
    'view_analytics',
    'manage_menu',
    'manage_orders',
    'manage_reservations',
    'manage_payments',
    'manage_tips',
  ],
  [UserRole.MANAGER]: [
    'manage_staff',
    'view_analytics',
    'manage_menu',
    'manage_orders',
    'manage_reservations',
    'manage_tips',
  ],
  [UserRole.CHEF]: ['view_orders', 'update_order_status', 'manage_menu'],
  [UserRole.WAITER]: ['view_orders', 'create_order', 'update_order_status', 'view_tables'],
  [UserRole.BARMAN]: ['view_orders', 'update_order_status'],
  [UserRole.MAITRE]: ['manage_reservations', 'manage_tables', 'view_orders'],
};

// Re-export all types from client (they're shared)
export * from '../../../client/src/types';

// Restaurant-specific additional types
export interface DashboardStats {
  today_orders: number;
  today_revenue: number;
  active_orders: number;
  pending_reservations: number;
  tables_occupied: number;
  tables_total: number;
  avg_preparation_time: number;
  customer_satisfaction: number;
}

export interface RevenueData {
  date: string;
  amount: number;
}

export interface OrdersByStatus {
  status: string;
  count: number;
}

export interface PopularItem {
  id: string;
  name: string;
  quantity_sold: number;
  revenue: number;
}

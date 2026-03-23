import { Injectable } from '@nestjs/common';
import { Order } from '../entities/order.entity';
import { RestaurantTable } from '@/modules/tables/entities/restaurant-table.entity';
import { OrderStatus } from '@common/enums';

export interface WaiterTable {
  id: string;
  number: string;
  status: string;
  guests: number;
  waiter_id: string;
  order_id: string;
  order_total: number;
  seated_at: Date;
}

export interface WaiterStatistics {
  tables_assigned: number;
  active_orders: number;
  today_tips: number;
  today_sales: number;
}

@Injectable()
export class WaiterStatsHelper {
  /**
   * Group orders by table
   */
  groupOrdersByTable(orders: Order[], waiterId: string): WaiterTable[] {
    const tableMap = new Map<string, WaiterTable>();

    for (const order of orders) {
      if (!order.table) continue;

      const tableId = order.table.id;
      if (!tableMap.has(tableId)) {
        const guestCount =
          order.guests?.length || order.party_size || order.table.seats;

        tableMap.set(tableId, {
          id: tableId,
          number: order.table.table_number,
          status: 'occupied',
          guests: guestCount,
          waiter_id: waiterId,
          order_id: order.id,
          order_total: Number(order.total_amount),
          seated_at: order.created_at,
        });
      }
    }

    return Array.from(tableMap.values());
  }

  /**
   * Calculate waiter statistics from orders
   */
  calculateStatistics(
    orders: Order[],
    tablesAssigned: number,
  ): WaiterStatistics {
    const activeOrders = orders.filter((o) =>
      [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PREPARING].includes(
        o.status,
      ),
    );

    const completedOrders = orders.filter(
      (o) => o.status === OrderStatus.COMPLETED,
    );

    const todaySales = completedOrders.reduce(
      (sum, order) => sum + Number(order.total_amount),
      0,
    );

    const todayTips = completedOrders.reduce(
      (sum, order) => sum + Number(order.tip_amount || 0),
      0,
    );

    return {
      tables_assigned: tablesAssigned,
      active_orders: activeOrders.length,
      today_tips: todayTips,
      today_sales: todaySales,
    };
  }

  /**
   * Get active order statuses for waiter queries
   */
  getActiveStatuses(): OrderStatus[] {
    return [
      OrderStatus.PENDING,
      OrderStatus.CONFIRMED,
      OrderStatus.PREPARING,
      OrderStatus.READY,
    ];
  }

  /**
   * Parse date range for statistics
   */
  parseDateRange(startDateStr?: string, endDateStr?: string): { startDate: Date; endDate: Date } {
    const startDate = startDateStr
      ? new Date(startDateStr)
      : new Date(new Date().setHours(0, 0, 0, 0));

    const endDate = endDateStr
      ? new Date(endDateStr)
      : new Date(new Date().setHours(23, 59, 59, 999));

    return { startDate, endDate };
  }
}

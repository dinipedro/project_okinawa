import { Injectable } from '@nestjs/common';
import { Order } from '@/modules/orders/entities/order.entity';

export interface ItemSalesData {
  quantity: number;
  revenue: number;
  name: string;
}

export interface DailySalesData {
  revenue: number;
  orders: number;
}

export interface HourlySalesData {
  revenue: number;
  orders: number;
}

@Injectable()
export class SalesAggregatorHelper {
  /**
   * Aggregate item sales from orders
   */
  aggregateItemSales(orders: Order[]): Record<string, ItemSalesData> {
    const itemSales: Record<string, ItemSalesData> = {};

    orders.forEach((order) => {
      order.items?.forEach((item) => {
        if (!itemSales[item.menu_item_id]) {
          itemSales[item.menu_item_id] = {
            quantity: 0,
            revenue: 0,
            name: `Item ${item.menu_item_id.substring(0, 8)}`,
          };
        }
        itemSales[item.menu_item_id].quantity += item.quantity;
        itemSales[item.menu_item_id].revenue += item.quantity * Number(item.unit_price);
      });
    });

    return itemSales;
  }

  /**
   * Get top selling items
   */
  getTopSellingItems(
    itemSales: Record<string, ItemSalesData>,
    limit: number = 10,
  ): Array<{ item_name: string; quantity_sold: number; revenue: number }> {
    return Object.values(itemSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit)
      .map((item) => ({
        item_name: item.name,
        quantity_sold: item.quantity,
        revenue: item.revenue,
      }));
  }

  /**
   * Aggregate sales by day
   */
  aggregateSalesByDay(orders: Order[]): Record<string, DailySalesData> {
    const salesByDay: Record<string, DailySalesData> = {};

    orders.forEach((order) => {
      const date = order.created_at.toISOString().split('T')[0];
      if (!salesByDay[date]) {
        salesByDay[date] = { revenue: 0, orders: 0 };
      }
      salesByDay[date].revenue += Number(order.total_amount);
      salesByDay[date].orders++;
    });

    return salesByDay;
  }

  /**
   * Aggregate sales by hour
   */
  aggregateSalesByHour(orders: Order[]): Record<number, HourlySalesData> {
    const salesByHour: Record<number, HourlySalesData> = {};

    // Initialize all hours
    for (let i = 0; i < 24; i++) {
      salesByHour[i] = { revenue: 0, orders: 0 };
    }

    orders.forEach((order) => {
      const hour = order.created_at.getHours();
      salesByHour[hour].revenue += Number(order.total_amount);
      salesByHour[hour].orders++;
    });

    return salesByHour;
  }

  /**
   * Get peak hours
   */
  getPeakHours(
    salesByHour: Record<number, HourlySalesData>,
    limit: number = 5,
  ): Array<{ hour: number; orders: number }> {
    return Object.entries(salesByHour)
      .map(([hour, data]) => ({ hour: parseInt(hour), orders: data.orders }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, limit);
  }

  /**
   * Calculate total revenue from orders
   */
  calculateTotalRevenue(orders: Order[]): number {
    return orders.reduce((sum, order) => sum + Number(order.total_amount), 0);
  }
}

import { Injectable } from '@nestjs/common';
import { Order } from '../entities/order.entity';
import { OrderCalculatorHelper } from './order-calculator.helper';

export interface KdsOrderItem {
  id: string;
  name: string;
  quantity: number;
  instructions: string | null;
  modifiers: Record<string, any> | null;
}

export interface KdsOrder {
  id: string;
  order_number: string;
  table_number: string;
  items: KdsOrderItem[];
  status: string;
  created_at: Date;
  priority: 'normal' | 'high' | 'urgent';
  waiter_name: string;
}

@Injectable()
export class KdsFormatterHelper {
  constructor(private readonly orderCalculator: OrderCalculatorHelper) {}

  /**
   * Format orders for KDS display
   */
  formatOrdersForKds(
    orders: Order[],
    waiterMap: Map<string, string>,
  ): KdsOrder[] {
    return orders.map((order) => this.formatSingleOrder(order, waiterMap));
  }

  /**
   * Format a single order for KDS
   */
  private formatSingleOrder(
    order: Order,
    waiterMap: Map<string, string>,
  ): KdsOrder {
    return {
      id: order.id,
      order_number: this.orderCalculator.getOrderNumber(order.id),
      table_number: order.table?.table_number || 'N/A',
      items: this.formatItems(order),
      status: order.status,
      created_at: order.created_at,
      priority: this.orderCalculator.calculatePriority(order),
      waiter_name: order.waiter_id
        ? waiterMap.get(order.waiter_id) || 'Staff'
        : 'Self-service',
    };
  }

  /**
   * Format order items for KDS
   */
  private formatItems(order: Order): KdsOrderItem[] {
    return order.items.map((item) => ({
      id: item.id,
      name: item.menu_item?.name || 'Unknown',
      quantity: item.quantity,
      instructions: item.special_instructions,
      modifiers: item.customizations,
    }));
  }

  /**
   * Get bar categories for filtering
   */
  getBarCategories(): string[] {
    return ['drinks', 'beverages', 'cocktails', 'beer', 'wine'];
  }
}

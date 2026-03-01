import { SalesAggregatorHelper } from './sales-aggregator.helper';
import { Order } from '@/modules/orders/entities/order.entity';

describe('SalesAggregatorHelper', () => {
  let helper: SalesAggregatorHelper;

  beforeEach(() => {
    helper = new SalesAggregatorHelper();
  });

  const createMockOrder = (overrides = {}): Order => ({
    id: 'order-1',
    restaurant_id: 'restaurant-1',
    user_id: 'user-1',
    total_amount: 100,
    created_at: new Date('2024-01-15T10:00:00Z'),
    items: [
      {
        id: 'item-1',
        menu_item_id: 'menu-1',
        quantity: 2,
        unit_price: 25,
      } as any,
    ],
    ...overrides,
  } as Order);

  describe('aggregateItemSales', () => {
    it('should aggregate item sales correctly', () => {
      const orders = [
        createMockOrder(),
        createMockOrder({
          id: 'order-2',
          items: [{ id: 'item-2', menu_item_id: 'menu-1', quantity: 3, unit_price: 25 }],
        }),
      ];

      const result = helper.aggregateItemSales(orders);

      expect(result['menu-1'].quantity).toBe(5);
      expect(result['menu-1'].revenue).toBe(125);
    });

    it('should handle empty orders array', () => {
      const result = helper.aggregateItemSales([]);
      expect(Object.keys(result)).toHaveLength(0);
    });

    it('should handle orders without items', () => {
      const orders = [createMockOrder({ items: undefined })];
      const result = helper.aggregateItemSales(orders);
      expect(Object.keys(result)).toHaveLength(0);
    });
  });

  describe('getTopSellingItems', () => {
    it('should return top selling items sorted by revenue', () => {
      const itemSales = {
        'menu-1': { quantity: 10, revenue: 500, name: 'Item 1' },
        'menu-2': { quantity: 5, revenue: 1000, name: 'Item 2' },
        'menu-3': { quantity: 8, revenue: 200, name: 'Item 3' },
      };

      const result = helper.getTopSellingItems(itemSales, 2);

      expect(result).toHaveLength(2);
      expect(result[0].item_name).toBe('Item 2');
      expect(result[0].revenue).toBe(1000);
    });

    it('should respect limit parameter', () => {
      const itemSales = {
        'menu-1': { quantity: 10, revenue: 500, name: 'Item 1' },
        'menu-2': { quantity: 5, revenue: 1000, name: 'Item 2' },
      };

      const result = helper.getTopSellingItems(itemSales, 1);
      expect(result).toHaveLength(1);
    });
  });

  describe('aggregateSalesByDay', () => {
    it('should aggregate sales by day', () => {
      const orders = [
        createMockOrder({ created_at: new Date('2024-01-15T10:00:00Z'), total_amount: 100 }),
        createMockOrder({ created_at: new Date('2024-01-15T15:00:00Z'), total_amount: 150 }),
        createMockOrder({ created_at: new Date('2024-01-16T10:00:00Z'), total_amount: 200 }),
      ];

      const result = helper.aggregateSalesByDay(orders);

      expect(result['2024-01-15'].revenue).toBe(250);
      expect(result['2024-01-15'].orders).toBe(2);
      expect(result['2024-01-16'].revenue).toBe(200);
      expect(result['2024-01-16'].orders).toBe(1);
    });
  });

  describe('aggregateSalesByHour', () => {
    it('should aggregate sales by hour with all hours initialized', () => {
      // Use local time to avoid timezone issues
      const date1 = new Date();
      date1.setHours(10, 0, 0, 0);
      const date2 = new Date();
      date2.setHours(10, 30, 0, 0);

      const orders = [
        createMockOrder({ created_at: date1, total_amount: 100 }),
        createMockOrder({ created_at: date2, total_amount: 150 }),
      ];

      const result = helper.aggregateSalesByHour(orders);

      expect(Object.keys(result)).toHaveLength(24);
      expect(result[10].revenue).toBe(250);
      expect(result[10].orders).toBe(2);
      expect(result[0].revenue).toBe(0);
    });
  });

  describe('getPeakHours', () => {
    it('should return peak hours sorted by orders', () => {
      const salesByHour = {
        10: { revenue: 500, orders: 20 },
        12: { revenue: 800, orders: 30 },
        18: { revenue: 600, orders: 25 },
      } as Record<number, any>;

      const result = helper.getPeakHours(salesByHour, 2);

      expect(result).toHaveLength(2);
      expect(result[0].hour).toBe(12);
      expect(result[0].orders).toBe(30);
    });
  });

  describe('calculateTotalRevenue', () => {
    it('should calculate total revenue', () => {
      const orders = [
        createMockOrder({ total_amount: 100 }),
        createMockOrder({ total_amount: 200 }),
        createMockOrder({ total_amount: 300 }),
      ];

      const result = helper.calculateTotalRevenue(orders);
      expect(result).toBe(600);
    });

    it('should return 0 for empty orders', () => {
      expect(helper.calculateTotalRevenue([])).toBe(0);
    });
  });
});

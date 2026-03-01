import { WaiterStatsHelper } from './waiter-stats.helper';
import { Order } from '../entities/order.entity';
import { OrderStatus } from '@common/enums';

describe('WaiterStatsHelper', () => {
  let helper: WaiterStatsHelper;

  beforeEach(() => {
    helper = new WaiterStatsHelper();
  });

  const createMockOrder = (status: OrderStatus, totalAmount: number, tipAmount = 0): Order =>
    ({
      id: `order-${Math.random()}`,
      status,
      total_amount: totalAmount,
      tip_amount: tipAmount,
      created_at: new Date(),
      table: {
        id: 'table-1',
        table_number: 'T1',
        seats: 4,
      },
      guests: [],
      party_size: 2,
    } as unknown as Order);

  describe('groupOrdersByTable', () => {
    it('should group orders by table', () => {
      const orders = [
        {
          ...createMockOrder(OrderStatus.PENDING, 100),
          table: { id: 'table-1', table_number: 'T1', seats: 4 },
        },
        {
          ...createMockOrder(OrderStatus.PREPARING, 150),
          table: { id: 'table-2', table_number: 'T2', seats: 2 },
        },
      ] as Order[];

      const result = helper.groupOrdersByTable(orders, 'waiter-1');

      expect(result).toHaveLength(2);
      expect(result[0].number).toBe('T1');
      expect(result[1].number).toBe('T2');
    });

    it('should skip orders without tables', () => {
      const orders = [
        { ...createMockOrder(OrderStatus.PENDING, 100), table: undefined },
      ] as unknown as Order[];

      const result = helper.groupOrdersByTable(orders, 'waiter-1');
      expect(result).toHaveLength(0);
    });

    it('should not duplicate tables', () => {
      const orders = [
        {
          ...createMockOrder(OrderStatus.PENDING, 100),
          table: { id: 'table-1', table_number: 'T1', seats: 4 },
        },
        {
          ...createMockOrder(OrderStatus.PREPARING, 150),
          table: { id: 'table-1', table_number: 'T1', seats: 4 },
        },
      ] as Order[];

      const result = helper.groupOrdersByTable(orders, 'waiter-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('calculateStatistics', () => {
    it('should calculate waiter statistics correctly', () => {
      const orders = [
        createMockOrder(OrderStatus.PENDING, 100),
        createMockOrder(OrderStatus.PREPARING, 150),
        createMockOrder(OrderStatus.COMPLETED, 200, 20),
        createMockOrder(OrderStatus.COMPLETED, 300, 30),
      ];

      const result = helper.calculateStatistics(orders, 3);

      expect(result.tables_assigned).toBe(3);
      expect(result.active_orders).toBe(2);
      expect(result.today_sales).toBe(500);
      expect(result.today_tips).toBe(50);
    });

    it('should handle empty orders', () => {
      const result = helper.calculateStatistics([], 0);

      expect(result.tables_assigned).toBe(0);
      expect(result.active_orders).toBe(0);
      expect(result.today_sales).toBe(0);
      expect(result.today_tips).toBe(0);
    });
  });

  describe('getActiveStatuses', () => {
    it('should return active order statuses', () => {
      const result = helper.getActiveStatuses();

      expect(result).toContain(OrderStatus.PENDING);
      expect(result).toContain(OrderStatus.CONFIRMED);
      expect(result).toContain(OrderStatus.PREPARING);
      expect(result).toContain(OrderStatus.READY);
      expect(result).not.toContain(OrderStatus.COMPLETED);
      expect(result).not.toContain(OrderStatus.CANCELLED);
    });
  });

  describe('parseDateRange', () => {
    it('should parse provided date strings', () => {
      const result = helper.parseDateRange('2024-01-01', '2024-01-31');

      expect(result.startDate.toISOString()).toContain('2024-01-01');
      expect(result.endDate.toISOString()).toContain('2024-01-31');
    });

    it('should use today as default', () => {
      const result = helper.parseDateRange();
      const today = new Date();

      expect(result.startDate.getDate()).toBe(today.getDate());
      expect(result.endDate.getDate()).toBe(today.getDate());
    });
  });
});

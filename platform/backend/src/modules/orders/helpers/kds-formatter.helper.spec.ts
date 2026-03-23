import { KdsFormatterHelper } from './kds-formatter.helper';
import { OrderCalculatorHelper } from './order-calculator.helper';
import { Order } from '../entities/order.entity';
import { OrderStatus } from '@common/enums';

describe('KdsFormatterHelper', () => {
  let helper: KdsFormatterHelper;
  let orderCalculator: OrderCalculatorHelper;

  beforeEach(() => {
    orderCalculator = new OrderCalculatorHelper();
    helper = new KdsFormatterHelper(orderCalculator);
  });

  const createMockOrder = (waiterId: string | null = null): Order =>
    ({
      id: 'order-123456789',
      status: OrderStatus.PENDING,
      created_at: new Date(),
      waiter_id: waiterId,
      table: {
        id: 'table-1',
        table_number: 'T5',
      },
      items: [
        {
          id: 'item-1',
          menu_item: { name: 'Burger' },
          quantity: 2,
          special_instructions: 'No onions',
          customizations: { extra: 'cheese' },
        },
      ],
    } as unknown as Order);

  describe('formatOrdersForKds', () => {
    it('should format orders for KDS display', () => {
      const orders = [createMockOrder('waiter-1')];
      const waiterMap = new Map([['waiter-1', 'John Doe']]);

      const result = helper.formatOrdersForKds(orders, waiterMap);

      expect(result).toHaveLength(1);
      expect(result[0].order_number).toBe('#order-12');
      expect(result[0].table_number).toBe('T5');
      expect(result[0].waiter_name).toBe('John Doe');
      expect(result[0].items).toHaveLength(1);
      expect(result[0].items[0].name).toBe('Burger');
    });

    it('should show Self-service for orders without waiter', () => {
      const orders = [createMockOrder(null)];
      const waiterMap = new Map();

      const result = helper.formatOrdersForKds(orders, waiterMap);

      expect(result[0].waiter_name).toBe('Self-service');
    });

    it('should show Staff for unknown waiter', () => {
      const orders = [createMockOrder('unknown-waiter')];
      const waiterMap = new Map();

      const result = helper.formatOrdersForKds(orders, waiterMap);

      expect(result[0].waiter_name).toBe('Staff');
    });

    it('should handle orders without table', () => {
      const order = { ...createMockOrder(), table: null } as unknown as Order;
      const result = helper.formatOrdersForKds([order], new Map());

      expect(result[0].table_number).toBe('N/A');
    });
  });

  describe('getBarCategories', () => {
    it('should return bar categories', () => {
      const result = helper.getBarCategories();

      expect(result).toContain('drinks');
      expect(result).toContain('beverages');
      expect(result).toContain('cocktails');
      expect(result).toContain('beer');
      expect(result).toContain('wine');
    });
  });
});

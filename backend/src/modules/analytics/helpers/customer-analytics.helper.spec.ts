import { CustomerAnalyticsHelper } from './customer-analytics.helper';
import { Order } from '@/modules/orders/entities/order.entity';
import { LoyaltyProgram } from '@/modules/loyalty/entities/loyalty-program.entity';

describe('CustomerAnalyticsHelper', () => {
  let helper: CustomerAnalyticsHelper;

  beforeEach(() => {
    helper = new CustomerAnalyticsHelper();
  });

  const createMockOrder = (userId: string, totalAmount: number): Order =>
    ({
      id: `order-${Math.random()}`,
      user_id: userId,
      total_amount: totalAmount,
    } as Order);

  const createMockLoyaltyProgram = (userId: string, tier: string): LoyaltyProgram =>
    ({
      id: `loyalty-${Math.random()}`,
      user_id: userId,
      tier,
    } as LoyaltyProgram);

  describe('analyzeCustomerSpending', () => {
    it('should analyze customer spending correctly', () => {
      const orders = [
        createMockOrder('user-1', 100),
        createMockOrder('user-1', 150),
        createMockOrder('user-2', 200),
      ];

      const result = helper.analyzeCustomerSpending(orders);

      expect(result['user-1'].total_spent).toBe(250);
      expect(result['user-1'].orders).toBe(2);
      expect(result['user-2'].total_spent).toBe(200);
      expect(result['user-2'].orders).toBe(1);
    });

    it('should handle empty orders', () => {
      const result = helper.analyzeCustomerSpending([]);
      expect(Object.keys(result)).toHaveLength(0);
    });
  });

  describe('calculateLoyaltyDistribution', () => {
    it('should calculate loyalty distribution correctly', () => {
      const programs = [
        createMockLoyaltyProgram('user-1', 'gold'),
        createMockLoyaltyProgram('user-2', 'gold'),
        createMockLoyaltyProgram('user-3', 'silver'),
        createMockLoyaltyProgram('user-4', 'bronze'),
      ];

      const result = helper.calculateLoyaltyDistribution(programs);

      const goldTier = result.find((r) => r.tier === 'gold');
      expect(goldTier?.count).toBe(2);
      expect(goldTier?.percentage).toBe(50);
    });

    it('should handle empty programs', () => {
      const result = helper.calculateLoyaltyDistribution([]);
      expect(result.every((r) => r.percentage === 0)).toBe(true);
    });
  });

  describe('getTopCustomers', () => {
    it('should return top customers sorted by spending', () => {
      const spending = {
        'user-1': { total_spent: 500, orders: 5 },
        'user-2': { total_spent: 1000, orders: 10 },
        'user-3': { total_spent: 200, orders: 2 },
      };

      const loyaltyPrograms = [
        createMockLoyaltyProgram('user-2', 'gold'),
      ];

      const result = helper.getTopCustomers(spending, loyaltyPrograms, 2);

      expect(result).toHaveLength(2);
      expect(result[0].user_id).toBe('user-2');
      expect(result[0].loyalty_tier).toBe('gold');
      expect(result[1].user_id).toBe('user-1');
      expect(result[1].loyalty_tier).toBe('none');
    });
  });

  describe('calculateCustomerRetention', () => {
    it('should calculate new vs returning customers', () => {
      const spending = {
        'user-1': { total_spent: 500, orders: 5 },  // returning
        'user-2': { total_spent: 100, orders: 1 },  // new
        'user-3': { total_spent: 300, orders: 3 },  // returning
      };

      const result = helper.calculateCustomerRetention(spending);

      expect(result.newCustomers).toBe(1);
      expect(result.returningCustomers).toBe(2);
    });
  });

  describe('calculateCustomerAverages', () => {
    it('should calculate customer averages', () => {
      const orders = [
        createMockOrder('user-1', 100),
        createMockOrder('user-1', 200),
        createMockOrder('user-2', 150),
      ];

      const result = helper.calculateCustomerAverages(orders, 2);

      expect(result.averageVisits).toBe(1.5);
      expect(result.averageSpend).toBe(225);
    });

    it('should return 0 for zero customers', () => {
      const result = helper.calculateCustomerAverages([], 0);

      expect(result.averageVisits).toBe(0);
      expect(result.averageSpend).toBe(0);
    });
  });
});

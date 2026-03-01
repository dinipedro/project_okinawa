import { ForecastHelper } from './forecast.helper';
import { Order } from '@/modules/orders/entities/order.entity';

describe('ForecastHelper', () => {
  let helper: ForecastHelper;

  beforeEach(() => {
    helper = new ForecastHelper();
  });

  const createMockOrder = (date: Date, totalAmount: number): Order =>
    ({
      id: `order-${Math.random()}`,
      created_at: date,
      total_amount: totalAmount,
    } as Order);

  describe('calculateDailyRevenue', () => {
    it('should calculate daily revenue correctly', () => {
      const orders = [
        createMockOrder(new Date('2024-01-15T10:00:00Z'), 100),
        createMockOrder(new Date('2024-01-15T15:00:00Z'), 150),
        createMockOrder(new Date('2024-01-16T10:00:00Z'), 200),
      ];

      const result = helper.calculateDailyRevenue(orders);

      expect(result['2024-01-15']).toBe(250);
      expect(result['2024-01-16']).toBe(200);
    });

    it('should handle empty orders', () => {
      const result = helper.calculateDailyRevenue([]);
      expect(Object.keys(result)).toHaveLength(0);
    });
  });

  describe('calculateAverageRevenue', () => {
    it('should calculate average correctly', () => {
      const revenues = [100, 200, 300];
      expect(helper.calculateAverageRevenue(revenues)).toBe(200);
    });

    it('should return 0 for empty array', () => {
      expect(helper.calculateAverageRevenue([])).toBe(0);
    });
  });

  describe('generateForecast', () => {
    it('should generate forecast for specified days', () => {
      const startDate = new Date('2024-01-01');
      const result = helper.generateForecast(100, startDate, 5);

      expect(result).toHaveLength(5);
      expect(result[0].predicted_revenue).toBe(100);
      expect(result[0].date).toBe('2024-01-02');
      expect(result[4].date).toBe('2024-01-06');
    });
  });

  describe('calculateConfidence', () => {
    it('should return high confidence for consistent revenues', () => {
      const revenues = [100, 100, 100, 100];
      const result = helper.calculateConfidence(revenues, 100);

      expect(result).toBe(100);
    });

    it('should return lower confidence for variable revenues', () => {
      const revenues = [50, 150, 50, 150];
      const average = 100;
      const result = helper.calculateConfidence(revenues, average);

      expect(result).toBeLessThan(100);
      expect(result).toBeGreaterThan(0);
    });

    it('should return 0 for empty revenues', () => {
      expect(helper.calculateConfidence([], 0)).toBe(0);
    });

    it('should return 0 for zero average', () => {
      expect(helper.calculateConfidence([0, 0], 0)).toBe(0);
    });
  });

  describe('buildForecast', () => {
    it('should build complete forecast', () => {
      const orders = [
        createMockOrder(new Date('2024-01-15T10:00:00Z'), 100),
        createMockOrder(new Date('2024-01-16T10:00:00Z'), 100),
        createMockOrder(new Date('2024-01-17T10:00:00Z'), 100),
      ];

      const result = helper.buildForecast(orders, 7);

      expect(result.forecast).toHaveLength(7);
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should handle empty orders', () => {
      const result = helper.buildForecast([], 7);

      expect(result.forecast).toHaveLength(7);
      expect(result.forecast[0].predicted_revenue).toBe(0);
      expect(result.confidence).toBe(0);
    });
  });
});

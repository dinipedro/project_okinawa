import { MetricsCalculatorHelper } from './metrics-calculator.helper';

describe('MetricsCalculatorHelper', () => {
  let helper: MetricsCalculatorHelper;

  beforeEach(() => {
    helper = new MetricsCalculatorHelper();
  });

  describe('calculatePercentageChange', () => {
    it('should calculate positive percentage change', () => {
      expect(helper.calculatePercentageChange(120, 100)).toBe(20);
    });

    it('should calculate negative percentage change', () => {
      expect(helper.calculatePercentageChange(80, 100)).toBe(-20);
    });

    it('should return 0 when previous is 0', () => {
      expect(helper.calculatePercentageChange(100, 0)).toBe(0);
    });

    it('should handle equal values', () => {
      expect(helper.calculatePercentageChange(100, 100)).toBe(0);
    });
  });

  describe('calculateAverageOrderValue', () => {
    it('should calculate average correctly', () => {
      expect(helper.calculateAverageOrderValue(1000, 10)).toBe(100);
    });

    it('should return 0 when order count is 0', () => {
      expect(helper.calculateAverageOrderValue(1000, 0)).toBe(0);
    });
  });

  describe('buildPeriodMetrics', () => {
    it('should build period metrics correctly', () => {
      const result = helper.buildPeriodMetrics(1000, 10, 5);

      expect(result.revenue).toBe(1000);
      expect(result.orders).toBe(10);
      expect(result.reservations).toBe(5);
      expect(result.average_order_value).toBe(100);
    });

    it('should handle zero orders', () => {
      const result = helper.buildPeriodMetrics(0, 0, 0);

      expect(result.revenue).toBe(0);
      expect(result.orders).toBe(0);
      expect(result.average_order_value).toBe(0);
    });
  });

  describe('buildComparisonMetrics', () => {
    it('should build comparison metrics correctly', () => {
      const result = helper.buildComparisonMetrics(
        1200, 1000, // week revenue
        12, 10,     // week orders
        5000, 4000, // month revenue
        50, 40,     // month orders
      );

      expect(result.revenue_vs_last_week).toBe(20);
      expect(result.orders_vs_last_week).toBe(20);
      expect(result.revenue_vs_last_month).toBe(25);
      expect(result.orders_vs_last_month).toBe(25);
    });
  });

  describe('getDateBoundaries', () => {
    it('should return valid date boundaries', () => {
      const result = helper.getDateBoundaries();

      expect(result.today).toBeInstanceOf(Date);
      expect(result.weekAgo).toBeInstanceOf(Date);
      expect(result.twoWeeksAgo).toBeInstanceOf(Date);
      expect(result.monthAgo).toBeInstanceOf(Date);
      expect(result.twoMonthsAgo).toBeInstanceOf(Date);
    });

    it('should have correct date order', () => {
      const result = helper.getDateBoundaries();

      expect(result.today.getTime()).toBeGreaterThan(result.weekAgo.getTime());
      expect(result.weekAgo.getTime()).toBeGreaterThan(result.twoWeeksAgo.getTime());
      expect(result.monthAgo.getTime()).toBeGreaterThan(result.twoMonthsAgo.getTime());
    });
  });
});

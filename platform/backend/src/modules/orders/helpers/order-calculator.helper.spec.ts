import { OrderCalculatorHelper } from './order-calculator.helper';
import { Order } from '../entities/order.entity';
import { OrderStatus } from '@common/enums';

describe('OrderCalculatorHelper', () => {
  let helper: OrderCalculatorHelper;

  beforeEach(() => {
    helper = new OrderCalculatorHelper();
  });

  describe('calculatePriority', () => {
    it('should return normal for orders under 15 minutes', () => {
      const order = {
        created_at: new Date(Date.now() - 10 * 60 * 1000),
      } as Order;

      expect(helper.calculatePriority(order)).toBe('normal');
    });

    it('should return high for orders between 15-30 minutes', () => {
      const order = {
        created_at: new Date(Date.now() - 20 * 60 * 1000),
      } as Order;

      expect(helper.calculatePriority(order)).toBe('high');
    });

    it('should return urgent for orders over 30 minutes', () => {
      const order = {
        created_at: new Date(Date.now() - 35 * 60 * 1000),
      } as Order;

      expect(helper.calculatePriority(order)).toBe('urgent');
    });
  });

  describe('calculateTotals', () => {
    it('should calculate totals correctly with default tax rate', () => {
      const result = helper.calculateTotals(100, 10);

      expect(result.taxAmount).toBe(10);
      expect(result.totalAmount).toBe(120);
    });

    it('should calculate totals with custom tax rate', () => {
      const result = helper.calculateTotals(100, 0, 0.15);

      expect(result.taxAmount).toBe(15);
      expect(result.totalAmount).toBe(115);
    });

    it('should handle zero subtotal', () => {
      const result = helper.calculateTotals(0, 0);

      expect(result.taxAmount).toBe(0);
      expect(result.totalAmount).toBe(0);
    });
  });

  describe('getStatusMessage', () => {
    it('should return correct message for pending', () => {
      expect(helper.getStatusMessage(OrderStatus.PENDING)).toBe('Your order has been received');
    });

    it('should return correct message for confirmed', () => {
      expect(helper.getStatusMessage(OrderStatus.CONFIRMED)).toBe('Your order has been confirmed');
    });

    it('should return correct message for preparing', () => {
      expect(helper.getStatusMessage(OrderStatus.PREPARING)).toBe('Your order is being prepared');
    });

    it('should return correct message for ready', () => {
      expect(helper.getStatusMessage(OrderStatus.READY)).toBe('Your order is ready!');
    });

    it('should return correct message for delivering', () => {
      expect(helper.getStatusMessage(OrderStatus.DELIVERING)).toBe('Your order is on the way!');
    });

    it('should return correct message for completed', () => {
      expect(helper.getStatusMessage(OrderStatus.COMPLETED)).toBe('Order completed. Thank you!');
    });

    it('should return correct message for cancelled', () => {
      expect(helper.getStatusMessage(OrderStatus.CANCELLED)).toBe('Order has been cancelled');
    });
  });

  describe('isActiveStatus', () => {
    it('should return true for pending status', () => {
      expect(helper.isActiveStatus(OrderStatus.PENDING)).toBe(true);
    });

    it('should return true for confirmed status', () => {
      expect(helper.isActiveStatus(OrderStatus.CONFIRMED)).toBe(true);
    });

    it('should return true for preparing status', () => {
      expect(helper.isActiveStatus(OrderStatus.PREPARING)).toBe(true);
    });

    it('should return true for ready status', () => {
      expect(helper.isActiveStatus(OrderStatus.READY)).toBe(true);
    });

    it('should return false for completed status', () => {
      expect(helper.isActiveStatus(OrderStatus.COMPLETED)).toBe(false);
    });

    it('should return false for cancelled status', () => {
      expect(helper.isActiveStatus(OrderStatus.CANCELLED)).toBe(false);
    });
  });

  describe('getOrderNumber', () => {
    it('should format order number correctly', () => {
      const result = helper.getOrderNumber('abc12345-xyz-789');
      expect(result).toBe('#abc12345');
    });
  });
});

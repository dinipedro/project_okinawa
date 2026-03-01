import { Injectable } from '@nestjs/common';

export interface PeriodMetrics {
  revenue: number;
  orders: number;
  reservations: number;
  average_order_value: number;
}

export interface ComparisonMetrics {
  revenue_vs_last_week: number;
  orders_vs_last_week: number;
  revenue_vs_last_month: number;
  orders_vs_last_month: number;
}

@Injectable()
export class MetricsCalculatorHelper {
  /**
   * Calculate percentage change between two values
   */
  calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }

  /**
   * Calculate average order value
   */
  calculateAverageOrderValue(revenue: number, orderCount: number): number {
    return orderCount > 0 ? revenue / orderCount : 0;
  }

  /**
   * Build period metrics object
   */
  buildPeriodMetrics(
    revenue: number,
    orders: number,
    reservations: number,
  ): PeriodMetrics {
    return {
      revenue,
      orders,
      reservations,
      average_order_value: this.calculateAverageOrderValue(revenue, orders),
    };
  }

  /**
   * Build comparison metrics
   */
  buildComparisonMetrics(
    weekRevenue: number,
    lastWeekRevenue: number,
    weekOrders: number,
    lastWeekOrders: number,
    monthRevenue: number,
    lastMonthRevenue: number,
    monthOrders: number,
    lastMonthOrders: number,
  ): ComparisonMetrics {
    return {
      revenue_vs_last_week: this.calculatePercentageChange(weekRevenue, lastWeekRevenue),
      orders_vs_last_week: this.calculatePercentageChange(weekOrders, lastWeekOrders),
      revenue_vs_last_month: this.calculatePercentageChange(monthRevenue, lastMonthRevenue),
      orders_vs_last_month: this.calculatePercentageChange(monthOrders, lastMonthOrders),
    };
  }

  /**
   * Get date boundaries for analytics
   */
  getDateBoundaries(): {
    today: Date;
    weekAgo: Date;
    twoWeeksAgo: Date;
    monthAgo: Date;
    twoMonthsAgo: Date;
  } {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return {
      today,
      weekAgo: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
      twoWeeksAgo: new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000),
      monthAgo: new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()),
      twoMonthsAgo: new Date(now.getFullYear(), now.getMonth() - 2, now.getDate()),
    };
  }
}

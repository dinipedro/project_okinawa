import { Injectable } from '@nestjs/common';
import { Order } from '@/modules/orders/entities/order.entity';

export interface ForecastResult {
  forecast: Array<{ date: string; predicted_revenue: number }>;
  confidence: number;
}

@Injectable()
export class ForecastHelper {
  /**
   * Calculate daily revenue from orders
   */
  calculateDailyRevenue(orders: Order[]): Record<string, number> {
    const dailyRevenue: Record<string, number> = {};

    orders.forEach((order) => {
      const date = order.created_at.toISOString().split('T')[0];
      if (!dailyRevenue[date]) {
        dailyRevenue[date] = 0;
      }
      dailyRevenue[date] += Number(order.total_amount);
    });

    return dailyRevenue;
  }

  /**
   * Calculate average revenue
   */
  calculateAverageRevenue(revenues: number[]): number {
    return revenues.length > 0
      ? revenues.reduce((sum, r) => sum + r, 0) / revenues.length
      : 0;
  }

  /**
   * Generate revenue forecast based on simple average
   */
  generateForecast(
    averageRevenue: number,
    startDate: Date,
    days: number,
  ): Array<{ date: string; predicted_revenue: number }> {
    const forecast = [];

    for (let i = 1; i <= days; i++) {
      const forecastDate = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      forecast.push({
        date: forecastDate.toISOString().split('T')[0],
        predicted_revenue: averageRevenue,
      });
    }

    return forecast;
  }

  /**
   * Calculate confidence based on revenue variance
   */
  calculateConfidence(revenues: number[], averageRevenue: number): number {
    if (revenues.length === 0 || averageRevenue === 0) return 0;

    const variance =
      revenues.reduce((sum, r) => sum + Math.pow(r - averageRevenue, 2), 0) /
      revenues.length;

    const stdDev = Math.sqrt(variance);
    return Math.max(0, 100 - (stdDev / averageRevenue) * 100);
  }

  /**
   * Build complete forecast result
   */
  buildForecast(orders: Order[], days: number = 30): ForecastResult {
    const dailyRevenue = this.calculateDailyRevenue(orders);
    const revenues = Object.values(dailyRevenue);
    const averageRevenue = this.calculateAverageRevenue(revenues);
    const confidence = this.calculateConfidence(revenues, averageRevenue);
    const forecast = this.generateForecast(averageRevenue, new Date(), days);

    return { forecast, confidence };
  }
}

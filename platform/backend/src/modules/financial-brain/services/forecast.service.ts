import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { FinancialTransaction } from '../../financial/entities/financial-transaction.entity';
import { DeliverySettlement } from '../../reconciliation/entities/delivery-settlement.entity';
import { AccountsPayableService } from '../../accounts-payable/services/accounts-payable.service';

/**
 * ForecastService -- Cash flow forecasting for restaurants.
 *
 * Algorithm:
 * 1. For each future day:
 *    a. projected_revenue = weighted average of historical sales on the same day_of_week
 *       (recent weeks weighted higher via exponential decay)
 *    b. projected_expenses = recurring bills + scheduled bills due that day
 *    c. projected_settlements = pending delivery settlements expected
 *    d. projected_balance = previous_balance + revenue - expenses + settlements
 *
 * 2. Alerts:
 *    - low_balance: if projected_balance < threshold on any day
 *    - high_food_cost: if projected food_cost ratio > 35%
 */

export interface ForecastProjection {
  date: string;
  projected_revenue: number;
  projected_expenses: number;
  projected_balance: number;
}

export interface ForecastAlert {
  type: 'low_balance' | 'high_food_cost';
  date: string;
  message_key: string;
  projected_value: number;
  threshold: number;
}

export interface ForecastResult {
  current_balance: number;
  projections: ForecastProjection[];
  alerts: ForecastAlert[];
}

@Injectable()
export class ForecastService {
  /** Configurable thresholds */
  private readonly LOW_BALANCE_THRESHOLD = 1000;
  private readonly HIGH_FOOD_COST_THRESHOLD = 0.35;
  private readonly HISTORY_DAYS = 90;

  constructor(
    @InjectRepository(FinancialTransaction)
    private readonly txRepo: Repository<FinancialTransaction>,
    @InjectRepository(DeliverySettlement)
    private readonly settlementRepo: Repository<DeliverySettlement>,
    private readonly accountsPayableService: AccountsPayableService,
  ) {}

  /**
   * Generate a cash flow forecast for the given restaurant.
   *
   * @param restaurantId - target restaurant UUID
   * @param days - number of days to forecast (7, 30, or 90)
   * @returns ForecastResult with projections and alerts
   */
  async getForecast(
    restaurantId: string,
    days: number = 30,
  ): Promise<ForecastResult> {
    // 1. Compute current balance from all-time transactions
    const currentBalance = await this.computeCurrentBalance(restaurantId);

    // 2. Build historical sales by day_of_week (last 90 days)
    const historicalByDow = await this.getHistoricalSalesByDow(restaurantId);

    // 3. Get upcoming bills
    const upcomingBills = await this.accountsPayableService.getUpcoming(
      restaurantId,
      days,
    );
    const recurringBills = await this.accountsPayableService.getRecurring(
      restaurantId,
    );

    // 4. Get pending delivery settlements
    const pendingSettlements = await this.getPendingSettlements(restaurantId);

    // 5. Project forward
    const projections: ForecastProjection[] = [];
    const alerts: ForecastAlert[] = [];
    let runningBalance = currentBalance;
    const today = new Date();

    // Build a map of bill amounts by date for quick lookup
    const billsByDate = new Map<string, number>();
    for (const bill of upcomingBills) {
      const dateKey = this.toDateKey(new Date(bill.due_date));
      billsByDate.set(dateKey, (billsByDate.get(dateKey) || 0) + Number(bill.amount));
    }

    // Build a map of estimated recurring expenses per day_of_week
    const recurringByDow = this.buildRecurringByDow(recurringBills);

    // Compute average pending settlement per day
    const avgDailySettlement =
      pendingSettlements.length > 0
        ? pendingSettlements.reduce(
            (sum, s) => sum + Number(s.expected_net),
            0,
          ) / Math.max(days, 7)
        : 0;

    for (let i = 1; i <= days; i++) {
      const projDate = new Date(today);
      projDate.setDate(projDate.getDate() + i);
      const dow = projDate.getDay(); // 0=Sun .. 6=Sat
      const dateKey = this.toDateKey(projDate);

      // Revenue projection: weighted historical average for this day_of_week
      const projectedRevenue = historicalByDow[dow] || 0;

      // Expenses: scheduled bills + recurring allocation
      const scheduledExpenses = billsByDate.get(dateKey) || 0;
      const recurringExpenses = recurringByDow[dow] || 0;
      const projectedExpenses = scheduledExpenses + recurringExpenses;

      // Balance
      runningBalance =
        runningBalance + projectedRevenue - projectedExpenses + avgDailySettlement;

      projections.push({
        date: dateKey,
        projected_revenue: Math.round(projectedRevenue * 100) / 100,
        projected_expenses: Math.round(projectedExpenses * 100) / 100,
        projected_balance: Math.round(runningBalance * 100) / 100,
      });

      // Alerts
      if (runningBalance < this.LOW_BALANCE_THRESHOLD) {
        // Only emit one alert per crossing
        const alreadyAlerted = alerts.some(
          (a) => a.type === 'low_balance',
        );
        if (!alreadyAlerted) {
          alerts.push({
            type: 'low_balance',
            date: dateKey,
            message_key: 'financial.forecast.alert_low_balance',
            projected_value: Math.round(runningBalance * 100) / 100,
            threshold: this.LOW_BALANCE_THRESHOLD,
          });
        }
      }
    }

    // High food cost alert (based on historical data)
    const foodCostRatio = await this.computeFoodCostRatio(restaurantId);
    if (foodCostRatio > this.HIGH_FOOD_COST_THRESHOLD) {
      alerts.push({
        type: 'high_food_cost',
        date: this.toDateKey(today),
        message_key: 'financial.forecast.alert_high_food_cost',
        projected_value: Math.round(foodCostRatio * 100),
        threshold: Math.round(this.HIGH_FOOD_COST_THRESHOLD * 100),
      });
    }

    return {
      current_balance: Math.round(currentBalance * 100) / 100,
      projections,
      alerts,
    };
  }

  // ────────── Private Helpers ──────────

  /**
   * Compute current balance as sum of all transactions (sales - expenses).
   */
  private async computeCurrentBalance(restaurantId: string): Promise<number> {
    const result = await this.txRepo
      .createQueryBuilder('tx')
      .select(
        `SUM(CASE WHEN tx.type IN ('sale', 'tip') THEN tx.amount ELSE -tx.amount END)`,
        'balance',
      )
      .where('tx.restaurant_id = :restaurantId', { restaurantId })
      .getRawOne();

    return parseFloat(result?.balance || '0');
  }

  /**
   * Build weighted average sales per day_of_week from last 90 days.
   * Recent weeks are weighted more heavily (exponential decay factor 0.9).
   */
  private async getHistoricalSalesByDow(
    restaurantId: string,
  ): Promise<Record<number, number>> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - this.HISTORY_DAYS);

    const sales = await this.txRepo
      .createQueryBuilder('tx')
      .select('tx.transaction_date', 'tx_date')
      .addSelect('SUM(tx.amount)', 'daily_total')
      .where('tx.restaurant_id = :restaurantId', { restaurantId })
      .andWhere('tx.type = :type', { type: 'sale' })
      .andWhere('tx.transaction_date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy('tx.transaction_date')
      .orderBy('tx.transaction_date', 'ASC')
      .getRawMany();

    // Group by day_of_week with exponential weighting
    const dowSums: Record<number, number> = {};
    const dowWeights: Record<number, number> = {};
    const DECAY = 0.9;

    for (const row of sales) {
      const date = new Date(row.tx_date);
      const dow = date.getDay();
      const weeksAgo = Math.floor(
        (endDate.getTime() - date.getTime()) / (7 * 24 * 60 * 60 * 1000),
      );
      const weight = Math.pow(DECAY, weeksAgo);
      const amount = parseFloat(row.daily_total);

      dowSums[dow] = (dowSums[dow] || 0) + amount * weight;
      dowWeights[dow] = (dowWeights[dow] || 0) + weight;
    }

    const result: Record<number, number> = {};
    for (let dow = 0; dow < 7; dow++) {
      result[dow] =
        dowWeights[dow] && dowWeights[dow] > 0
          ? dowSums[dow] / dowWeights[dow]
          : 0;
    }

    return result;
  }

  /**
   * Get pending delivery settlements for the restaurant.
   */
  private async getPendingSettlements(
    restaurantId: string,
  ): Promise<DeliverySettlement[]> {
    return this.settlementRepo.find({
      where: {
        restaurant_id: restaurantId,
        status: 'pending',
      },
    });
  }

  /**
   * Distribute recurring bills across days of the week.
   * Monthly bills are spread across ~4.3 weeks, weekly bills across 1 week.
   */
  private buildRecurringByDow(
    recurringBills: any[],
  ): Record<number, number> {
    const dowMap: Record<number, number> = {};
    for (let d = 0; d < 7; d++) dowMap[d] = 0;

    for (const bill of recurringBills) {
      const amount = Number(bill.amount);
      switch (bill.recurrence) {
        case 'weekly':
          // Spread equally across all 7 days
          for (let d = 0; d < 7; d++) dowMap[d] += amount / 7;
          break;
        case 'monthly':
          // Spread across 30 days
          for (let d = 0; d < 7; d++) dowMap[d] += amount / 30;
          break;
        case 'yearly':
          // Spread across 365 days
          for (let d = 0; d < 7; d++) dowMap[d] += amount / 365;
          break;
      }
    }

    return dowMap;
  }

  /**
   * Compute current food cost ratio from last 30 days.
   * food_cost_ratio = supplies expenses / total sales
   */
  private async computeFoodCostRatio(restaurantId: string): Promise<number> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const result = await this.txRepo
      .createQueryBuilder('tx')
      .select(
        `SUM(CASE WHEN tx.type = 'sale' THEN tx.amount ELSE 0 END)`,
        'total_sales',
      )
      .addSelect(
        `SUM(CASE WHEN tx.type = 'expense' AND tx.category = 'supplies' THEN tx.amount ELSE 0 END)`,
        'supplies_cost',
      )
      .where('tx.restaurant_id = :restaurantId', { restaurantId })
      .andWhere('tx.transaction_date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getRawOne();

    const totalSales = parseFloat(result?.total_sales || '0');
    const suppliesCost = parseFloat(result?.supplies_cost || '0');

    if (totalSales === 0) return 0;
    return suppliesCost / totalSales;
  }

  /**
   * Format a date as YYYY-MM-DD string.
   */
  private toDateKey(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}

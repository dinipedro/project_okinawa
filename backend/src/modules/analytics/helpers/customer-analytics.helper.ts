import { Injectable } from '@nestjs/common';
import { Order } from '@/modules/orders/entities/order.entity';
import { LoyaltyProgram } from '@/modules/loyalty/entities/loyalty-program.entity';

export interface CustomerSpending {
  total_spent: number;
  orders: number;
}

export interface LoyaltyDistribution {
  tier: string;
  count: number;
  percentage: number;
}

export interface TopCustomer {
  user_id: string;
  total_spent: number;
  total_orders: number;
  loyalty_tier: string;
}

@Injectable()
export class CustomerAnalyticsHelper {
  /**
   * Analyze customer spending from orders
   */
  analyzeCustomerSpending(orders: Order[]): Record<string, CustomerSpending> {
    const customerSpending: Record<string, CustomerSpending> = {};

    orders.forEach((order) => {
      if (!customerSpending[order.user_id]) {
        customerSpending[order.user_id] = { total_spent: 0, orders: 0 };
      }
      customerSpending[order.user_id].total_spent += Number(order.total_amount);
      customerSpending[order.user_id].orders++;
    });

    return customerSpending;
  }

  /**
   * Calculate loyalty distribution
   */
  calculateLoyaltyDistribution(
    loyaltyPrograms: LoyaltyProgram[],
  ): LoyaltyDistribution[] {
    const tierCounts: Record<string, number> = {
      bronze: 0,
      silver: 0,
      gold: 0,
      platinum: 0,
    };

    loyaltyPrograms.forEach((program) => {
      tierCounts[program.tier] = (tierCounts[program.tier] || 0) + 1;
    });

    return Object.entries(tierCounts).map(([tier, count]) => ({
      tier,
      count,
      percentage:
        loyaltyPrograms.length > 0 ? (count / loyaltyPrograms.length) * 100 : 0,
    }));
  }

  /**
   * Get top customers by spending
   */
  getTopCustomers(
    customerSpending: Record<string, CustomerSpending>,
    loyaltyPrograms: LoyaltyProgram[],
    limit: number = 10,
  ): TopCustomer[] {
    return Object.entries(customerSpending)
      .sort((a, b) => b[1].total_spent - a[1].total_spent)
      .slice(0, limit)
      .map(([user_id, data]) => {
        const loyalty = loyaltyPrograms.find((l) => l.user_id === user_id);
        return {
          user_id,
          total_spent: data.total_spent,
          total_orders: data.orders,
          loyalty_tier: loyalty?.tier || 'none',
        };
      });
  }

  /**
   * Calculate new vs returning customers
   */
  calculateCustomerRetention(
    customerSpending: Record<string, CustomerSpending>,
  ): { newCustomers: number; returningCustomers: number } {
    const totalCustomers = Object.keys(customerSpending).length;
    const returningCustomers = Object.values(customerSpending).filter(
      (c) => c.orders > 1,
    ).length;

    return {
      newCustomers: totalCustomers - returningCustomers,
      returningCustomers,
    };
  }

  /**
   * Calculate customer averages
   */
  calculateCustomerAverages(
    orders: Order[],
    totalCustomers: number,
  ): { averageVisits: number; averageSpend: number } {
    const totalVisits = orders.length;
    const totalSpent = orders.reduce(
      (sum, o) => sum + Number(o.total_amount),
      0,
    );

    return {
      averageVisits: totalCustomers > 0 ? totalVisits / totalCustomers : 0,
      averageSpend: totalCustomers > 0 ? totalSpent / totalCustomers : 0,
    };
  }
}

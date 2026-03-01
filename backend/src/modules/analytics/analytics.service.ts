import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { Order } from '@/modules/orders/entities/order.entity';
import { Reservation } from '@/modules/reservations/entities/reservation.entity';
import { Review } from '@/modules/reviews/entities/review.entity';
import { LoyaltyProgram } from '@/modules/loyalty/entities/loyalty-program.entity';
import { Tip } from '@/modules/tips/entities/tip.entity';
import { RestaurantTable, TableStatus } from '@/modules/tables/entities/restaurant-table.entity';
import { FinancialTransaction } from '@/modules/financial/entities/financial-transaction.entity';
import { Attendance } from '@/modules/hr/entities/attendance.entity';
import {
  MetricsCalculatorHelper,
  SalesAggregatorHelper,
  CustomerAnalyticsHelper,
  PerformanceMetricsHelper,
  ForecastHelper,
} from './helpers';

export interface DashboardMetrics {
  today: { revenue: number; orders: number; reservations: number; average_order_value: number };
  week: { revenue: number; orders: number; reservations: number; average_order_value: number };
  month: { revenue: number; orders: number; reservations: number; average_order_value: number };
  comparisons: {
    revenue_vs_last_week: number;
    orders_vs_last_week: number;
    revenue_vs_last_month: number;
    orders_vs_last_month: number;
  };
}

export interface SalesAnalytics {
  period: { start_date: Date; end_date: Date };
  total_revenue: number;
  total_orders: number;
  average_order_value: number;
  top_selling_items: Array<{ item_name: string; quantity_sold: number; revenue: number }>;
  sales_by_day: Array<{ date: string; revenue: number; orders: number }>;
  sales_by_hour: Array<{ hour: number; revenue: number; orders: number }>;
  peak_hours: Array<{ hour: number; orders: number }>;
}

export interface CustomerAnalytics {
  total_customers: number;
  new_customers: number;
  returning_customers: number;
  loyalty_members: number;
  loyalty_distribution: Array<{ tier: string; count: number; percentage: number }>;
  average_visits_per_customer: number;
  average_spend_per_customer: number;
  top_customers: Array<{ user_id: string; total_spent: number; total_orders: number; loyalty_tier: string }>;
}

export interface RestaurantPerformance {
  overall_rating: number;
  total_reviews: number;
  rating_distribution: { five_star: number; four_star: number; three_star: number; two_star: number; one_star: number };
  sentiment_score: number;
  table_turnover_rate: number;
  average_wait_time: number;
  reservation_no_show_rate: number;
  staff_efficiency: { average_order_completion_time: number; average_tips_per_staff: number; attendance_rate: number };
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(LoyaltyProgram)
    private loyaltyRepository: Repository<LoyaltyProgram>,
    @InjectRepository(Tip)
    private tipRepository: Repository<Tip>,
    @InjectRepository(RestaurantTable)
    private tableRepository: Repository<RestaurantTable>,
    @InjectRepository(FinancialTransaction)
    private financialRepository: Repository<FinancialTransaction>,
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    private metricsCalculator: MetricsCalculatorHelper,
    private salesAggregator: SalesAggregatorHelper,
    private customerAnalytics: CustomerAnalyticsHelper,
    private performanceMetrics: PerformanceMetricsHelper,
    private forecastHelper: ForecastHelper,
  ) {}

  /**
   * Get dashboard metrics - Today, Week, Month (Optimized - Single Query)
   */
  async getDashboardMetrics(restaurantId: string): Promise<DashboardMetrics> {
    const dates = this.metricsCalculator.getDateBoundaries();

    const ordersMetrics = await this.orderRepository
      .createQueryBuilder('order')
      .select([
        `SUM(CASE WHEN order.created_at >= :today THEN order.total_amount ELSE 0 END) as today_revenue`,
        `COUNT(CASE WHEN order.created_at >= :today THEN 1 END) as today_orders`,
        `SUM(CASE WHEN order.created_at >= :weekAgo THEN order.total_amount ELSE 0 END) as week_revenue`,
        `COUNT(CASE WHEN order.created_at >= :weekAgo THEN 1 END) as week_orders`,
        `SUM(CASE WHEN order.created_at BETWEEN :twoWeeksAgo AND :weekAgo THEN order.total_amount ELSE 0 END) as last_week_revenue`,
        `COUNT(CASE WHEN order.created_at BETWEEN :twoWeeksAgo AND :weekAgo THEN 1 END) as last_week_orders`,
        `SUM(CASE WHEN order.created_at >= :monthAgo THEN order.total_amount ELSE 0 END) as month_revenue`,
        `COUNT(CASE WHEN order.created_at >= :monthAgo THEN 1 END) as month_orders`,
        `SUM(CASE WHEN order.created_at BETWEEN :twoMonthsAgo AND :monthAgo THEN order.total_amount ELSE 0 END) as last_month_revenue`,
        `COUNT(CASE WHEN order.created_at BETWEEN :twoMonthsAgo AND :monthAgo THEN 1 END) as last_month_orders`,
      ])
      .where('order.restaurant_id = :restaurantId', { restaurantId })
      .setParameters({
        today: dates.today,
        weekAgo: dates.weekAgo,
        twoWeeksAgo: dates.twoWeeksAgo,
        monthAgo: dates.monthAgo,
        twoMonthsAgo: dates.twoMonthsAgo,
      })
      .getRawOne();

    const reservationsMetrics = await this.reservationRepository
      .createQueryBuilder('reservation')
      .select([
        `COUNT(CASE WHEN reservation.reservation_date >= :today THEN 1 END) as today_reservations`,
        `COUNT(CASE WHEN reservation.reservation_date >= :weekAgo THEN 1 END) as week_reservations`,
        `COUNT(CASE WHEN reservation.reservation_date >= :monthAgo THEN 1 END) as month_reservations`,
      ])
      .where('reservation.restaurant_id = :restaurantId', { restaurantId })
      .setParameters({ today: dates.today, weekAgo: dates.weekAgo, monthAgo: dates.monthAgo })
      .getRawOne();

    const todayRevenue = Number(ordersMetrics.today_revenue) || 0;
    const todayOrders = Number(ordersMetrics.today_orders) || 0;
    const weekRevenue = Number(ordersMetrics.week_revenue) || 0;
    const weekOrders = Number(ordersMetrics.week_orders) || 0;
    const lastWeekRevenue = Number(ordersMetrics.last_week_revenue) || 0;
    const lastWeekOrders = Number(ordersMetrics.last_week_orders) || 0;
    const monthRevenue = Number(ordersMetrics.month_revenue) || 0;
    const monthOrders = Number(ordersMetrics.month_orders) || 0;
    const lastMonthRevenue = Number(ordersMetrics.last_month_revenue) || 0;
    const lastMonthOrders = Number(ordersMetrics.last_month_orders) || 0;

    return {
      today: this.metricsCalculator.buildPeriodMetrics(
        todayRevenue, todayOrders, Number(reservationsMetrics.today_reservations) || 0,
      ),
      week: this.metricsCalculator.buildPeriodMetrics(
        weekRevenue, weekOrders, Number(reservationsMetrics.week_reservations) || 0,
      ),
      month: this.metricsCalculator.buildPeriodMetrics(
        monthRevenue, monthOrders, Number(reservationsMetrics.month_reservations) || 0,
      ),
      comparisons: this.metricsCalculator.buildComparisonMetrics(
        weekRevenue, lastWeekRevenue, weekOrders, lastWeekOrders,
        monthRevenue, lastMonthRevenue, monthOrders, lastMonthOrders,
      ),
    };
  }

  /**
   * Get sales analytics for period
   */
  async getSalesAnalytics(restaurantId: string, startDate: Date, endDate: Date): Promise<SalesAnalytics> {
    const orders = await this.orderRepository.find({
      where: { restaurant_id: restaurantId, created_at: Between(startDate, endDate) },
      relations: ['items'],
    });

    const totalRevenue = this.salesAggregator.calculateTotalRevenue(orders);
    const itemSales = this.salesAggregator.aggregateItemSales(orders);
    const salesByDay = this.salesAggregator.aggregateSalesByDay(orders);
    const salesByHour = this.salesAggregator.aggregateSalesByHour(orders);

    return {
      period: { start_date: startDate, end_date: endDate },
      total_revenue: totalRevenue,
      total_orders: orders.length,
      average_order_value: this.metricsCalculator.calculateAverageOrderValue(totalRevenue, orders.length),
      top_selling_items: this.salesAggregator.getTopSellingItems(itemSales),
      sales_by_day: Object.entries(salesByDay).map(([date, data]) => ({ date, ...data })),
      sales_by_hour: Object.entries(salesByHour).map(([hour, data]) => ({ hour: parseInt(hour), ...data })),
      peak_hours: this.salesAggregator.getPeakHours(salesByHour),
    };
  }

  /**
   * Get customer analytics
   */
  async getCustomerAnalytics(restaurantId: string, startDate: Date, endDate: Date): Promise<CustomerAnalytics> {
    const orders = await this.orderRepository.find({
      where: { restaurant_id: restaurantId, created_at: Between(startDate, endDate) },
    });

    const loyaltyPrograms = await this.loyaltyRepository.find({
      where: { restaurant_id: restaurantId },
    });

    const customerSpending = this.customerAnalytics.analyzeCustomerSpending(orders);
    const totalCustomers = Object.keys(customerSpending).length;
    const { newCustomers, returningCustomers } = this.customerAnalytics.calculateCustomerRetention(customerSpending);
    const { averageVisits, averageSpend } = this.customerAnalytics.calculateCustomerAverages(orders, totalCustomers);

    return {
      total_customers: totalCustomers,
      new_customers: newCustomers,
      returning_customers: returningCustomers,
      loyalty_members: loyaltyPrograms.length,
      loyalty_distribution: this.customerAnalytics.calculateLoyaltyDistribution(loyaltyPrograms),
      average_visits_per_customer: averageVisits,
      average_spend_per_customer: averageSpend,
      top_customers: this.customerAnalytics.getTopCustomers(customerSpending, loyaltyPrograms),
    };
  }

  /**
   * Get restaurant performance metrics
   */
  async getRestaurantPerformance(restaurantId: string): Promise<RestaurantPerformance> {
    const [reviews, reservations, tips, attendances] = await Promise.all([
      this.reviewRepository.find({ where: { restaurant_id: restaurantId } }),
      this.reservationRepository.find({ where: { restaurant_id: restaurantId } }),
      this.tipRepository.find({ where: { restaurant_id: restaurantId } }),
      this.attendanceRepository.find({ where: { restaurant_id: restaurantId } }),
    ]);

    const reviewStats = this.performanceMetrics.calculateReviewStats(reviews);

    return {
      overall_rating: reviewStats.averageRating,
      total_reviews: reviewStats.totalReviews,
      rating_distribution: reviewStats.ratingDistribution,
      sentiment_score: reviewStats.sentimentScore,
      table_turnover_rate: 0,
      average_wait_time: 0,
      reservation_no_show_rate: this.performanceMetrics.calculateNoShowRate(reservations),
      staff_efficiency: this.performanceMetrics.buildStaffEfficiency(tips, attendances),
    };
  }

  /**
   * Get revenue forecast (simple linear projection)
   */
  async getRevenueForecast(restaurantId: string, days: number = 30) {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    const orders = await this.orderRepository.find({
      where: { restaurant_id: restaurantId, created_at: Between(startDate, endDate) },
    });

    return this.forecastHelper.buildForecast(orders, days);
  }

  /**
   * Get real-time metrics (last 1 hour)
   */
  async getRealTimeMetrics(restaurantId: string) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [activeOrders, activeReservations, occupiedTables, staffOnDuty, recentOrders] = await Promise.all([
      this.orderRepository.count({ where: { restaurant_id: restaurantId, status: 'pending' as any } }),
      this.reservationRepository.count({
        where: { restaurant_id: restaurantId, reservation_date: MoreThanOrEqual(today), status: 'confirmed' as any },
      }),
      this.tableRepository.count({ where: { restaurant_id: restaurantId, status: TableStatus.OCCUPIED } }),
      this.attendanceRepository.count({
        where: { restaurant_id: restaurantId, date: MoreThanOrEqual(today), check_in: MoreThanOrEqual('00:00:00' as any), check_out: null as any },
      }),
      this.orderRepository.find({ where: { restaurant_id: restaurantId, created_at: MoreThanOrEqual(oneHourAgo) } }),
    ]);

    return {
      active_orders: activeOrders,
      active_reservations: activeReservations,
      occupied_tables: occupiedTables,
      staff_on_duty: staffOnDuty,
      revenue_last_hour: recentOrders.reduce((sum, order) => sum + Number(order.total_amount), 0),
    };
  }
}

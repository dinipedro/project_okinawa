import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { Reservation } from '../reservations/entities/reservation.entity';
import { Review } from '../reviews/entities/review.entity';
import { LoyaltyProgram } from '../loyalty/entities/loyalty-program.entity';
import { Tip } from '../tips/entities/tip.entity';
import { RestaurantTable } from '../tables/entities/restaurant-table.entity';
import { FinancialTransaction } from '../financial/entities/financial-transaction.entity';
import { Attendance } from '../hr/entities/attendance.entity';
import {
  MetricsCalculatorHelper,
  SalesAggregatorHelper,
  CustomerAnalyticsHelper,
  PerformanceMetricsHelper,
  ForecastHelper,
} from './helpers';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let orderRepository: Repository<Order>;
  let reservationRepository: Repository<Reservation>;
  let reviewRepository: Repository<Review>;
  let loyaltyProgramRepository: Repository<LoyaltyProgram>;
  let tipRepository: Repository<Tip>;
  let tableRepository: Repository<RestaurantTable>;
  let financialTransactionRepository: Repository<FinancialTransaction>;
  let attendanceRepository: Repository<Attendance>;

  const mockQueryBuilder = () => ({
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orWhere: jest.fn().mockReturnThis(),
    setParameters: jest.fn().mockReturnThis(),
    getRawOne: jest.fn(),
    getRawMany: jest.fn(),
    getCount: jest.fn(),
    getMany: jest.fn(),
    groupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: getRepositoryToken(Order),
          useValue: {
            count: jest.fn(),
            find: jest.fn(),
            createQueryBuilder: jest.fn(() => mockQueryBuilder()),
          },
        },
        {
          provide: getRepositoryToken(Reservation),
          useValue: {
            count: jest.fn(),
            find: jest.fn(),
            createQueryBuilder: jest.fn(() => mockQueryBuilder()),
          },
        },
        {
          provide: getRepositoryToken(Review),
          useValue: {
            count: jest.fn(),
            find: jest.fn(),
            createQueryBuilder: jest.fn(() => mockQueryBuilder()),
          },
        },
        {
          provide: getRepositoryToken(LoyaltyProgram),
          useValue: {
            find: jest.fn(),
            createQueryBuilder: jest.fn(() => mockQueryBuilder()),
          },
        },
        {
          provide: getRepositoryToken(Tip),
          useValue: {
            find: jest.fn(),
            createQueryBuilder: jest.fn(() => mockQueryBuilder()),
          },
        },
        {
          provide: getRepositoryToken(RestaurantTable),
          useValue: {
            count: jest.fn(),
            createQueryBuilder: jest.fn(() => mockQueryBuilder()),
          },
        },
        {
          provide: getRepositoryToken(FinancialTransaction),
          useValue: {
            createQueryBuilder: jest.fn(() => mockQueryBuilder()),
          },
        },
        {
          provide: getRepositoryToken(Attendance),
          useValue: {
            count: jest.fn(),
            find: jest.fn(),
            createQueryBuilder: jest.fn(() => mockQueryBuilder()),
          },
        },
        MetricsCalculatorHelper,
        SalesAggregatorHelper,
        CustomerAnalyticsHelper,
        PerformanceMetricsHelper,
        ForecastHelper,
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    orderRepository = module.get<Repository<Order>>(getRepositoryToken(Order));
    reservationRepository = module.get<Repository<Reservation>>(getRepositoryToken(Reservation));
    reviewRepository = module.get<Repository<Review>>(getRepositoryToken(Review));
    loyaltyProgramRepository = module.get<Repository<LoyaltyProgram>>(getRepositoryToken(LoyaltyProgram));
    tipRepository = module.get<Repository<Tip>>(getRepositoryToken(Tip));
    tableRepository = module.get<Repository<RestaurantTable>>(getRepositoryToken(RestaurantTable));
    financialTransactionRepository = module.get<Repository<FinancialTransaction>>(getRepositoryToken(FinancialTransaction));
    attendanceRepository = module.get<Repository<Attendance>>(getRepositoryToken(Attendance));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDashboardMetrics', () => {
    it('should return dashboard metrics', async () => {
      const mockOrdersMetrics = {
        today_revenue: 500,
        today_orders: 10,
        week_revenue: 3500,
        week_orders: 70,
        month_revenue: 15000,
        month_orders: 300,
        last_week_revenue: 3200,
        last_week_orders: 65,
        last_month_revenue: 14000,
        last_month_orders: 280,
      };

      const ordersQB = mockQueryBuilder();
      ordersQB.getRawOne.mockResolvedValue(mockOrdersMetrics);
      jest.spyOn(orderRepository, 'createQueryBuilder').mockReturnValue(ordersQB as any);

      const mockReservationsMetrics = {
        today_reservations: 5,
        week_reservations: 35,
        month_reservations: 150,
      };

      const reservationsQB = mockQueryBuilder();
      reservationsQB.getRawOne.mockResolvedValue(mockReservationsMetrics);
      jest.spyOn(reservationRepository, 'createQueryBuilder').mockReturnValue(reservationsQB as any);

      const result = await service.getDashboardMetrics('restaurant-1');

      expect(result).toBeDefined();
      expect(result.today).toBeDefined();
      expect(result.week).toBeDefined();
      expect(result.month).toBeDefined();
      expect(result.comparisons).toBeDefined();
    });
  });

  describe('getRealTimeMetrics', () => {
    it('should return real-time metrics', async () => {
      jest.spyOn(orderRepository, 'count').mockResolvedValue(10);
      jest.spyOn(reservationRepository, 'count').mockResolvedValue(5);
      jest.spyOn(tableRepository, 'count').mockResolvedValue(15);
      jest.spyOn(attendanceRepository, 'count').mockResolvedValue(8);
      jest.spyOn(orderRepository, 'find').mockResolvedValue([
        { total_amount: 50 },
        { total_amount: 75 },
      ] as any);

      const result = await service.getRealTimeMetrics('restaurant-1');

      expect(result).toBeDefined();
      expect(result.active_orders).toBe(10);
      expect(result.active_reservations).toBe(5);
      expect(result.occupied_tables).toBe(15);
      expect(result.staff_on_duty).toBe(8);
      expect(result.revenue_last_hour).toBeDefined();
    });
  });

  describe('getSalesAnalytics', () => {
    it('should return sales analytics', async () => {
      const mockOrders = [
        {
          id: 'order-1',
          total_amount: 100,
          created_at: new Date('2024-01-15T10:00:00'),
          items: [
            { menu_item_id: 'item-1', quantity: 2, unit_price: 25 },
            { menu_item_id: 'item-2', quantity: 1, unit_price: 50 },
          ]
        },
        {
          id: 'order-2',
          total_amount: 150,
          created_at: new Date('2024-01-15T14:00:00'),
          items: [
            { menu_item_id: 'item-1', quantity: 3, unit_price: 25 },
            { menu_item_id: 'item-3', quantity: 1, unit_price: 75 },
          ]
        },
      ];

      jest.spyOn(orderRepository, 'find').mockResolvedValue(mockOrders as any);

      const result = await service.getSalesAnalytics(
        'restaurant-1',
        new Date('2024-01-01'),
        new Date('2024-01-31'),
      );

      expect(result).toBeDefined();
      expect(result.total_revenue).toBe(250);
      expect(result.total_orders).toBe(2);
      expect(result.period).toBeDefined();
      expect(result.top_selling_items).toBeDefined();
      expect(result.sales_by_day).toBeDefined();
      expect(result.sales_by_hour).toBeDefined();
    });
  });

  describe('getCustomerAnalytics', () => {
    it('should return customer analytics', async () => {
      const mockOrders = [
        { user_id: 'user-1', total_amount: 100 },
        { user_id: 'user-2', total_amount: 150 },
        { user_id: 'user-1', total_amount: 75 },
      ];

      const mockLoyaltyPrograms = [
        { tier: 'gold', user_id: 'user-1', restaurant_id: 'restaurant-1' },
        { tier: 'silver', user_id: 'user-2', restaurant_id: 'restaurant-1' },
      ];

      jest.spyOn(orderRepository, 'find').mockResolvedValue(mockOrders as any);
      jest.spyOn(loyaltyProgramRepository, 'find').mockResolvedValue(mockLoyaltyPrograms as any);

      const result = await service.getCustomerAnalytics(
        'restaurant-1',
        new Date('2024-01-01'),
        new Date('2024-01-31'),
      );

      expect(result).toBeDefined();
      expect(result.total_customers).toBe(2);
      expect(result.loyalty_members).toBe(2);
    });
  });

  describe('getRestaurantPerformance', () => {
    it('should return restaurant performance metrics', async () => {
      const mockReviews = [
        { rating: 5, comment: 'Great!' },
        { rating: 4, comment: 'Good' },
      ];
      jest.spyOn(reviewRepository, 'find').mockResolvedValue(mockReviews as any);

      const mockReservations = [
        { id: 'res-1', status: 'completed' },
        { id: 'res-2', status: 'no_show' },
        { id: 'res-3', status: 'completed' },
      ];
      jest.spyOn(reservationRepository, 'find').mockResolvedValue(mockReservations as any);

      const mockTips = [
        { staff_id: 'staff-1', amount: 10 },
        { staff_id: 'staff-1', amount: 15 },
        { staff_id: 'staff-2', amount: 20 },
      ];
      jest.spyOn(tipRepository, 'find').mockResolvedValue(mockTips as any);

      const mockAttendances = [
        { status: 'present' },
        { status: 'late' },
        { status: 'absent' },
      ];
      jest.spyOn(attendanceRepository, 'find').mockResolvedValue(mockAttendances as any);

      const result = await service.getRestaurantPerformance('restaurant-1');

      expect(result).toBeDefined();
      expect(result.overall_rating).toBeDefined();
      expect(result.total_reviews).toBe(2);
      expect(result.rating_distribution).toBeDefined();
      expect(result.reservation_no_show_rate).toBeDefined();
      expect(result.staff_efficiency.average_tips_per_staff).toBeDefined();
      expect(result.staff_efficiency.attendance_rate).toBeDefined();
    });
  });

  describe('getRevenueForecast', () => {
    it('should return revenue forecast', async () => {
      const mockOrders = [
        { total_amount: 500, created_at: new Date('2024-01-01') },
        { total_amount: 550, created_at: new Date('2024-01-02') },
        { total_amount: 600, created_at: new Date('2024-01-03') },
      ];
      jest.spyOn(orderRepository, 'find').mockResolvedValue(mockOrders as any);

      const result = await service.getRevenueForecast('restaurant-1', 7);

      expect(result).toBeDefined();
      expect(result.forecast).toBeDefined();
      expect(result.confidence).toBeDefined();
      expect(Array.isArray(result.forecast)).toBe(true);
    });
  });
});

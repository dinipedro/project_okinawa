import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  const mockService = {
    getDashboardMetrics: jest.fn(),
    getRestaurantPerformance: jest.fn(),
    getCustomerInsights: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [{ provide: AnalyticsService, useValue: mockService }],
    }).overrideGuard(require('@/modules/auth/guards/jwt-auth.guard').JwtAuthGuard).useValue({ canActivate: () => true }).overrideGuard(require('@/modules/auth/guards/roles.guard').RolesGuard).useValue({ canActivate: () => true }).compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
    jest.clearAllMocks();
  });

  it('should get dashboard', async () => {
    mockService.getDashboardMetrics.mockResolvedValue({ total_orders: 100 });
    const result = await controller.getDashboard('restaurant-1');
    expect(result).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

describe('AiController', () => {
  let controller: AiController;
  const mockService = {
    analyzeSentiment: jest.fn(),
    getMenuRecommendations: jest.fn(),
    predictChurnRisk: jest.fn(),
    forecastDemand: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiController],
      providers: [{ provide: AiService, useValue: mockService }],
    }).overrideGuard(require('@/modules/auth/guards/jwt-auth.guard').JwtAuthGuard).useValue({ canActivate: () => true }).overrideGuard(require('@/modules/auth/guards/roles.guard').RolesGuard).useValue({ canActivate: () => true }).compile();

    controller = module.get<AiController>(AiController);
    jest.clearAllMocks();
  });

  it('should analyze sentiment', async () => {
    mockService.analyzeSentiment.mockResolvedValue({ sentiment: 'positive' });
    const result = await controller.analyzeSentiment('review-1');
    expect(result).toBeDefined();
  });
});

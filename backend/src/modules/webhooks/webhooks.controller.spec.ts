import { Test, TestingModule } from '@nestjs/testing';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';

describe('WebhooksController', () => {
  let controller: WebhooksController;
  const mockService = {
    createSubscription: jest.fn(),
    getSubscriptions: jest.fn(),
    deleteSubscription: jest.fn(),
    getDeliveries: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhooksController],
      providers: [{ provide: WebhooksService, useValue: mockService }],
    }).overrideGuard(require('@/modules/auth/guards/jwt-auth.guard').JwtAuthGuard).useValue({ canActivate: () => true }).overrideGuard(require('@/modules/auth/guards/roles.guard').RolesGuard).useValue({ canActivate: () => true }).compile();

    controller = module.get<WebhooksController>(WebhooksController);
    jest.clearAllMocks();
  });

  it('should create subscription', async () => {
    mockService.createSubscription.mockResolvedValue({ id: 'sub-1' });
    const result = await controller.createSubscription({} as any);
    expect(result).toBeDefined();
  });
});

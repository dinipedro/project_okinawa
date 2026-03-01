import { Test, TestingModule } from '@nestjs/testing';
import { PaymentSplitController } from './payment-split.controller';
import { PaymentSplitService } from './payment-split.service';

describe('PaymentSplitController', () => {
  let controller: PaymentSplitController;
  const mockService = {
    calculateSplit: jest.fn(),
    createPaymentSplit: jest.fn(),
    createPaymentSplits: jest.fn(),
    getOrderSplits: jest.fn(),
    getPaymentStatus: jest.fn(),
    getGuestSplits: jest.fn(),
    processSplitPayment: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentSplitController],
      providers: [{ provide: PaymentSplitService, useValue: mockService }],
    })
      .overrideGuard(require('@/modules/auth/guards/jwt-auth.guard').JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PaymentSplitController>(PaymentSplitController);
    jest.clearAllMocks();
  });

  it('should calculate split', async () => {
    mockService.calculateSplit.mockResolvedValue([{ guest_user_id: 'user-1', total: 50 }]);
    const result = await controller.calculateSplit({ order_id: 'order-1' } as any);
    expect(result).toBeDefined();
  });

  it('should create split', async () => {
    mockService.createPaymentSplit.mockResolvedValue({ id: 'split-1' });
    const result = await controller.createSplit({ order_id: 'order-1' } as any);
    expect(result).toBeDefined();
  });

  it('should create all splits', async () => {
    mockService.createPaymentSplits.mockResolvedValue([{ id: 'split-1' }]);
    const result = await controller.createAllSplits('order-1', 'individual' as any);
    expect(result).toBeDefined();
  });
});

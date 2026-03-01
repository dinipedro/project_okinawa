import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebhooksService } from './webhooks.service';
import { WebhookSubscription } from './entities/webhook-subscription.entity';
import { WebhookDelivery } from './entities/webhook-delivery.entity';
import { NotFoundException } from '@nestjs/common';

describe('WebhooksService', () => {
  let service: WebhooksService;
  let subscriptionRepository: Repository<WebhookSubscription>;
  let deliveryRepository: Repository<WebhookDelivery>;

  const mockSubscription = {
    id: 'sub-1',
    restaurant_id: 'restaurant-1',
    url: 'https://example.com/webhook',
    events: ['order.created', 'order.updated'],
    secret: 'secret-key',
    is_active: true,
    created_at: new Date(),
  };

  const mockDelivery = {
    id: 'delivery-1',
    subscription_id: 'sub-1',
    event_type: 'order.created',
    payload: { order_id: 'order-1' },
    status: 'pending',
    attempt_count: 0,
    created_at: new Date(),
  };

  const mockSubscriptionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockDeliveryRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhooksService,
        { provide: getRepositoryToken(WebhookSubscription), useValue: mockSubscriptionRepository },
        { provide: getRepositoryToken(WebhookDelivery), useValue: mockDeliveryRepository },
      ],
    }).compile();

    service = module.get<WebhooksService>(WebhooksService);
    subscriptionRepository = module.get(getRepositoryToken(WebhookSubscription));
    deliveryRepository = module.get(getRepositoryToken(WebhookDelivery));

    jest.clearAllMocks();
  });

  describe('createSubscription', () => {
    it('should create a webhook subscription', async () => {
      const createDto = {
        restaurant_id: 'restaurant-1',
        url: 'https://example.com/webhook',
        events: ['order.created'],
      };

      mockSubscriptionRepository.create.mockReturnValue(mockSubscription);
      mockSubscriptionRepository.save.mockResolvedValue(mockSubscription);

      const result = await service.createSubscription(createDto as any);

      expect(result).toBeDefined();
      expect(mockSubscriptionRepository.create).toHaveBeenCalled();
      expect(mockSubscriptionRepository.save).toHaveBeenCalled();
    });
  });

  describe('getSubscriptions', () => {
    it('should return all subscriptions for a restaurant', async () => {
      mockSubscriptionRepository.find.mockResolvedValue([mockSubscription]);

      const result = await service.getSubscriptions('restaurant-1');

      expect(result).toEqual([mockSubscription]);
      expect(mockSubscriptionRepository.find).toHaveBeenCalledWith({
        where: { restaurant_id: 'restaurant-1' },
        order: { created_at: 'DESC' },
      });
    });
  });

  describe('getSubscription', () => {
    it('should return a subscription by id', async () => {
      mockSubscriptionRepository.findOne.mockResolvedValue(mockSubscription);

      const result = await service.getSubscription('sub-1');

      expect(result).toEqual(mockSubscription);
    });

    it('should throw NotFoundException if not found', async () => {
      mockSubscriptionRepository.findOne.mockResolvedValue(null);

      await expect(service.getSubscription('sub-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateSubscription', () => {
    it('should update a subscription', async () => {
      mockSubscriptionRepository.findOne.mockResolvedValue(mockSubscription);
      mockSubscriptionRepository.save.mockResolvedValue({
        ...mockSubscription,
        is_active: false,
      });

      const result = await service.updateSubscription('sub-1', { is_active: false } as any);

      expect(result.is_active).toBe(false);
    });

    it('should throw NotFoundException if not found', async () => {
      mockSubscriptionRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateSubscription('sub-1', { is_active: false } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteSubscription', () => {
    it('should delete a subscription', async () => {
      mockSubscriptionRepository.findOne.mockResolvedValue(mockSubscription);
      mockSubscriptionRepository.remove.mockResolvedValue(mockSubscription);

      const result = await service.deleteSubscription('sub-1');

      expect(result).toEqual({ message: 'Webhook subscription deleted successfully' });
    });
  });

  describe('getDeliveries', () => {
    it('should return deliveries for a subscription', async () => {
      mockDeliveryRepository.findAndCount.mockResolvedValue([[mockDelivery], 1]);

      const result = await service.getDeliveries('sub-1');

      expect(result).toBeDefined();
      expect(result.deliveries).toEqual([mockDelivery]);
      expect(result.total).toBe(1);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FraudDetectionService } from './fraud-detection.service';
import {
  FraudAlert,
  AlertType,
  AlertSeverity,
  AlertStatus,
} from './entities/fraud-alert.entity';
import { Order } from '../orders/entities/order.entity';
import { Review } from '../reviews/entities/review.entity';

describe('FraudDetectionService', () => {
  let service: FraudDetectionService;
  let alertRepository: Repository<FraudAlert>;
  let orderRepository: Repository<Order>;
  let reviewRepository: Repository<Review>;

  const mockAlertRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockOrderRepository = {
    count: jest.fn(),
    find: jest.fn(),
  };

  const mockReviewRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FraudDetectionService,
        {
          provide: getRepositoryToken(FraudAlert),
          useValue: mockAlertRepository,
        },
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrderRepository,
        },
        {
          provide: getRepositoryToken(Review),
          useValue: mockReviewRepository,
        },
      ],
    }).compile();

    service = module.get<FraudDetectionService>(FraudDetectionService);
    alertRepository = module.get<Repository<FraudAlert>>(
      getRepositoryToken(FraudAlert),
    );
    orderRepository = module.get<Repository<Order>>(
      getRepositoryToken(Order),
    );
    reviewRepository = module.get<Repository<Review>>(
      getRepositoryToken(Review),
    );

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ==========================================================
  // checkTransactionVelocity
  // ==========================================================
  describe('checkTransactionVelocity', () => {
    const userId = 'user-123';

    it('should return null when transaction count and amount are within limits', async () => {
      mockOrderRepository.count.mockResolvedValue(2);
      mockOrderRepository.find.mockResolvedValue([]);

      const result = await service.checkTransactionVelocity(userId, 100);

      expect(result).toBeNull();
      expect(mockOrderRepository.count).toHaveBeenCalled();
    });

    it('should create HIGH alert when count exceeds 5 in 10 minutes', async () => {
      mockOrderRepository.count.mockResolvedValue(6);

      const savedAlert = {
        id: 'alert-1',
        user_id: userId,
        alert_type: AlertType.VELOCITY,
        severity: AlertSeverity.HIGH,
        status: AlertStatus.PENDING,
        details: { trigger: 'count_threshold', count: 6 },
      };
      mockAlertRepository.create.mockReturnValue(savedAlert);
      mockAlertRepository.save.mockResolvedValue(savedAlert);

      const result = await service.checkTransactionVelocity(userId, 100);

      expect(result).toBeDefined();
      expect(result!.alert_type).toBe(AlertType.VELOCITY);
      expect(result!.severity).toBe(AlertSeverity.HIGH);
      expect(mockAlertRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: userId,
          alert_type: AlertType.VELOCITY,
          severity: AlertSeverity.HIGH,
          status: AlertStatus.PENDING,
        }),
      );
    });

    it('should create CRITICAL alert when single amount exceeds R$5000', async () => {
      mockOrderRepository.count.mockResolvedValue(1);
      mockOrderRepository.find.mockResolvedValue([
        { id: 'order-1', created_at: new Date() },
      ]);

      const savedAlert = {
        id: 'alert-2',
        user_id: userId,
        alert_type: AlertType.VELOCITY,
        severity: AlertSeverity.CRITICAL,
        status: AlertStatus.PENDING,
        details: { trigger: 'amount_threshold' },
      };
      mockAlertRepository.create.mockReturnValue(savedAlert);
      mockAlertRepository.save.mockResolvedValue(savedAlert);

      const result = await service.checkTransactionVelocity(userId, 6000);

      expect(result).toBeDefined();
      expect(result!.severity).toBe(AlertSeverity.CRITICAL);
    });

    it('should create CRITICAL alert when estimated hourly total exceeds R$5000', async () => {
      mockOrderRepository.count.mockResolvedValue(3);
      mockOrderRepository.find.mockResolvedValue([
        { id: 'o1', created_at: new Date() },
        { id: 'o2', created_at: new Date() },
        { id: 'o3', created_at: new Date() },
      ]);

      const savedAlert = {
        id: 'alert-3',
        user_id: userId,
        alert_type: AlertType.VELOCITY,
        severity: AlertSeverity.CRITICAL,
        status: AlertStatus.PENDING,
        details: { trigger: 'amount_threshold' },
      };
      mockAlertRepository.create.mockReturnValue(savedAlert);
      mockAlertRepository.save.mockResolvedValue(savedAlert);

      // amount=2000, 3 recent orders => estimatedTotal = 2000 + (3*2000) = 8000 > 5000
      const result = await service.checkTransactionVelocity(userId, 2000);

      expect(result).toBeDefined();
      expect(result!.severity).toBe(AlertSeverity.CRITICAL);
    });

    it('should return null when amount is below threshold and no recent orders', async () => {
      mockOrderRepository.count.mockResolvedValue(0);
      mockOrderRepository.find.mockResolvedValue([]);

      const result = await service.checkTransactionVelocity(userId, 500);

      expect(result).toBeNull();
    });
  });

  // ==========================================================
  // checkGeographicAnomaly
  // ==========================================================
  describe('checkGeographicAnomaly', () => {
    const userId = 'user-456';

    it('should return null when no previous IP history exists', async () => {
      mockAlertRepository.find.mockResolvedValue([]);

      const result = await service.checkGeographicAnomaly(userId, '192.168.1.1');

      expect(result).toBeNull();
    });

    it('should return null when IP prefix matches previous IP', async () => {
      mockAlertRepository.find.mockResolvedValue([
        {
          id: 'alert-old',
          user_id: userId,
          details: { current_ip: '192.168.5.10' },
          created_at: new Date(),
        },
      ]);

      const result = await service.checkGeographicAnomaly(
        userId,
        '192.168.99.99',
      );

      expect(result).toBeNull();
    });

    it('should create MEDIUM alert when IP prefix changes', async () => {
      mockAlertRepository.find.mockResolvedValue([
        {
          id: 'alert-old',
          user_id: userId,
          details: { current_ip: '192.168.1.1' },
          created_at: new Date(),
        },
      ]);

      const savedAlert = {
        id: 'alert-geo',
        user_id: userId,
        alert_type: AlertType.GEOGRAPHIC,
        severity: AlertSeverity.MEDIUM,
        status: AlertStatus.PENDING,
        details: {
          previous_ip: '192.168.*.*',
          current_ip: '10.0.1.1',
          previous_prefix: '192.168',
          current_prefix: '10.0',
        },
      };
      mockAlertRepository.create.mockReturnValue(savedAlert);
      mockAlertRepository.save.mockResolvedValue(savedAlert);

      const result = await service.checkGeographicAnomaly(userId, '10.0.1.1');

      expect(result).toBeDefined();
      expect(result!.alert_type).toBe(AlertType.GEOGRAPHIC);
      expect(result!.severity).toBe(AlertSeverity.MEDIUM);
    });

    it('should return null when last known IP has no details.current_ip', async () => {
      mockAlertRepository.find.mockResolvedValue([
        {
          id: 'alert-no-ip',
          user_id: userId,
          details: {},
          created_at: new Date(),
        },
      ]);

      const result = await service.checkGeographicAnomaly(userId, '10.0.1.1');

      expect(result).toBeNull();
    });
  });

  // ==========================================================
  // checkReviewManipulation
  // ==========================================================
  describe('checkReviewManipulation', () => {
    const userId = 'user-789';

    it('should return null when few reviews exist', async () => {
      mockReviewRepository.find.mockResolvedValue([
        { id: 'r1', comment: 'Great food', created_at: new Date() },
      ]);

      const result = await service.checkReviewManipulation(userId);

      expect(result).toBeNull();
    });

    it('should create HIGH alert when more than 3 reviews in 1 hour', async () => {
      const reviews = [
        { id: 'r1', comment: 'Review 1', created_at: new Date(), restaurant_id: 'rest-1' },
        { id: 'r2', comment: 'Review 2', created_at: new Date(), restaurant_id: 'rest-2' },
        { id: 'r3', comment: 'Review 3', created_at: new Date(), restaurant_id: 'rest-3' },
        { id: 'r4', comment: 'Review 4', created_at: new Date(), restaurant_id: 'rest-4' },
      ];
      mockReviewRepository.find.mockResolvedValue(reviews);

      const savedAlert = {
        id: 'alert-review',
        user_id: userId,
        alert_type: AlertType.REVIEW_MANIPULATION,
        severity: AlertSeverity.HIGH,
        status: AlertStatus.PENDING,
        details: { trigger: 'frequency_threshold', count: 4 },
      };
      mockAlertRepository.create.mockReturnValue(savedAlert);
      mockAlertRepository.save.mockResolvedValue(savedAlert);

      const result = await service.checkReviewManipulation(userId);

      expect(result).toBeDefined();
      expect(result!.alert_type).toBe(AlertType.REVIEW_MANIPULATION);
      expect(result!.details.trigger).toBe('frequency_threshold');
    });

    it('should create HIGH alert when duplicate review text is detected', async () => {
      const reviews = [
        { id: 'r1', comment: 'Great food!', created_at: new Date(), restaurant_id: 'rest-1' },
        { id: 'r2', comment: 'Great food!', created_at: new Date(), restaurant_id: 'rest-2' },
      ];
      mockReviewRepository.find.mockResolvedValue(reviews);

      const savedAlert = {
        id: 'alert-dup',
        user_id: userId,
        alert_type: AlertType.REVIEW_MANIPULATION,
        severity: AlertSeverity.HIGH,
        status: AlertStatus.PENDING,
        details: { trigger: 'duplicate_text' },
      };
      mockAlertRepository.create.mockReturnValue(savedAlert);
      mockAlertRepository.save.mockResolvedValue(savedAlert);

      const result = await service.checkReviewManipulation(userId);

      expect(result).toBeDefined();
      expect(result!.details.trigger).toBe('duplicate_text');
    });

    it('should return null when reviews have different text', async () => {
      const reviews = [
        { id: 'r1', comment: 'Great food!', created_at: new Date(), restaurant_id: 'rest-1' },
        { id: 'r2', comment: 'Nice ambiance', created_at: new Date(), restaurant_id: 'rest-2' },
        { id: 'r3', comment: 'Good service', created_at: new Date(), restaurant_id: 'rest-3' },
      ];
      mockReviewRepository.find.mockResolvedValue(reviews);

      const result = await service.checkReviewManipulation(userId);

      expect(result).toBeNull();
    });

    it('should return null when no reviews exist', async () => {
      mockReviewRepository.find.mockResolvedValue([]);

      const result = await service.checkReviewManipulation(userId);

      expect(result).toBeNull();
    });
  });

  // ==========================================================
  // createAlert
  // ==========================================================
  describe('createAlert', () => {
    it('should create and save a fraud alert', async () => {
      const userId = 'user-abc';
      const details = { key: 'value' };
      const savedAlert = {
        id: 'new-alert',
        user_id: userId,
        alert_type: AlertType.VELOCITY,
        severity: AlertSeverity.HIGH,
        status: AlertStatus.PENDING,
        details,
      };

      mockAlertRepository.create.mockReturnValue(savedAlert);
      mockAlertRepository.save.mockResolvedValue(savedAlert);

      const result = await service.createAlert(
        userId,
        AlertType.VELOCITY,
        AlertSeverity.HIGH,
        details,
      );

      expect(result.id).toBe('new-alert');
      expect(result.status).toBe(AlertStatus.PENDING);
      expect(mockAlertRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: userId,
          alert_type: AlertType.VELOCITY,
          severity: AlertSeverity.HIGH,
          status: AlertStatus.PENDING,
        }),
      );
      expect(mockAlertRepository.save).toHaveBeenCalled();
    });
  });

  // ==========================================================
  // resolveAlert
  // ==========================================================
  describe('resolveAlert', () => {
    it('should resolve an existing alert', async () => {
      const alert = {
        id: 'alert-to-resolve',
        user_id: 'user-1',
        status: AlertStatus.PENDING,
        resolved_by: null as string | null,
        resolved_at: null as Date | null,
      };
      mockAlertRepository.findOne.mockResolvedValue(alert);
      mockAlertRepository.save.mockImplementation((a) => Promise.resolve(a));

      const result = await service.resolveAlert(
        'alert-to-resolve',
        'admin-1',
        AlertStatus.RESOLVED,
      );

      expect(result.status).toBe(AlertStatus.RESOLVED);
      expect(result.resolved_by).toBe('admin-1');
      expect(result.resolved_at).toBeInstanceOf(Date);
    });

    it('should resolve as false positive', async () => {
      const alert = {
        id: 'alert-fp',
        user_id: 'user-1',
        status: AlertStatus.INVESTIGATING,
        resolved_by: null as string | null,
        resolved_at: null as Date | null,
      };
      mockAlertRepository.findOne.mockResolvedValue(alert);
      mockAlertRepository.save.mockImplementation((a) => Promise.resolve(a));

      const result = await service.resolveAlert(
        'alert-fp',
        'admin-2',
        AlertStatus.FALSE_POSITIVE,
      );

      expect(result.status).toBe(AlertStatus.FALSE_POSITIVE);
      expect(result.resolved_by).toBe('admin-2');
    });

    it('should throw when alert is not found', async () => {
      mockAlertRepository.findOne.mockResolvedValue(null);

      await expect(
        service.resolveAlert('non-existent', 'admin-1', AlertStatus.RESOLVED),
      ).rejects.toThrow('Alert not found');
    });
  });
});

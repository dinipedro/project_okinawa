import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataExportService } from './data-export.service';
import { Profile } from './entities/profile.entity';
import { Order } from '@/modules/orders/entities/order.entity';
import { Reservation } from '@/modules/reservations/entities/reservation.entity';
import { Review } from '@/modules/reviews/entities/review.entity';
import { Favorite } from '@/modules/favorites/entities/favorite.entity';
import { LoyaltyProgram } from '@/modules/loyalty/entities/loyalty-program.entity';
import { StampCard } from '@/modules/loyalty/entities/stamp-card.entity';
import { Tip } from '@/modules/tips/entities/tip.entity';
import { Wallet } from '@/modules/payments/entities/wallet.entity';
import { WalletTransaction } from '@/modules/payments/entities/wallet-transaction.entity';
import { Notification } from '@/modules/notifications/entities/notification.entity';
import { UserConsent } from '@/modules/identity/entities/user-consent.entity';
import { AuditLog } from '@/modules/identity/entities/audit-log.entity';

describe('DataExportService', () => {
  let service: DataExportService;

  const mockProfileRepository = {
    findOne: jest.fn(),
  };

  const mockOrderRepository = {
    find: jest.fn(),
  };

  const mockReservationRepository = {
    find: jest.fn(),
  };

  const mockReviewRepository = {
    find: jest.fn(),
  };

  const mockFavoriteRepository = {
    find: jest.fn(),
  };

  const mockLoyaltyRepository = {
    find: jest.fn(),
  };

  const mockStampCardRepository = {
    find: jest.fn(),
  };

  const mockTipRepository = {
    find: jest.fn(),
  };

  const mockWalletRepository = {
    find: jest.fn(),
  };

  const mockWalletTransactionRepository = {
    find: jest.fn(),
  };

  const mockNotificationRepository = {
    find: jest.fn(),
  };

  const mockConsentRepository = {
    find: jest.fn(),
  };

  const mockAuditLogRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataExportService,
        {
          provide: getRepositoryToken(Profile),
          useValue: mockProfileRepository,
        },
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrderRepository,
        },
        {
          provide: getRepositoryToken(Reservation),
          useValue: mockReservationRepository,
        },
        {
          provide: getRepositoryToken(Review),
          useValue: mockReviewRepository,
        },
        {
          provide: getRepositoryToken(Favorite),
          useValue: mockFavoriteRepository,
        },
        {
          provide: getRepositoryToken(LoyaltyProgram),
          useValue: mockLoyaltyRepository,
        },
        {
          provide: getRepositoryToken(StampCard),
          useValue: mockStampCardRepository,
        },
        {
          provide: getRepositoryToken(Tip),
          useValue: mockTipRepository,
        },
        {
          provide: getRepositoryToken(Wallet),
          useValue: mockWalletRepository,
        },
        {
          provide: getRepositoryToken(WalletTransaction),
          useValue: mockWalletTransactionRepository,
        },
        {
          provide: getRepositoryToken(Notification),
          useValue: mockNotificationRepository,
        },
        {
          provide: getRepositoryToken(UserConsent),
          useValue: mockConsentRepository,
        },
        {
          provide: getRepositoryToken(AuditLog),
          useValue: mockAuditLogRepository,
        },
      ],
    }).compile();

    service = module.get<DataExportService>(DataExportService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ==========================================================
  // exportUserData
  // ==========================================================
  describe('exportUserData', () => {
    const userId = 'user-export-1';

    const mockProfile = {
      id: userId,
      email: 'john@example.com',
      full_name: 'John Doe',
      phone: '+5511999999999',
      dietary_restrictions: ['vegetarian'],
      favorite_cuisines: ['japanese'],
      preferences: { dark_mode: true },
      created_at: new Date('2025-01-01'),
    };

    beforeEach(() => {
      // Default: return empty arrays for all repositories
      mockProfileRepository.findOne.mockResolvedValue(mockProfile);
      mockOrderRepository.find.mockResolvedValue([]);
      mockReservationRepository.find.mockResolvedValue([]);
      mockReviewRepository.find.mockResolvedValue([]);
      mockFavoriteRepository.find.mockResolvedValue([]);
      mockLoyaltyRepository.find.mockResolvedValue([]);
      mockStampCardRepository.find.mockResolvedValue([]);
      mockTipRepository.find.mockResolvedValue([]);
      mockWalletRepository.find.mockResolvedValue([]);
      mockNotificationRepository.find.mockResolvedValue([]);
      mockConsentRepository.find.mockResolvedValue([]);
      mockAuditLogRepository.find.mockResolvedValue([]);
    });

    it('should export user data with profile information', async () => {
      const result = await service.exportUserData(userId);

      expect(result.user_id).toBe(userId);
      expect(result.profile.email).toBe('john@example.com');
      expect(result.profile.full_name).toBe('John Doe');
      expect(result.profile.phone).toBe('+5511999999999');
      expect(result.export_date).toBeDefined();
    });

    it('should include orders with items', async () => {
      const mockOrders = [
        {
          id: 'order-1',
          restaurant_id: 'rest-1',
          order_type: 'dine_in',
          status: 'completed',
          subtotal: 50,
          total_amount: 55,
          items: [
            {
              menu_item_id: 'menu-1',
              quantity: 2,
              unit_price: 25,
              special_instructions: 'no onions',
            },
          ],
          created_at: new Date(),
        },
      ];
      mockOrderRepository.find.mockResolvedValue(mockOrders);

      const result = await service.exportUserData(userId);

      expect(result.orders).toHaveLength(1);
      expect(result.orders[0].id).toBe('order-1');
      expect(result.orders[0].items).toHaveLength(1);
      expect(result.orders[0].items[0].special_instructions).toBe('no onions');
    });

    it('should include reservations', async () => {
      const mockReservations = [
        {
          id: 'res-1',
          restaurant_id: 'rest-1',
          reservation_date: new Date(),
          reservation_time: '19:00',
          party_size: 4,
          status: 'confirmed',
          special_requests: 'Window table',
          created_at: new Date(),
        },
      ];
      mockReservationRepository.find.mockResolvedValue(mockReservations);

      const result = await service.exportUserData(userId);

      expect(result.reservations).toHaveLength(1);
      expect(result.reservations[0].party_size).toBe(4);
    });

    it('should include reviews', async () => {
      const mockReviews = [
        {
          id: 'rev-1',
          restaurant_id: 'rest-1',
          rating: 5,
          food_rating: 5,
          service_rating: 4,
          ambiance_rating: 5,
          value_rating: 4,
          comment: 'Excellent!',
          created_at: new Date(),
        },
      ];
      mockReviewRepository.find.mockResolvedValue(mockReviews);

      const result = await service.exportUserData(userId);

      expect(result.reviews).toHaveLength(1);
      expect(result.reviews[0].rating).toBe(5);
    });

    it('should flatten wallet transactions from multiple wallets', async () => {
      const mockWallets = [
        {
          user_id: userId,
          transactions: [
            {
              id: 'wt-1',
              transaction_type: 'credit',
              amount: 100,
              balance_before: 0,
              balance_after: 100,
              description: 'Deposit',
              created_at: new Date(),
            },
          ],
        },
        {
          user_id: userId,
          transactions: [
            {
              id: 'wt-2',
              transaction_type: 'debit',
              amount: 50,
              balance_before: 100,
              balance_after: 50,
              description: 'Payment',
              created_at: new Date(),
            },
          ],
        },
      ];
      mockWalletRepository.find.mockResolvedValue(mockWallets);

      const result = await service.exportUserData(userId);

      expect(result.wallet_transactions).toHaveLength(2);
      expect(result.wallet_transactions[0].id).toBe('wt-1');
      expect(result.wallet_transactions[1].id).toBe('wt-2');
    });

    it('should handle missing profile gracefully', async () => {
      mockProfileRepository.findOne.mockResolvedValue(null);

      const result = await service.exportUserData(userId);

      expect(result.profile.email).toBe('');
      expect(result.profile.full_name).toBeNull();
      expect(result.profile.phone).toBeNull();
    });

    it('should include consent history', async () => {
      const mockConsents = [
        {
          consent_type: 'privacy_policy',
          version: '1.0',
          version_hash: 'abc123',
          accepted_at: new Date(),
          revoked_at: null,
          ip_address: '192.168.1.1',
          device_id: 'device-1',
        },
      ];
      mockConsentRepository.find.mockResolvedValue(mockConsents);

      const result = await service.exportUserData(userId);

      expect(result.consent_history).toHaveLength(1);
      expect(result.consent_history[0].consent_type).toBe('privacy_policy');
      expect(result.consent_history[0].version).toBe('1.0');
    });

    it('should include audit trail limited to 500 entries', async () => {
      mockAuditLogRepository.find.mockResolvedValue([
        {
          action: 'login',
          entity_type: 'session',
          success: true,
          ip_address: '10.0.0.1',
          created_at: new Date(),
        },
      ]);

      const result = await service.exportUserData(userId);

      expect(result.audit_trail).toHaveLength(1);
      expect(mockAuditLogRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user_id: userId },
          take: 500,
        }),
      );
    });

    it('should handle orders with null items array', async () => {
      mockOrderRepository.find.mockResolvedValue([
        {
          id: 'order-no-items',
          restaurant_id: 'rest-1',
          order_type: 'takeout',
          status: 'pending',
          subtotal: 0,
          total_amount: 0,
          items: null,
          created_at: new Date(),
        },
      ]);

      const result = await service.exportUserData(userId);

      expect(result.orders[0].items).toEqual([]);
    });
  });

  // ==========================================================
  // generateDownloadToken
  // ==========================================================
  describe('generateDownloadToken', () => {
    it('should generate a base64url-encoded token', () => {
      const result = service.generateDownloadToken('user-123');

      expect(result.token).toBeDefined();
      expect(result.token.length).toBeGreaterThan(0);
      expect(result.expires_at).toBeDefined();
    });

    it('should set expiration to 72 hours from now', () => {
      const before = Date.now();
      const result = service.generateDownloadToken('user-123');
      const after = Date.now();

      const expiresAt = new Date(result.expires_at).getTime();
      const expectedMin = before + 72 * 60 * 60 * 1000;
      const expectedMax = after + 72 * 60 * 60 * 1000;

      expect(expiresAt).toBeGreaterThanOrEqual(expectedMin);
      expect(expiresAt).toBeLessThanOrEqual(expectedMax);
    });

    it('should encode user ID in the token', () => {
      const result = service.generateDownloadToken('user-456');
      const decoded = Buffer.from(result.token, 'base64url').toString('utf-8');

      expect(decoded).toContain('user-456');
    });
  });

  // ==========================================================
  // validateDownloadToken
  // ==========================================================
  describe('validateDownloadToken', () => {
    it('should return user ID for a valid, non-expired token', () => {
      const { token } = service.generateDownloadToken('user-valid');

      const result = service.validateDownloadToken(token);

      expect(result).toBe('user-valid');
    });

    it('should return null for an expired token', () => {
      const expiredTimestamp = Date.now() - 1000; // 1 second ago
      const payload = `user-expired:${expiredTimestamp}`;
      const token = Buffer.from(payload).toString('base64url');

      const result = service.validateDownloadToken(token);

      expect(result).toBeNull();
    });

    it('should return null for an invalid token', () => {
      const result = service.validateDownloadToken('totally-invalid-token!!!');

      expect(result).toBeNull();
    });

    it('should return null for a token with missing user ID', () => {
      const payload = `:${Date.now() + 100000}`;
      const token = Buffer.from(payload).toString('base64url');

      const result = service.validateDownloadToken(token);

      expect(result).toBeNull();
    });

    it('should return null for a token with invalid expiration', () => {
      const payload = 'user-bad:not-a-number';
      const token = Buffer.from(payload).toString('base64url');

      const result = service.validateDownloadToken(token);

      expect(result).toBeNull();
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataRetentionService } from './data-retention.service';
import { Profile } from './entities/profile.entity';
import { AuditLog, AuditAction } from '@/modules/identity/entities/audit-log.entity';
import { Reservation } from '@/modules/reservations/entities/reservation.entity';
import { UserConsent, ConsentType } from '@/modules/identity/entities/user-consent.entity';
import { Notification } from '@/modules/notifications/entities/notification.entity';

describe('DataRetentionService', () => {
  let service: DataRetentionService;

  // QueryBuilder mocks
  const mockProfileQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  const mockAuditLogDeleteBuilder = {
    delete: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    execute: jest.fn(),
  };

  const mockConsentQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  const mockNotificationDeleteBuilder = {
    delete: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    execute: jest.fn(),
  };

  const mockProfileRepository = {
    createQueryBuilder: jest.fn(() => mockProfileQueryBuilder),
    save: jest.fn(),
  };

  const mockAuditLogRepository = {
    createQueryBuilder: jest.fn(() => mockAuditLogDeleteBuilder),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockReservationRepository = {
    find: jest.fn(),
    save: jest.fn(),
  };

  const mockUserConsentRepository = {
    createQueryBuilder: jest.fn(() => mockConsentQueryBuilder),
  };

  const mockNotificationRepository = {
    createQueryBuilder: jest.fn(() => mockNotificationDeleteBuilder),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataRetentionService,
        {
          provide: getRepositoryToken(Profile),
          useValue: mockProfileRepository,
        },
        {
          provide: getRepositoryToken(AuditLog),
          useValue: mockAuditLogRepository,
        },
        {
          provide: getRepositoryToken(Reservation),
          useValue: mockReservationRepository,
        },
        {
          provide: getRepositoryToken(UserConsent),
          useValue: mockUserConsentRepository,
        },
        {
          provide: getRepositoryToken(Notification),
          useValue: mockNotificationRepository,
        },
      ],
    }).compile();

    service = module.get<DataRetentionService>(DataRetentionService);

    jest.clearAllMocks();

    // Re-set up chainable return values after clearAllMocks
    mockProfileQueryBuilder.where.mockReturnThis();
    mockProfileQueryBuilder.andWhere.mockReturnThis();

    mockAuditLogDeleteBuilder.delete.mockReturnThis();
    mockAuditLogDeleteBuilder.from.mockReturnThis();
    mockAuditLogDeleteBuilder.where.mockReturnThis();
    mockAuditLogDeleteBuilder.andWhere.mockReturnThis();

    mockConsentQueryBuilder.where.mockReturnThis();
    mockConsentQueryBuilder.andWhere.mockReturnThis();

    mockNotificationDeleteBuilder.delete.mockReturnThis();
    mockNotificationDeleteBuilder.from.mockReturnThis();
    mockNotificationDeleteBuilder.where.mockReturnThis();
    mockNotificationDeleteBuilder.andWhere.mockReturnThis();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ==========================================================
  // anonymizeInactiveAccounts
  // ==========================================================
  describe('anonymizeInactiveAccounts', () => {
    it('should anonymize profiles inactive for 2+ years', async () => {
      const inactiveProfiles = [
        {
          id: 'user-old-1',
          email: 'old.user@example.com',
          full_name: 'Old User',
          phone: '+5511888888888',
          avatar_url: 'https://example.com/avatar.png',
          default_address: { street: '123 St' },
          dietary_restrictions: ['vegan'],
          favorite_cuisines: ['italian'],
          preferences: { lang: 'pt-BR' },
          is_active: true,
        },
      ];

      mockProfileQueryBuilder.getMany.mockResolvedValue(inactiveProfiles);
      mockProfileRepository.save.mockImplementation((p) => Promise.resolve(p));
      mockAuditLogRepository.create.mockImplementation((data) => data);
      mockAuditLogRepository.save.mockResolvedValue({});

      const count = await service.anonymizeInactiveAccounts();

      expect(count).toBe(1);
      expect(mockProfileRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          full_name: 'Anonymized User',
          phone: null,
          avatar_url: null,
          default_address: null,
          dietary_restrictions: null,
          favorite_cuisines: null,
          preferences: null,
          is_active: false,
        }),
      );
      // Email should be anonymized with hash prefix
      const savedProfile = mockProfileRepository.save.mock.calls[0][0];
      expect(savedProfile.email).toMatch(/^anon_[a-f0-9]{16}@anonymized\.local$/);
    });

    it('should return 0 when no inactive accounts exist', async () => {
      mockProfileQueryBuilder.getMany.mockResolvedValue([]);

      const count = await service.anonymizeInactiveAccounts();

      expect(count).toBe(0);
      expect(mockProfileRepository.save).not.toHaveBeenCalled();
    });

    it('should anonymize multiple profiles', async () => {
      const inactiveProfiles = [
        {
          id: 'user-1',
          email: 'user1@test.com',
          full_name: 'User 1',
          phone: '+5511111',
          avatar_url: null,
          default_address: null,
          dietary_restrictions: null,
          favorite_cuisines: null,
          preferences: null,
          is_active: true,
        },
        {
          id: 'user-2',
          email: 'user2@test.com',
          full_name: 'User 2',
          phone: '+5522222',
          avatar_url: null,
          default_address: null,
          dietary_restrictions: null,
          favorite_cuisines: null,
          preferences: null,
          is_active: true,
        },
      ];

      mockProfileQueryBuilder.getMany.mockResolvedValue(inactiveProfiles);
      mockProfileRepository.save.mockImplementation((p) => Promise.resolve(p));
      mockAuditLogRepository.create.mockImplementation((data) => data);
      mockAuditLogRepository.save.mockResolvedValue({});

      const count = await service.anonymizeInactiveAccounts();

      expect(count).toBe(2);
      expect(mockProfileRepository.save).toHaveBeenCalledTimes(2);
      // Audit log should be created for each anonymization
      expect(mockAuditLogRepository.save).toHaveBeenCalledTimes(2);
    });

    it('should create audit log entries for each anonymized account', async () => {
      const inactiveProfiles = [
        {
          id: 'user-audit',
          email: 'audit@test.com',
          full_name: 'Audit User',
          phone: null,
          avatar_url: null,
          default_address: null,
          dietary_restrictions: null,
          favorite_cuisines: null,
          preferences: null,
          is_active: true,
        },
      ];

      mockProfileQueryBuilder.getMany.mockResolvedValue(inactiveProfiles);
      mockProfileRepository.save.mockImplementation((p) => Promise.resolve(p));
      mockAuditLogRepository.create.mockImplementation((data) => data);
      mockAuditLogRepository.save.mockResolvedValue({});

      await service.anonymizeInactiveAccounts();

      expect(mockAuditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-audit',
          action: AuditAction.PROFILE_UPDATED,
          entity_type: 'data_retention',
          success: true,
        }),
      );
    });
  });

  // ==========================================================
  // cleanupAccessLogs (cleanAccessLogs)
  // ==========================================================
  describe('cleanupAccessLogs', () => {
    it('should delete access logs older than 6 months', async () => {
      mockAuditLogDeleteBuilder.execute.mockResolvedValue({ affected: 150 });
      mockAuditLogRepository.create.mockImplementation((data) => data);
      mockAuditLogRepository.save.mockResolvedValue({});

      const count = await service.cleanupAccessLogs();

      expect(count).toBe(150);
      expect(mockAuditLogDeleteBuilder.delete).toHaveBeenCalled();
      expect(mockAuditLogDeleteBuilder.from).toHaveBeenCalledWith(AuditLog);
      expect(mockAuditLogDeleteBuilder.andWhere).toHaveBeenCalledWith(
        'action IN (:...actions)',
        expect.objectContaining({
          actions: [AuditAction.LOGIN, AuditAction.LOGOUT, AuditAction.TOKEN_REFRESH],
        }),
      );
    });

    it('should return 0 when no old access logs exist', async () => {
      mockAuditLogDeleteBuilder.execute.mockResolvedValue({ affected: 0 });

      const count = await service.cleanupAccessLogs();

      expect(count).toBe(0);
      // Should not create audit log when nothing was deleted
      expect(mockAuditLogRepository.create).not.toHaveBeenCalled();
    });

    it('should create audit log entry when logs are deleted', async () => {
      mockAuditLogDeleteBuilder.execute.mockResolvedValue({ affected: 42 });
      mockAuditLogRepository.create.mockImplementation((data) => data);
      mockAuditLogRepository.save.mockResolvedValue({});

      await service.cleanupAccessLogs();

      expect(mockAuditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: null,
          action: AuditAction.PROFILE_UPDATED,
          entity_type: 'data_retention',
          success: true,
        }),
      );
      expect(mockAuditLogRepository.save).toHaveBeenCalled();
    });

    it('should handle null affected count gracefully', async () => {
      mockAuditLogDeleteBuilder.execute.mockResolvedValue({ affected: null });

      const count = await service.cleanupAccessLogs();

      expect(count).toBe(0);
    });
  });

  // ==========================================================
  // cleanupOldReservations (anonymizeOldReservations)
  // ==========================================================
  describe('cleanupOldReservations', () => {
    it('should anonymize PII from reservations older than 2 years', async () => {
      const oldReservations = [
        {
          id: 'res-old-1',
          contact_phone: '+5511999',
          contact_email: 'guest@test.com',
          special_requests: 'Window table please',
          dietary_restrictions: ['gluten-free'],
          group_coordinator_name: 'John',
          group_coordinator_phone: '+5511888',
          created_at: new Date('2023-01-01'),
        },
      ];

      mockReservationRepository.find.mockResolvedValue(oldReservations);
      mockReservationRepository.save.mockImplementation((r) => Promise.resolve(r));
      mockAuditLogRepository.create.mockImplementation((data) => data);
      mockAuditLogRepository.save.mockResolvedValue({});

      const count = await service.cleanupOldReservations();

      expect(count).toBe(1);
      expect(mockReservationRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          contact_phone: null,
          contact_email: null,
          special_requests: null,
          dietary_restrictions: null,
          group_coordinator_name: null,
          group_coordinator_phone: null,
        }),
      );
    });

    it('should skip already-anonymized reservations', async () => {
      const reservations = [
        {
          id: 'res-already-anon',
          contact_phone: null,
          contact_email: null,
          special_requests: null,
          dietary_restrictions: null,
          group_coordinator_name: null,
          group_coordinator_phone: null,
          created_at: new Date('2022-01-01'),
        },
      ];

      mockReservationRepository.find.mockResolvedValue(reservations);

      const count = await service.cleanupOldReservations();

      expect(count).toBe(0);
      expect(mockReservationRepository.save).not.toHaveBeenCalled();
    });

    it('should return 0 when no old reservations exist', async () => {
      mockReservationRepository.find.mockResolvedValue([]);

      const count = await service.cleanupOldReservations();

      expect(count).toBe(0);
    });

    it('should anonymize reservations with partial PII', async () => {
      const reservations = [
        {
          id: 'res-partial',
          contact_phone: '+5511777',
          contact_email: null,
          special_requests: null,
          dietary_restrictions: null,
          group_coordinator_name: null,
          group_coordinator_phone: null,
          created_at: new Date('2023-06-01'),
        },
      ];

      mockReservationRepository.find.mockResolvedValue(reservations);
      mockReservationRepository.save.mockImplementation((r) => Promise.resolve(r));
      mockAuditLogRepository.create.mockImplementation((data) => data);
      mockAuditLogRepository.save.mockResolvedValue({});

      const count = await service.cleanupOldReservations();

      // contact_phone is truthy, so it should be anonymized
      expect(count).toBe(1);
      expect(mockReservationRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ contact_phone: null }),
      );
    });

    it('should create audit log entry for anonymized reservations', async () => {
      const reservations = [
        {
          id: 'res-audit',
          contact_phone: '+55',
          contact_email: 'x@y.com',
          special_requests: 'test',
          dietary_restrictions: null,
          group_coordinator_name: null,
          group_coordinator_phone: null,
          created_at: new Date('2023-01-01'),
        },
      ];

      mockReservationRepository.find.mockResolvedValue(reservations);
      mockReservationRepository.save.mockImplementation((r) => Promise.resolve(r));
      mockAuditLogRepository.create.mockImplementation((data) => data);
      mockAuditLogRepository.save.mockResolvedValue({});

      await service.cleanupOldReservations();

      expect(mockAuditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          entity_type: 'data_retention',
          success: true,
          metadata: expect.objectContaining({
            retention_action: 'old_reservations_anonymized',
            automated: true,
          }),
        }),
      );
    });
  });

  // ==========================================================
  // cleanupRevokedMarketingConsents
  // ==========================================================
  describe('cleanupRevokedMarketingConsents', () => {
    it('should delete marketing notifications for users with revoked consent', async () => {
      const revokedConsents = [
        {
          user_id: 'user-revoked-1',
          consent_type: ConsentType.MARKETING,
          revoked_at: new Date(),
        },
      ];

      mockConsentQueryBuilder.getMany.mockResolvedValue(revokedConsents);
      mockNotificationDeleteBuilder.execute.mockResolvedValue({ affected: 5 });
      mockAuditLogRepository.create.mockImplementation((data) => data);
      mockAuditLogRepository.save.mockResolvedValue({});

      const count = await service.cleanupRevokedMarketingConsents();

      expect(count).toBe(1);
      expect(mockNotificationDeleteBuilder.where).toHaveBeenCalledWith(
        'user_id = :userId',
        { userId: 'user-revoked-1' },
      );
      expect(mockNotificationDeleteBuilder.andWhere).toHaveBeenCalledWith(
        'notification_type = :type',
        { type: 'promotion' },
      );
    });

    it('should return 0 when no revoked consents exist', async () => {
      mockConsentQueryBuilder.getMany.mockResolvedValue([]);

      const count = await service.cleanupRevokedMarketingConsents();

      expect(count).toBe(0);
    });

    it('should not count users when no marketing notifications were deleted', async () => {
      const revokedConsents = [
        {
          user_id: 'user-no-notifs',
          consent_type: ConsentType.MARKETING,
          revoked_at: new Date(),
        },
      ];

      mockConsentQueryBuilder.getMany.mockResolvedValue(revokedConsents);
      mockNotificationDeleteBuilder.execute.mockResolvedValue({ affected: 0 });

      const count = await service.cleanupRevokedMarketingConsents();

      expect(count).toBe(0);
    });
  });

  // ==========================================================
  // runDailyRetention (integration of all jobs)
  // ==========================================================
  describe('runDailyRetention', () => {
    it('should call all retention sub-jobs', async () => {
      // Stub all sub-methods
      jest.spyOn(service, 'anonymizeInactiveAccounts').mockResolvedValue(0);
      jest.spyOn(service, 'cleanupAccessLogs').mockResolvedValue(0);
      jest.spyOn(service, 'cleanupOldReservations').mockResolvedValue(0);
      jest.spyOn(service, 'cleanupRevokedMarketingConsents').mockResolvedValue(0);

      await service.runDailyRetention();

      expect(service.anonymizeInactiveAccounts).toHaveBeenCalled();
      expect(service.cleanupAccessLogs).toHaveBeenCalled();
      expect(service.cleanupOldReservations).toHaveBeenCalled();
      expect(service.cleanupRevokedMarketingConsents).toHaveBeenCalled();
    });

    it('should not throw when a sub-job fails', async () => {
      jest
        .spyOn(service, 'anonymizeInactiveAccounts')
        .mockRejectedValue(new Error('DB down'));
      jest.spyOn(service, 'cleanupAccessLogs').mockResolvedValue(0);
      jest.spyOn(service, 'cleanupOldReservations').mockResolvedValue(0);
      jest.spyOn(service, 'cleanupRevokedMarketingConsents').mockResolvedValue(0);

      // Should not throw because of Promise.allSettled
      await expect(service.runDailyRetention()).resolves.not.toThrow();
    });
  });
});

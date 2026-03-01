/**
 * AuditLogService Tests
 * Tests for security audit logging including login events,
 * password changes, and suspicious activity tracking
 */

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLogService } from './audit-log.service';
import { AuditLog, AuditAction } from '../entities/audit-log.entity';

describe('AuditLogService', () => {
  let service: AuditLogService;
  let auditLogRepository: jest.Mocked<Repository<AuditLog>>;

  const mockAuditLog: Partial<AuditLog> = {
    id: 'log-123',
    user_id: 'user-123',
    action: AuditAction.LOGIN,
    entity_type: 'user',
    entity_id: 'user-123',
    ip_address: '192.168.1.1',
    user_agent: 'Mozilla/5.0',
    success: true,
    created_at: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogService,
        {
          provide: getRepositoryToken(AuditLog),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            count: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuditLogService>(AuditLogService);
    auditLogRepository = module.get(getRepositoryToken(AuditLog));

    jest.clearAllMocks();
  });

  describe('log', () => {
    it('should create and save audit log entry', async () => {
      auditLogRepository.create.mockReturnValue(mockAuditLog as AuditLog);
      auditLogRepository.save.mockResolvedValue(mockAuditLog as AuditLog);

      const result = await service.log({
        userId: 'user-123',
        action: AuditAction.LOGIN,
        entityType: 'user',
        entityId: 'user-123',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        success: true,
      });

      expect(auditLogRepository.create).toHaveBeenCalledWith({
        user_id: 'user-123',
        email: null,
        action: AuditAction.LOGIN,
        entity_type: 'user',
        entity_id: 'user-123',
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0',
        metadata: undefined,
        success: true,
        failure_reason: undefined,
      });
      expect(result).toEqual(mockAuditLog);
    });

    it('should sanitize sensitive data in metadata', async () => {
      auditLogRepository.create.mockReturnValue(mockAuditLog as AuditLog);
      auditLogRepository.save.mockResolvedValue(mockAuditLog as AuditLog);

      await service.log({
        userId: 'user-123',
        action: AuditAction.LOGIN,
        entityType: 'user',
        metadata: {
          password: 'secret123',
          token: 'jwt_token_here',
          safe_field: 'this is ok',
        },
      });

      expect(auditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: {
            password: '[REDACTED]',
            token: '[REDACTED]',
            safe_field: 'this is ok',
          },
        }),
      );
    });

    it('should handle nested sensitive data', async () => {
      auditLogRepository.create.mockReturnValue(mockAuditLog as AuditLog);
      auditLogRepository.save.mockResolvedValue(mockAuditLog as AuditLog);

      await service.log({
        userId: 'user-123',
        action: AuditAction.LOGIN,
        entityType: 'user',
        metadata: {
          nested: {
            mfa_secret: 'secret_value',
            api_key: 'key_123',
          },
        },
      });

      expect(auditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: {
            nested: {
              mfa_secret: '[REDACTED]',
              api_key: '[REDACTED]',
            },
          },
        }),
      );
    });
  });

  describe('logLogin', () => {
    it('should log successful login', async () => {
      auditLogRepository.create.mockReturnValue(mockAuditLog as AuditLog);
      auditLogRepository.save.mockResolvedValue(mockAuditLog as AuditLog);

      await service.logLogin('user-123', '192.168.1.1', 'Chrome', { device: 'mobile' });

      expect(auditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-123',
          action: AuditAction.LOGIN,
          entity_type: 'user',
          ip_address: '192.168.1.1',
          user_agent: 'Chrome',
          success: true,
        }),
      );
    });
  });

  describe('logFailedLogin', () => {
    it('should log failed login attempt with email', async () => {
      auditLogRepository.create.mockReturnValue(mockAuditLog as AuditLog);
      auditLogRepository.save.mockResolvedValue(mockAuditLog as AuditLog);

      await service.logFailedLogin('test@example.com', '192.168.1.1', 'Chrome', 'Invalid password');

      expect(auditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          action: AuditAction.LOGIN_FAILED,
          entity_type: 'user',
          success: false,
          failure_reason: 'Invalid password',
        }),
      );
    });
  });

  describe('logLogout', () => {
    it('should log logout event', async () => {
      auditLogRepository.create.mockReturnValue(mockAuditLog as AuditLog);
      auditLogRepository.save.mockResolvedValue(mockAuditLog as AuditLog);

      await service.logLogout('user-123', '192.168.1.1', 'Chrome');

      expect(auditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-123',
          action: AuditAction.LOGOUT,
          success: true,
        }),
      );
    });
  });

  describe('logPasswordChange', () => {
    it('should log password change event', async () => {
      auditLogRepository.create.mockReturnValue(mockAuditLog as AuditLog);
      auditLogRepository.save.mockResolvedValue(mockAuditLog as AuditLog);

      await service.logPasswordChange('user-123', '192.168.1.1', 'Chrome');

      expect(auditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-123',
          action: AuditAction.PASSWORD_CHANGE,
          success: true,
        }),
      );
    });
  });

  describe('logMfaChange', () => {
    it('should log MFA enabled event', async () => {
      auditLogRepository.create.mockReturnValue(mockAuditLog as AuditLog);
      auditLogRepository.save.mockResolvedValue(mockAuditLog as AuditLog);

      await service.logMfaChange('user-123', true, '192.168.1.1');

      expect(auditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditAction.MFA_ENABLED,
        }),
      );
    });

    it('should log MFA disabled event', async () => {
      auditLogRepository.create.mockReturnValue(mockAuditLog as AuditLog);
      auditLogRepository.save.mockResolvedValue(mockAuditLog as AuditLog);

      await service.logMfaChange('user-123', false, '192.168.1.1');

      expect(auditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditAction.MFA_DISABLED,
        }),
      );
    });
  });

  describe('logAccountLockout', () => {
    it('should log account lockout event', async () => {
      auditLogRepository.create.mockReturnValue(mockAuditLog as AuditLog);
      auditLogRepository.save.mockResolvedValue(mockAuditLog as AuditLog);

      await service.logAccountLockout('user-123', '192.168.1.1', 'max_failed_attempts');

      expect(auditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditAction.ACCOUNT_LOCKED,
          metadata: { reason: 'max_failed_attempts' },
        }),
      );
    });
  });

  describe('logSuspiciousActivity', () => {
    it('should log suspicious activity', async () => {
      auditLogRepository.create.mockReturnValue(mockAuditLog as AuditLog);
      auditLogRepository.save.mockResolvedValue(mockAuditLog as AuditLog);

      await service.logSuspiciousActivity(
        'user-123',
        'Multiple login attempts from different locations',
        '192.168.1.1',
        { country: 'CN' },
      );

      expect(auditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditAction.SUSPICIOUS_ACTIVITY,
          entity_type: 'security',
          metadata: expect.objectContaining({
            description: 'Multiple login attempts from different locations',
            country: 'CN',
          }),
        }),
      );
    });
  });

  describe('getLogs', () => {
    it('should return logs with pagination', async () => {
      const mockQb = {
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(50),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockAuditLog]),
      };
      auditLogRepository.createQueryBuilder.mockReturnValue(mockQb as any);

      const result = await service.getLogs({
        userId: 'user-123',
        limit: 10,
        offset: 0,
      });

      expect(result.logs).toHaveLength(1);
      expect(result.total).toBe(50);
      expect(mockQb.andWhere).toHaveBeenCalledWith('log.user_id = :userId', { userId: 'user-123' });
    });

    it('should filter by action', async () => {
      const mockQb = {
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(10),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      auditLogRepository.createQueryBuilder.mockReturnValue(mockQb as any);

      await service.getLogs({ action: AuditAction.LOGIN });

      expect(mockQb.andWhere).toHaveBeenCalledWith('log.action = :action', {
        action: AuditAction.LOGIN,
      });
    });

    it('should filter by multiple actions', async () => {
      const mockQb = {
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(10),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      auditLogRepository.createQueryBuilder.mockReturnValue(mockQb as any);

      await service.getLogs({ action: [AuditAction.LOGIN, AuditAction.LOGOUT] });

      expect(mockQb.andWhere).toHaveBeenCalledWith('log.action IN (:...actions)', {
        actions: [AuditAction.LOGIN, AuditAction.LOGOUT],
      });
    });

    it('should filter by date range', async () => {
      const mockQb = {
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(10),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      auditLogRepository.createQueryBuilder.mockReturnValue(mockQb as any);

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      await service.getLogs({ startDate, endDate });

      expect(mockQb.andWhere).toHaveBeenCalledWith('log.created_at BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      });
    });
  });

  describe('getLogsForUser', () => {
    it('should return logs for specific user', async () => {
      const mockQb = {
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(5),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockAuditLog]),
      };
      auditLogRepository.createQueryBuilder.mockReturnValue(mockQb as any);

      const result = await service.getLogsForUser('user-123', 10, 0);

      expect(result).toHaveLength(1);
    });
  });

  describe('getRecentFailedLogins', () => {
    it('should count failed logins from IP in time window', async () => {
      auditLogRepository.count.mockResolvedValue(3);

      const result = await service.getRecentFailedLogins('192.168.1.1', 15);

      expect(result).toBe(3);
      expect(auditLogRepository.count).toHaveBeenCalledWith({
        where: {
          action: AuditAction.LOGIN_FAILED,
          ip_address: '192.168.1.1',
          created_at: expect.anything(),
        },
      });
    });
  });

  describe('getSecuritySummary', () => {
    it('should return security event summary', async () => {
      auditLogRepository.find.mockResolvedValue([
        { action: AuditAction.LOGIN, success: true },
        { action: AuditAction.LOGIN, success: true },
        { action: AuditAction.LOGIN_FAILED, success: false },
        { action: AuditAction.ACCOUNT_LOCKED, success: true },
        { action: AuditAction.SUSPICIOUS_ACTIVITY, success: true },
      ] as AuditLog[]);

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      const result = await service.getSecuritySummary(startDate, endDate);

      expect(result.totalEvents).toBe(5);
      expect(result.successfulLogins).toBe(2);
      expect(result.failedLogins).toBe(1);
      expect(result.accountLockouts).toBe(1);
      expect(result.suspiciousActivities).toBe(1);
      expect(result.byAction[AuditAction.LOGIN]).toBe(2);
    });
  });
});

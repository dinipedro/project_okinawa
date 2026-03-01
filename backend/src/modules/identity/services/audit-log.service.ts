/**
 * AuditLogService - Tracks all security-relevant actions in the system
 *
 * Part of Identity Module (AUDIT-010)
 */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan } from 'typeorm';
import { AuditLog, AuditAction } from '../entities/audit-log.entity';

export interface AuditLogData {
  userId?: string;
  email?: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  success?: boolean;
  failureReason?: string;
}

export interface AuditLogQuery {
  userId?: string;
  action?: AuditAction | AuditAction[];
  ipAddress?: string;
  success?: boolean;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  // Sensitive fields that should be redacted
  private readonly SENSITIVE_FIELDS = [
    'password',
    'password_hash',
    'token',
    'access_token',
    'refresh_token',
    'secret',
    'mfa_secret',
    'card_number',
    'cvv',
    'authorization',
    'api_key',
    'private_key',
  ];

  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  /**
   * Log an audit event
   */
  async log(data: AuditLogData): Promise<AuditLog> {
    const sanitizedMetadata = this.sanitizeSensitiveData(data.metadata);

    const auditLog = this.auditLogRepository.create({
      user_id: data.userId || null,
      email: data.email || null,
      action: data.action,
      entity_type: data.entityType,
      entity_id: data.entityId,
      ip_address: data.ipAddress,
      user_agent: data.userAgent,
      metadata: sanitizedMetadata,
      success: data.success ?? true,
      failure_reason: data.failureReason,
    });

    const saved = await this.auditLogRepository.save(auditLog);
    this.logger.debug(`Audit: ${data.action} for ${data.userId || data.email || 'anonymous'}`);
    return saved;
  }

  /**
   * Log a successful login
   */
  async logLogin(
    userId: string,
    ipAddress?: string,
    userAgent?: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.LOGIN,
      entityType: 'user',
      entityId: userId,
      ipAddress,
      userAgent,
      metadata,
      success: true,
    });
  }

  /**
   * Log a failed login attempt
   */
  async logFailedLogin(
    email: string,
    ipAddress?: string,
    userAgent?: string,
    reason?: string,
  ): Promise<void> {
    await this.log({
      email,
      action: AuditAction.LOGIN_FAILED,
      entityType: 'user',
      ipAddress,
      userAgent,
      success: false,
      failureReason: reason,
    });
  }

  /**
   * Log a logout
   */
  async logLogout(
    userId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.LOGOUT,
      entityType: 'user',
      entityId: userId,
      ipAddress,
      userAgent,
      success: true,
    });
  }

  /**
   * Log a password change
   */
  async logPasswordChange(
    userId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.PASSWORD_CHANGE,
      entityType: 'user',
      entityId: userId,
      ipAddress,
      userAgent,
      success: true,
    });
  }

  /**
   * Log MFA enable/disable
   */
  async logMfaChange(
    userId: string,
    enabled: boolean,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.log({
      userId,
      action: enabled ? AuditAction.MFA_ENABLED : AuditAction.MFA_DISABLED,
      entityType: 'user',
      entityId: userId,
      ipAddress,
      userAgent,
      success: true,
    });
  }

  /**
   * Log account lockout
   */
  async logAccountLockout(
    userId: string,
    ipAddress?: string,
    reason?: string,
  ): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.ACCOUNT_LOCKED,
      entityType: 'user',
      entityId: userId,
      ipAddress,
      metadata: { reason },
      success: true,
    });
  }

  /**
   * Log suspicious activity
   */
  async logSuspiciousActivity(
    userId: string | undefined,
    description: string,
    ipAddress?: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.SUSPICIOUS_ACTIVITY,
      entityType: 'security',
      ipAddress,
      metadata: { description, ...metadata },
      success: true,
    });
  }

  /**
   * Get audit logs with flexible filtering
   */
  async getLogs(query: AuditLogQuery): Promise<{ logs: AuditLog[]; total: number }> {
    const qb = this.auditLogRepository.createQueryBuilder('log');

    if (query.userId) {
      qb.andWhere('log.user_id = :userId', { userId: query.userId });
    }

    if (query.action) {
      if (Array.isArray(query.action)) {
        qb.andWhere('log.action IN (:...actions)', { actions: query.action });
      } else {
        qb.andWhere('log.action = :action', { action: query.action });
      }
    }

    if (query.ipAddress) {
      qb.andWhere('log.ip_address = :ip', { ip: query.ipAddress });
    }

    if (query.success !== undefined) {
      qb.andWhere('log.success = :success', { success: query.success });
    }

    if (query.startDate && query.endDate) {
      qb.andWhere('log.created_at BETWEEN :start AND :end', {
        start: query.startDate,
        end: query.endDate,
      });
    } else if (query.startDate) {
      qb.andWhere('log.created_at >= :start', { start: query.startDate });
    } else if (query.endDate) {
      qb.andWhere('log.created_at <= :end', { end: query.endDate });
    }

    const total = await qb.getCount();

    qb.orderBy('log.created_at', 'DESC')
      .take(query.limit || 100)
      .skip(query.offset || 0);

    const logs = await qb.getMany();

    return { logs, total };
  }

  /**
   * Get audit logs for a user
   */
  async getLogsForUser(
    userId: string,
    limit: number = 100,
    offset: number = 0,
  ): Promise<AuditLog[]> {
    const { logs } = await this.getLogs({ userId, limit, offset });
    return logs;
  }

  /**
   * Get recent failed logins for an IP
   */
  async getRecentFailedLogins(
    ipAddress: string,
    minutes: number = 15,
  ): Promise<number> {
    const since = new Date();
    since.setMinutes(since.getMinutes() - minutes);

    return this.auditLogRepository.count({
      where: {
        action: AuditAction.LOGIN_FAILED,
        ip_address: ipAddress,
        created_at: MoreThan(since),
      },
    });
  }

  /**
   * Get security summary for a time period
   */
  async getSecuritySummary(
    startDate: Date,
    endDate: Date,
  ): Promise<{
    totalEvents: number;
    byAction: Record<string, number>;
    failedLogins: number;
    successfulLogins: number;
    accountLockouts: number;
    suspiciousActivities: number;
  }> {
    const events = await this.auditLogRepository.find({
      where: {
        created_at: Between(startDate, endDate),
      },
      select: ['action', 'success'],
    });

    const byAction: Record<string, number> = {};
    let failedLogins = 0;
    let successfulLogins = 0;
    let accountLockouts = 0;
    let suspiciousActivities = 0;

    for (const event of events) {
      byAction[event.action] = (byAction[event.action] || 0) + 1;

      if (event.action === AuditAction.LOGIN_FAILED) {
        failedLogins++;
      } else if (event.action === AuditAction.LOGIN && event.success) {
        successfulLogins++;
      } else if (event.action === AuditAction.ACCOUNT_LOCKED) {
        accountLockouts++;
      } else if (event.action === AuditAction.SUSPICIOUS_ACTIVITY) {
        suspiciousActivities++;
      }
    }

    return {
      totalEvents: events.length,
      byAction,
      failedLogins,
      successfulLogins,
      accountLockouts,
      suspiciousActivities,
    };
  }

  /**
   * Remove sensitive fields from data before logging
   */
  private sanitizeSensitiveData(
    data?: Record<string, any>,
  ): Record<string, any> | undefined {
    if (!data) return undefined;

    const sanitized = { ...data };

    for (const field of this.SENSITIVE_FIELDS) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    // Also check nested objects
    for (const key of Object.keys(sanitized)) {
      if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeSensitiveData(sanitized[key]);
      }
    }

    return sanitized;
  }
}

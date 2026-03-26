import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Profile } from './entities/profile.entity';
import { AuditLog, AuditAction } from '@/modules/identity/entities/audit-log.entity';
import { Reservation } from '@/modules/reservations/entities/reservation.entity';
import { UserConsent, ConsentType } from '@/modules/identity/entities/user-consent.entity';
import { Notification } from '@/modules/notifications/entities/notification.entity';
import * as crypto from 'crypto';

@Injectable()
export class DataRetentionService {
  private readonly logger = new Logger(DataRetentionService.name);

  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(UserConsent)
    private readonly userConsentRepository: Repository<UserConsent>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  /**
   * Daily data retention job — runs at 3:00 AM.
   * Enforces LGPD retention policies:
   * - Anonymize inactive accounts (2+ years)
   * - Clean up access logs older than 6 months (Marco Civil da Internet)
   * - Anonymize old reservations (2+ years)
   * - Clean up revoked marketing consents
   *
   * RETAINS:
   * - Financial transactions for 7 years (fiscal compliance)
   * - Security audit logs for 5 years (security compliance)
   */
  @Cron('0 3 * * *')
  async runDailyRetention(): Promise<void> {
    this.logger.log('Starting daily data retention job');

    try {
      const results = await Promise.allSettled([
        this.anonymizeInactiveAccounts(),
        this.cleanupAccessLogs(),
        this.cleanupOldReservations(),
        this.cleanupRevokedMarketingConsents(),
      ]);

      results.forEach((result, index) => {
        const jobNames = [
          'anonymizeInactiveAccounts',
          'cleanupAccessLogs',
          'cleanupOldReservations',
          'cleanupRevokedMarketingConsents',
        ];
        if (result.status === 'rejected') {
          this.logger.error(
            `Retention job ${jobNames[index]} failed: ${result.reason}`,
          );
        }
      });

      this.logger.log('Daily data retention job completed');
    } catch (error) {
      this.logger.error('Daily data retention job failed', (error as Error).stack);
    }
  }

  /**
   * Anonymize accounts inactive for 2+ years.
   * Hashes email, clears name/phone, sets is_active=false.
   */
  async anonymizeInactiveAccounts(): Promise<number> {
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

    const inactiveProfiles = await this.profileRepository
      .createQueryBuilder('profile')
      .where('profile.is_active = :isActive', { isActive: true })
      .andWhere('profile.updated_at < :cutoff', { cutoff: twoYearsAgo })
      .getMany();

    let anonymizedCount = 0;

    for (const profile of inactiveProfiles) {
      const hashedEmail = crypto
        .createHash('sha256')
        .update(profile.email.toLowerCase())
        .digest('hex');

      profile.email = `anon_${hashedEmail.substring(0, 16)}@anonymized.local`;
      profile.full_name = 'Anonymized User';
      profile.phone = null;
      profile.avatar_url = null;
      profile.default_address = null;
      profile.dietary_restrictions = null;
      profile.favorite_cuisines = null;
      profile.preferences = null;
      profile.is_active = false;

      await this.profileRepository.save(profile);

      // Log the anonymization to audit_log
      await this.logRetentionAction(
        profile.id,
        'account_anonymized',
        `Inactive account anonymized (last activity > 2 years). Original email hash: ${hashedEmail.substring(0, 8)}...`,
      );

      anonymizedCount++;
    }

    if (anonymizedCount > 0) {
      this.logger.log(`Anonymized ${anonymizedCount} inactive accounts`);
    }

    return anonymizedCount;
  }

  /**
   * Delete access audit logs older than 6 months (Marco Civil da Internet).
   * PRESERVES security audit logs for 5 years.
   *
   * Access logs: LOGIN, LOGOUT, TOKEN_REFRESH
   * Security logs (retained 5 years): LOGIN_FAILED, ACCOUNT_LOCKED, SUSPICIOUS_ACTIVITY, etc.
   */
  async cleanupAccessLogs(): Promise<number> {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Access-only actions (non-security) to purge after 6 months
    const accessActions: AuditAction[] = [
      AuditAction.LOGIN,
      AuditAction.LOGOUT,
      AuditAction.TOKEN_REFRESH,
    ];

    const result = await this.auditLogRepository
      .createQueryBuilder()
      .delete()
      .from(AuditLog)
      .where('created_at < :cutoff', { cutoff: sixMonthsAgo })
      .andWhere('action IN (:...actions)', { actions: accessActions })
      .execute();

    const deletedCount = result.affected || 0;

    if (deletedCount > 0) {
      this.logger.log(`Deleted ${deletedCount} access audit logs older than 6 months`);

      await this.logRetentionAction(
        null,
        'access_logs_cleaned',
        `Deleted ${deletedCount} access logs older than 6 months (Marco Civil compliance)`,
      );
    }

    return deletedCount;
  }

  /**
   * Anonymize reservations older than 2 years.
   * Removes PII (contact info, special requests) but retains aggregate data.
   */
  async cleanupOldReservations(): Promise<number> {
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

    const oldReservations = await this.reservationRepository.find({
      where: {
        created_at: LessThan(twoYearsAgo),
      },
    });

    // Filter out already-anonymized reservations
    const toAnonymize = oldReservations.filter(
      (r) => r.contact_phone || r.contact_email || r.special_requests,
    );

    let anonymizedCount = 0;

    for (const reservation of toAnonymize) {
      reservation.contact_phone = null;
      reservation.contact_email = null;
      reservation.special_requests = null;
      reservation.dietary_restrictions = null;
      reservation.group_coordinator_name = null;
      reservation.group_coordinator_phone = null;

      await this.reservationRepository.save(reservation);
      anonymizedCount++;
    }

    if (anonymizedCount > 0) {
      this.logger.log(`Anonymized ${anonymizedCount} reservations older than 2 years`);

      await this.logRetentionAction(
        null,
        'old_reservations_anonymized',
        `Anonymized PII from ${anonymizedCount} reservations older than 2 years`,
      );
    }

    return anonymizedCount;
  }

  /**
   * Clean up marketing data for users who revoked marketing consent.
   * Deletes marketing notifications and clears marketing-related preferences.
   */
  async cleanupRevokedMarketingConsents(): Promise<number> {
    // Find all revoked marketing consents
    const revokedConsents = await this.userConsentRepository
      .createQueryBuilder('consent')
      .where('consent.consent_type = :type', { type: ConsentType.MARKETING })
      .andWhere('consent.revoked_at IS NOT NULL')
      .getMany();

    let cleanedCount = 0;

    for (const consent of revokedConsents) {
      // Delete marketing notifications for this user
      const deleteResult = await this.notificationRepository
        .createQueryBuilder()
        .delete()
        .from(Notification)
        .where('user_id = :userId', { userId: consent.user_id })
        .andWhere('notification_type = :type', { type: 'promotion' })
        .execute();

      const deletedNotifications = deleteResult.affected || 0;

      if (deletedNotifications > 0) {
        await this.logRetentionAction(
          consent.user_id,
          'marketing_data_cleaned',
          `Deleted ${deletedNotifications} marketing notifications after consent revocation`,
        );

        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.logger.log(
        `Cleaned marketing data for ${cleanedCount} users with revoked consents`,
      );
    }

    return cleanedCount;
  }

  /**
   * Log a retention action to the audit log for compliance trail.
   */
  private async logRetentionAction(
    userId: string | null,
    action: string,
    description: string,
  ): Promise<void> {
    const auditLog = this.auditLogRepository.create({
      user_id: userId,
      action: AuditAction.PROFILE_UPDATED, // Closest available action
      entity_type: 'data_retention',
      ip_address: '0.0.0.0',
      success: true,
      metadata: {
        retention_action: action,
        description,
        executed_at: new Date().toISOString(),
        automated: true,
      },
    });

    await this.auditLogRepository.save(auditLog);
  }
}

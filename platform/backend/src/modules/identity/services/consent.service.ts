/**
 * ConsentService - Manages LGPD consent records
 *
 * Handles recording, querying, and revoking user consents
 * for terms of service, privacy policy, marketing, etc.
 *
 * Part of Identity Module (LGPD compliance)
 */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { UserConsent, ConsentType } from '../entities/user-consent.entity';

export interface RecordConsentData {
  userId: string;
  consentType: ConsentType;
  version: string;
  ipAddress: string;
  deviceId?: string;
  userAgent?: string;
  versionHash?: string;
  metadata?: Record<string, any>;
}

export interface ConsentVersionCheck {
  consentType: ConsentType;
  currentVersion: string;
}

@Injectable()
export class ConsentService {
  private readonly logger = new Logger(ConsentService.name);

  constructor(
    @InjectRepository(UserConsent)
    private consentRepository: Repository<UserConsent>,
  ) {}

  /**
   * Record a new consent acceptance
   */
  async recordConsent(data: RecordConsentData): Promise<UserConsent> {
    // Revoke any previous active consent of the same type before recording new one
    await this.revokeConsent(data.userId, data.consentType);

    const consent = this.consentRepository.create({
      user_id: data.userId,
      consent_type: data.consentType,
      version: data.version,
      version_hash: data.versionHash || undefined,
      ip_address: data.ipAddress,
      device_id: data.deviceId || undefined,
      user_agent: data.userAgent || undefined,
      metadata: data.metadata || undefined,
    } as any);

    const saved = await this.consentRepository.save(consent);
    this.logger.log(
      `Consent recorded: ${data.consentType} v${data.version} for user ${data.userId}`,
    );
    return saved as unknown as UserConsent;
  }

  /**
   * Get all active (non-revoked) consents for a user
   */
  async getActiveConsents(userId: string): Promise<UserConsent[]> {
    return this.consentRepository.find({
      where: {
        user_id: userId,
        revoked_at: IsNull(),
      },
      order: { accepted_at: 'DESC' },
    });
  }

  /**
   * Revoke a specific consent type for a user
   */
  async revokeConsent(userId: string, consentType: ConsentType): Promise<void> {
    const activeConsents = await this.consentRepository.find({
      where: {
        user_id: userId,
        consent_type: consentType,
        revoked_at: IsNull(),
      },
    });

    if (activeConsents.length > 0) {
      const now = new Date();
      for (const consent of activeConsents) {
        consent.revoked_at = now;
      }
      await this.consentRepository.save(activeConsents);
      this.logger.log(
        `Consent revoked: ${consentType} for user ${userId} (${activeConsents.length} record(s))`,
      );
    }
  }

  /**
   * Check if user has accepted a specific version of a consent type
   */
  async hasAcceptedVersion(
    userId: string,
    consentType: ConsentType,
    version: string,
  ): Promise<boolean> {
    const consent = await this.consentRepository.findOne({
      where: {
        user_id: userId,
        consent_type: consentType,
        version,
        revoked_at: IsNull(),
      },
    });

    return !!consent;
  }

  /**
   * Check if user needs to re-accept any consent types
   * Returns list of consent types that require re-acceptance
   */
  async requiresReConsent(
    userId: string,
    currentVersions: ConsentVersionCheck[],
  ): Promise<ConsentVersionCheck[]> {
    const needsReConsent: ConsentVersionCheck[] = [];

    for (const check of currentVersions) {
      const hasAccepted = await this.hasAcceptedVersion(
        userId,
        check.consentType,
        check.currentVersion,
      );

      if (!hasAccepted) {
        needsReConsent.push(check);
      }
    }

    return needsReConsent;
  }

  /**
   * Get the full consent history for a user (including revoked)
   */
  async getConsentHistory(userId: string): Promise<UserConsent[]> {
    return this.consentRepository.find({
      where: { user_id: userId },
      order: { accepted_at: 'DESC' },
    });
  }
}

/**
 * AUDIT-010: Identity Module
 *
 * This module handles identity management, separating identity concerns from authentication.
 * It manages:
 * - User credentials (password storage, validation)
 * - Multi-factor authentication (MFA/TOTP)
 * - Token blacklisting
 * - Audit logging
 * - Password policies
 *
 * The Auth module depends on this module for identity operations.
 */

import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';

// Entities
import { UserCredential } from './entities/user-credential.entity';
import { TokenBlacklist } from './entities/token-blacklist.entity';
import { AuditLog } from './entities/audit-log.entity';
import { PasswordResetToken } from './entities/password-reset-token.entity';

// Services
import { CredentialService } from './services/credential.service';
import { MfaService } from './services/mfa.service';
import { TokenBlacklistService } from './services/token-blacklist.service';
import { AuditLogService } from './services/audit-log.service';
import { PasswordPolicyService } from './services/password-policy.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserCredential,
      TokenBlacklist,
      AuditLog,
      PasswordResetToken,
    ]),
    CacheModule.register(),
  ],
  providers: [
    CredentialService,
    MfaService,
    TokenBlacklistService,
    AuditLogService,
    PasswordPolicyService,
  ],
  exports: [
    // Services
    CredentialService,
    MfaService,
    TokenBlacklistService,
    AuditLogService,
    PasswordPolicyService,
    // TypeORM for entities
    TypeOrmModule,
  ],
})
export class IdentityModule {}

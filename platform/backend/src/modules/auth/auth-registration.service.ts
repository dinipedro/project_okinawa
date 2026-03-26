import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from '@/modules/users/entities/profile.entity';
import { RegisterDto } from './dto/register.dto';
import {
  AuditLogService,
  CredentialService,
  AuditAction,
  ConsentService,
  ConsentType,
} from '@/modules/identity';
import { TokenService } from './token.service';
import { LegalService } from '@/modules/legal/legal.service';

@Injectable()
export class AuthRegistrationService {
  private readonly logger = new Logger(AuthRegistrationService.name);

  constructor(
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    private auditLogService: AuditLogService,
    private credentialService: CredentialService,
    private consentService: ConsentService,
    private tokenService: TokenService,
    private legalService: LegalService,
  ) {}

  async register(registerDto: RegisterDto, ipAddress?: string, userAgent?: string, deviceId?: string) {
    const existingUser = await this.profileRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      this.logger.warn('Registration attempt with existing email');
      return {
        message: 'If this email is available, a confirmation will be sent shortly.',
      };
    }

    // Create user profile with LGPD fields
    const user = this.profileRepository.create({
      email: registerDto.email,
      full_name: registerDto.full_name,
      birth_date: new Date(registerDto.birth_date),
      marketing_consent: registerDto.marketing_consent ?? false,
      preferences: {},
    });

    await this.profileRepository.save(user);

    // Create credentials in separate table (secure storage)
    await this.credentialService.createCredential(user.id, registerDto.password);

    // Record LGPD consents with content hash for immutable proof
    const consentIp = ipAddress || '0.0.0.0';
    const termsDoc = this.legalService.getTermsOfService();
    const privacyDoc = this.legalService.getPrivacyPolicy();

    await this.consentService.recordConsent({
      userId: user.id,
      consentType: ConsentType.TERMS_OF_SERVICE,
      version: registerDto.accepted_terms_version,
      versionHash: termsDoc.contentHash,
      ipAddress: consentIp,
      userAgent,
      deviceId,
    });

    await this.consentService.recordConsent({
      userId: user.id,
      consentType: ConsentType.PRIVACY_POLICY,
      version: registerDto.accepted_privacy_version,
      versionHash: privacyDoc.contentHash,
      ipAddress: consentIp,
      userAgent,
      deviceId,
    });

    if (registerDto.marketing_consent) {
      await this.consentService.recordConsent({
        userId: user.id,
        consentType: ConsentType.MARKETING,
        version: registerDto.accepted_terms_version,
        ipAddress: consentIp,
        userAgent,
        deviceId,
      });
    }

    // Log registration
    await this.auditLogService.log({
      userId: user.id,
      action: AuditAction.REGISTER,
      entityType: 'user',
      entityId: user.id,
      ipAddress,
      userAgent,
      success: true,
      metadata: {
        accepted_terms_version: registerDto.accepted_terms_version,
        accepted_privacy_version: registerDto.accepted_privacy_version,
        marketing_consent: registerDto.marketing_consent ?? false,
      },
    });

    const tokens = await this.tokenService.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
      },
      ...tokens,
    };
  }
}

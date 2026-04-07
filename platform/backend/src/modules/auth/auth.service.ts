import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Profile } from '@/modules/users/entities/profile.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ConfirmResetPasswordDto } from './dto/confirm-reset-password.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { EmailService } from '@/common/services/email.service';
import {
  AuditLogService,
  CredentialService,
} from '@/modules/identity';
import { AuditAction } from '@/modules/identity/entities/audit-log.entity';
import { PasswordResetService } from './password-reset.service';
import { TokenService } from './token.service';
import { AuthRegistrationService } from './auth-registration.service';
import { AuthLoginService } from './auth-login.service';
import { BiometricService } from './services/biometric.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    private emailService: EmailService,
    private auditLogService: AuditLogService,
    private credentialService: CredentialService,
    private passwordResetService: PasswordResetService,
    private tokenService: TokenService,
    private registrationService: AuthRegistrationService,
    private loginService: AuthLoginService,
    private biometricService: BiometricService,
    private configService: ConfigService,
  ) {}

  // ========== DELEGATION: REGISTRATION ==========

  async register(registerDto: RegisterDto, ipAddress?: string, userAgent?: string, deviceId?: string) {
    return this.registrationService.register(registerDto, ipAddress, userAgent, deviceId);
  }

  // ========== DELEGATION: LOGIN ==========

  async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string) {
    return this.loginService.login(loginDto, ipAddress, userAgent);
  }

  // ========== CORE AUTH OPERATIONS ==========

  async logout(
    userId: string,
    accessToken: string,
    refreshToken?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    await this.tokenService.blacklistTokensOnLogout(userId, accessToken, refreshToken, ipAddress);
    await this.auditLogService.logLogout(userId, ipAddress, userAgent);
    return { message: 'Logged out successfully' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    return this.passwordResetService.resetPassword(resetPasswordDto);
  }

  async confirmResetPassword(
    confirmResetPasswordDto: ConfirmResetPasswordDto,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.passwordResetService.confirmResetPassword(
      confirmResetPasswordDto,
      ipAddress,
      userAgent,
    );
  }

  async getCurrentUser(userId: string) {
    const user = await this.profileRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.restaurant'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
      phone: user.phone,
      roles: user.roles,
    };
  }

  async refreshToken(refreshToken: string, ipAddress?: string) {
    return this.tokenService.refreshToken(refreshToken, ipAddress);
  }

  /**
   * Update user authentication details (email, password)
   */
  async update(
    userId: string,
    updateAuthDto: UpdateAuthDto,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const user = await this.profileRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // If changing password, verify current password and use credential service
    if (updateAuthDto.password) {
      if (!updateAuthDto.current_password) {
        throw new BadRequestException('Current password is required to change password');
      }

      const verifyResult = await this.credentialService.verifyPassword(
        userId,
        updateAuthDto.current_password,
      );

      if (!verifyResult.valid) {
        const legacyPassword = user.preferences?.password;
        if (legacyPassword) {
          const isLegacyValid = await bcrypt.compare(
            updateAuthDto.current_password,
            legacyPassword,
          );
          if (!isLegacyValid) {
            throw new UnauthorizedException('Current password is incorrect');
          }
        } else {
          throw new UnauthorizedException('Current password is incorrect');
        }
      }

      const result = await this.credentialService.changePassword(userId, updateAuthDto.password);

      if (!result.success) {
        throw new BadRequestException(result.message);
      }

      await this.auditLogService.logPasswordChange(userId, ipAddress, userAgent);
      if (user.email) {
        await this.emailService.sendPasswordChangedEmail(user.email, user.full_name || undefined);
      }
    }

    // Update email if provided
    if (updateAuthDto.email && updateAuthDto.email !== user.email) {
      const existingUser = await this.profileRepository.findOne({
        where: { email: updateAuthDto.email },
      });

      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException('Email already in use');
      }

      user.email = updateAuthDto.email;
    }

    const updatedUser = await this.profileRepository.save(user);

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      full_name: updatedUser.full_name,
      message: 'Authentication details updated successfully',
    };
  }

  /**
   * Update user profile (alias for update method)
   */
  async updateProfile(
    userId: string,
    updateAuthDto: UpdateAuthDto,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.update(userId, updateAuthDto, ipAddress, userAgent);
  }

  /**
   * Check if a token is blacklisted by extracting JTI
   */
  async isTokenBlacklisted(token: string): Promise<boolean> {
    return this.tokenService.isTokenBlacklisted(token);
  }

  /**
   * Validate user password (for MFA disable flow)
   */
  async validatePassword(userId: string, password: string): Promise<boolean> {
    const verifyResult = await this.credentialService.verifyPassword(userId, password);

    if (verifyResult.valid) {
      return true;
    }

    const user = await this.profileRepository.findOne({
      where: { id: userId },
    });

    if (user?.preferences?.password) {
      return bcrypt.compare(password, user.preferences.password);
    }

    return false;
  }

  /**
   * Find user by phone number (phone auth flow)
   */
  async findUserByPhone(phone: string): Promise<Profile | null> {
    return this.profileRepository.findOne({
      where: { phone, phone_verified: true },
      relations: ['roles', 'roles.restaurant'],
    });
  }

  /**
   * Login by phone (phone auth flow)
   */
  async loginByPhone(
    user: Profile,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ access_token: string; refresh_token: string; expires_in: number; biometric_enrollment_token?: string }> {
    // Update last login
    user.last_login_at = new Date();
    await this.profileRepository.save(user);

    await this.auditLogService.logLogin(user.id, ipAddress, userAgent);

    const tokens = await this.tokenService.generateTokens(user);
    const biometric_enrollment_token = this.biometricService.generateEnrollmentToken(user.id);

    return {
      ...tokens,
      biometric_enrollment_token,
    };
  }

  /**
   * Register by phone (phone auth flow)
   */
  async registerByPhone(
    data: { phone: string; fullName: string; email?: string; birthDate?: string },
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ access_token: string; refresh_token: string; user: Profile; biometric_enrollment_token?: string }> {
    // Check if email is already in use
    if (data.email) {
      const existingEmail = await this.profileRepository.findOne({
        where: { email: data.email },
      });
      if (existingEmail) {
        throw new ConflictException('Email already in use');
      }
    }

    // Create user profile with phone (no password)
    const user = this.profileRepository.create({
      email: data.email || null,
      full_name: data.fullName,
      phone: data.phone,
      phone_verified: true,
      birth_date: data.birthDate ? new Date(data.birthDate) : undefined,
      provider: 'phone',
      last_login_at: new Date(),
      preferences: {},
    });

    await this.profileRepository.save(user);

    // Log registration
    await this.auditLogService.log({
      userId: user.id,
      action: AuditAction.REGISTER,
      entityType: 'user',
      entityId: user.id,
      ipAddress,
      userAgent,
      success: true,
      metadata: { via: 'phone' },
    });

    const tokens = await this.tokenService.generateTokens(user);
    const biometric_enrollment_token = this.biometricService.generateEnrollmentToken(user.id);

    return {
      ...tokens,
      user,
      biometric_enrollment_token,
    };
  }

  /**
   * Generate phone verification token (social auth flow)
   * Used when an existing social user needs to verify their phone.
   */
  async generatePhoneVerificationToken(userId: string): Promise<string> {
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is required');
    }

    const expiry = Date.now() + 15 * 60 * 1000; // 15 minutes
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${userId}|${expiry}|phone_verify`)
      .digest('hex')
      .slice(0, 16);

    return Buffer.from(`${userId}|${expiry}|${signature}`).toString('base64');
  }

  /**
   * Generate tokens for a user (social auth flow)
   */
  async generateTokens(user: Profile): Promise<{ access_token: string; refresh_token: string; expires_in: number; biometric_enrollment_token?: string }> {
    // Update last login
    user.last_login_at = new Date();
    await this.profileRepository.save(user);

    const tokens = await this.tokenService.generateTokens(user);
    const biometric_enrollment_token = this.biometricService.generateEnrollmentToken(user.id);

    return {
      ...tokens,
      biometric_enrollment_token,
    };
  }
}

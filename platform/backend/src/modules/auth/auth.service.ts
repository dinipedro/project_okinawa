import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Profile } from '@/modules/users/entities/profile.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ConfirmResetPasswordDto } from './dto/confirm-reset-password.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { EmailService } from '@/common/services/email.service';
// Identity module services (provided globally)
import {
  TokenBlacklistService,
  AuditLogService,
  CredentialService,
  PasswordResetToken,
  AuditAction,
} from '@/modules/identity';

@Injectable()
export class AuthService {
  private readonly RESET_TOKEN_EXPIRY_MINUTES = 30;
  private readonly SALT_ROUNDS = 12;

  constructor(
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    @InjectRepository(PasswordResetToken)
    private resetTokenRepository: Repository<PasswordResetToken>,
    private jwtService: JwtService,
    private emailService: EmailService,
    // Identity module services (injected from global module)
    private tokenBlacklistService: TokenBlacklistService,
    private auditLogService: AuditLogService,
    private credentialService: CredentialService,
  ) {}

  async register(registerDto: RegisterDto, ipAddress?: string, userAgent?: string) {
    const existingUser = await this.profileRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Create user profile (no password in preferences anymore)
    const user = this.profileRepository.create({
      email: registerDto.email,
      full_name: registerDto.full_name,
      preferences: {},
    });

    await this.profileRepository.save(user);

    // Create credentials in separate table (secure storage)
    await this.credentialService.createCredential(user.id, registerDto.password);

    // Log registration
    await this.auditLogService.log({
      userId: user.id,
      action: AuditAction.REGISTER,
      entityType: 'user',
      entityId: user.id,
      ipAddress,
      userAgent,
      success: true,
    });

    const tokens = await this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
      },
      ...tokens,
    };
  }

  async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string) {
    const user = await this.profileRepository.findOne({
      where: { email: loginDto.email },
      relations: ['roles', 'roles.restaurant'],
    });

    if (!user) {
      await this.auditLogService.logFailedLogin(
        loginDto.email,
        ipAddress,
        userAgent,
        'User not found',
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check credentials using the new credential service
    const verifyResult = await this.credentialService.verifyPassword(
      user.id,
      loginDto.password,
      ipAddress,
    );

    if (verifyResult.locked) {
      await this.auditLogService.logAccountLockout(user.id, ipAddress, 'max_attempts');
      throw new ForbiddenException(
        'Account is temporarily locked due to too many failed login attempts. Please try again later.',
      );
    }

    if (!verifyResult.valid) {
      // Check if password is in old preferences format (migration support)
      const legacyPassword = user.preferences?.password;
      if (legacyPassword) {
        const isLegacyValid = await bcrypt.compare(loginDto.password, legacyPassword);
        if (isLegacyValid) {
          // Migrate to new credential table
          await this.credentialService.migrateFromPreferences(user.id, legacyPassword);
          // Clear password from preferences (security cleanup)
          user.preferences = { ...user.preferences };
          delete user.preferences.password;
          await this.profileRepository.save(user);
        } else {
          await this.auditLogService.logFailedLogin(
            loginDto.email,
            ipAddress,
            userAgent,
            `Invalid password. ${verifyResult.attemptsRemaining} attempts remaining.`,
          );
          throw new UnauthorizedException('Invalid credentials');
        }
      } else {
        await this.auditLogService.logFailedLogin(
          loginDto.email,
          ipAddress,
          userAgent,
          `Invalid password. ${verifyResult.attemptsRemaining} attempts remaining.`,
        );
        throw new UnauthorizedException('Invalid credentials');
      }
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Account is inactive');
    }

    // Log successful login
    await this.auditLogService.logLogin(user.id, ipAddress, userAgent);

    const tokens = await this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        roles: user.roles,
      },
      ...tokens,
    };
  }

  async logout(
    userId: string,
    accessToken: string,
    refreshToken?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    // Blacklist the access token using JTI
    const accessTokenPayload = this.jwtService.decode(accessToken) as any;
    if (accessTokenPayload?.exp && accessTokenPayload?.jti) {
      const expiresAt = new Date(accessTokenPayload.exp * 1000);
      await this.tokenBlacklistService.blacklistToken(
        accessTokenPayload.jti,
        userId,
        'access',
        expiresAt,
        'logout',
        ipAddress,
      );
    }

    // Blacklist the refresh token if provided using JTI
    if (refreshToken) {
      const refreshTokenPayload = this.jwtService.decode(refreshToken) as any;
      if (refreshTokenPayload?.exp && refreshTokenPayload?.jti) {
        const expiresAt = new Date(refreshTokenPayload.exp * 1000);
        await this.tokenBlacklistService.blacklistToken(
          refreshTokenPayload.jti,
          userId,
          'refresh',
          expiresAt,
          'logout',
          ipAddress,
        );
      }
    }

    // Log logout
    await this.auditLogService.logLogout(userId, ipAddress, userAgent);

    return { message: 'Logged out successfully' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.profileRepository.findOne({
      where: { email: resetPasswordDto.email },
    });

    if (!user) {
      // Don't reveal if email exists for security
      return { message: 'If email exists, reset instructions will be sent' };
    }

    // Invalidate any existing unused tokens for this user
    await this.resetTokenRepository.update(
      {
        user_id: user.id,
        is_used: false,
      },
      {
        is_used: true,
        used_at: new Date(),
      },
    );

    // Generate secure random token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.RESET_TOKEN_EXPIRY_MINUTES);

    // Save token to database
    const resetToken = this.resetTokenRepository.create({
      user_id: user.id,
      token: token,
      expires_at: expiresAt,
      is_used: false,
    });

    await this.resetTokenRepository.save(resetToken);

    // Send email with reset link
    await this.emailService.sendPasswordResetEmail(user.email, token, user.full_name);

    // Delete expired tokens (cleanup)
    await this.resetTokenRepository.delete({
      expires_at: LessThan(new Date()),
    });

    return { message: 'If email exists, reset instructions will be sent' };
  }

  async confirmResetPassword(
    confirmResetPasswordDto: ConfirmResetPasswordDto,
    ipAddress?: string,
    userAgent?: string,
  ) {
    // Find valid token
    const resetToken = await this.resetTokenRepository.findOne({
      where: {
        token: confirmResetPasswordDto.token,
        is_used: false,
      },
    });

    if (!resetToken) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Check if token has expired
    if (new Date() > resetToken.expires_at) {
      throw new BadRequestException('Reset token has expired');
    }

    // Get user
    const user = await this.profileRepository.findOne({
      where: { id: resetToken.user_id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Change password using credential service
    const result = await this.credentialService.changePassword(
      user.id,
      confirmResetPasswordDto.new_password,
    );

    if (!result.success) {
      throw new BadRequestException(result.message);
    }

    // Mark token as used
    resetToken.is_used = true;
    resetToken.used_at = new Date();
    await this.resetTokenRepository.save(resetToken);

    // Log password change
    await this.auditLogService.logPasswordChange(user.id, ipAddress, userAgent);

    // Send confirmation email
    await this.emailService.sendPasswordChangedEmail(user.email, user.full_name);

    return {
      message: 'Password has been reset successfully',
      success: true,
    };
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

  private async generateTokens(user: Profile) {
    // Load roles if not already loaded
    let userWithRoles = user;
    if (!user.roles) {
      const loaded = await this.profileRepository.findOne({
        where: { id: user.id },
        relations: ['roles', 'roles.restaurant'],
      });
      if (loaded) {
        userWithRoles = loaded;
      }
    }

    // Extract restaurant IDs and roles
    const restaurants =
      userWithRoles?.roles?.map((role) => ({
        id: role.restaurant_id,
        role: role.role,
        name: role.restaurant?.name,
      })) || [];

    const now = Math.floor(Date.now() / 1000);

    // Generate unique JTI (JWT ID) for each token - enables secure blacklisting
    const accessJti = crypto.randomUUID();
    const refreshJti = crypto.randomUUID();

    const basePayload = {
      sub: user.id,
      email: user.email,
      full_name: user.full_name,
      roles: userWithRoles?.roles?.map((r) => r.role) || [],
      restaurants: restaurants,
      restaurant_id: restaurants.length > 0 ? restaurants[0].id : null,
      iat: now,
    };

    const accessToken = this.jwtService.sign({ ...basePayload, jti: accessJti });
    const refreshToken = this.jwtService.sign({ ...basePayload, jti: refreshJti }, {
      expiresIn: '7d',
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 900, // 15 minutes in seconds (access token lifetime)
      refresh_expires_in: 604800, // 7 days in seconds (refresh token lifetime)
    };
  }

  async refreshToken(refreshToken: string, ipAddress?: string) {
    // Decode token to get JTI for blacklist check
    const decodedPayload = this.jwtService.decode(refreshToken) as any;
    if (!decodedPayload?.jti) {
      throw new UnauthorizedException('Invalid token format');
    }

    // Check if token is blacklisted using JTI
    const isBlacklisted = await this.tokenBlacklistService.isTokenBlacklisted(decodedPayload.jti);
    if (isBlacklisted) {
      throw new UnauthorizedException('Token has been revoked');
    }

    try {
      // Verify the refresh token
      const payload = this.jwtService.verify(refreshToken);

      // Get fresh user data
      const user = await this.profileRepository.findOne({
        where: { id: payload.sub },
        relations: ['roles', 'roles.restaurant'],
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if (!user.is_active) {
        throw new UnauthorizedException('Account is inactive');
      }

      // Blacklist the old refresh token using JTI (token rotation for security)
      const expiresAt = new Date(payload.exp * 1000);
      await this.tokenBlacklistService.blacklistToken(
        payload.jti,
        user.id,
        'refresh',
        expiresAt,
        'token_rotation',
        ipAddress,
      );

      // Generate new tokens
      const tokens = await this.generateTokens(user);

      return {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          avatar_url: user.avatar_url,
          roles: user.roles,
        },
        ...tokens,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
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

      // Verify current password
      const verifyResult = await this.credentialService.verifyPassword(
        userId,
        updateAuthDto.current_password,
      );

      if (!verifyResult.valid) {
        // Try legacy password if credential service fails
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

      // Change password using credential service
      const result = await this.credentialService.changePassword(userId, updateAuthDto.password);

      if (!result.success) {
        throw new BadRequestException(result.message);
      }

      // Log password change
      await this.auditLogService.logPasswordChange(userId, ipAddress, userAgent);

      // Send confirmation email
      await this.emailService.sendPasswordChangedEmail(user.email, user.full_name);
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
    const payload = this.jwtService.decode(token) as any;
    if (!payload?.jti) {
      return false; // Tokens without JTI cannot be in blacklist
    }
    return this.tokenBlacklistService.isTokenBlacklisted(payload.jti);
  }

  /**
   * Validate user password (for MFA disable flow)
   */
  async validatePassword(userId: string, password: string): Promise<boolean> {
    const verifyResult = await this.credentialService.verifyPassword(userId, password);

    if (verifyResult.valid) {
      return true;
    }

    // Try legacy password if credential service fails
    const user = await this.profileRepository.findOne({
      where: { id: userId },
    });

    if (user?.preferences?.password) {
      return bcrypt.compare(password, user.preferences.password);
    }

    return false;
  }
}

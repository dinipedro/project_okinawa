import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserCredential } from '../entities/user-credential.entity';

const PASSWORD_EXPIRY_DAYS = 90; // Password expires after 90 days
const PASSWORD_WARNING_DAYS = 14; // Warn user 14 days before expiry

@Injectable()
export class PasswordExpiryGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(UserCredential)
    private credentialRepository: Repository<UserCredential>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is marked to skip password expiry check
    const skipExpiry = this.reflector.getAllAndOverride<boolean>('skipPasswordExpiry', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skipExpiry) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.id) {
      return true; // No user, let other guards handle it
    }

    // Routes that should be accessible even with expired password
    const allowedRoutes = [
      '/auth/change-password',
      '/auth/logout',
      '/auth/me',
      '/auth/mfa/status',
    ];

    const currentPath = request.path;
    if (allowedRoutes.some(route => currentPath.includes(route))) {
      return true;
    }

    const credential = await this.credentialRepository.findOne({
      where: { user_id: user.id },
      select: ['password_changed_at'],
    });

    if (!credential?.password_changed_at) {
      // No password change date, allow access but might want to prompt for update
      return true;
    }

    const passwordAge = this.getPasswordAgeDays(credential.password_changed_at);
    const daysUntilExpiry = PASSWORD_EXPIRY_DAYS - passwordAge;

    // Add warning header if password is close to expiry
    if (daysUntilExpiry <= PASSWORD_WARNING_DAYS && daysUntilExpiry > 0) {
      const response = context.switchToHttp().getResponse();
      response.setHeader('X-Password-Expiring', 'true');
      response.setHeader('X-Password-Days-Remaining', daysUntilExpiry.toString());
    }

    // Block access if password has expired
    if (passwordAge >= PASSWORD_EXPIRY_DAYS) {
      throw new ForbiddenException({
        statusCode: 403,
        error: 'PasswordExpired',
        message: 'Your password has expired. Please change your password to continue.',
        passwordExpired: true,
        daysExpired: passwordAge - PASSWORD_EXPIRY_DAYS,
      });
    }

    return true;
  }

  private getPasswordAgeDays(passwordChangedAt: Date): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - new Date(passwordChangedAt).getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }
}

/**
 * Decorator to skip password expiry check for specific routes
 */
import { SetMetadata } from '@nestjs/common';
export const SkipPasswordExpiry = () => SetMetadata('skipPasswordExpiry', true);

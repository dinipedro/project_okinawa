/**
 * Social Auth Controller
 * 
 * Handles OAuth authentication with Apple and Google.
 */

import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { Public } from '@/common/decorators/public.decorator';
import { SocialAuthService } from '../services/social-auth.service';
import { AuthService } from '../auth.service';
import { SocialAuthDto } from '../dto/social-auth.dto';

@ApiTags('auth/social')
@Controller('auth/social')
export class SocialAuthController {
  constructor(
    private readonly socialAuthService: SocialAuthService,
    private readonly authService: AuthService,
  ) {}

  private getClientIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    return req.ip || req.socket?.remoteAddress || 'unknown';
  }

  @Public()
  @Post()
  @Throttle({ strict: { ttl: 60000, limit: 10 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate with Apple ID or Google' })
  @ApiResponse({ status: 200, description: 'Authenticated successfully' })
  @ApiResponse({ status: 201, description: 'New user - phone verification required' })
  @ApiResponse({ status: 401, description: 'Invalid token' })
  async authenticate(
    @Body() socialAuthDto: SocialAuthDto,
    @Req() req: Request,
    @Headers('user-agent') userAgent?: string,
  ) {
    const ipAddress = this.getClientIp(req);

    const result = await this.socialAuthService.authenticate(
      socialAuthDto.provider,
      socialAuthDto.id_token,
      socialAuthDto.device_info,
      ipAddress,
    );

    if (result.isNewUser) {
      // New user - needs phone verification
      return {
        status: 'pending_phone_verification',
        temp_token: result.tempToken,
        user_preview: {
          email: result.providerData.email,
          name: result.providerData.name,
          avatar_url: result.providerData.avatarUrl,
        },
      };
    }

    if (result.needsPhoneVerification && result.user) {
      // Existing user but phone not verified
      return {
        status: 'phone_verification_required',
        temp_token: await this.authService.generatePhoneVerificationToken(result.user.id),
        user: {
          id: result.user.id,
          email: result.user.email,
          full_name: result.user.full_name,
        },
      };
    }

    // Fully authenticated user
    const tokens = await this.authService.generateTokens(result.user!);

    return {
      status: 'authenticated',
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
      user: {
        id: result.user!.id,
        email: result.user!.email,
        full_name: result.user!.full_name,
        avatar_url: result.user!.avatar_url,
        phone_verified: result.user!.phone_verified,
      },
      biometric_enrollment_token: tokens.biometric_enrollment_token,
    };
  }
}

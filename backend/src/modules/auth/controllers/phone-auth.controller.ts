/**
 * Phone Auth Controller
 * 
 * Handles phone-based OTP authentication endpoints.
 * Supports registration, login, and verification flows.
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
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { Public } from '@/common/decorators/public.decorator';
import { OTPService } from '../services/otp.service';
import { AuthService } from '../auth.service';
import {
  SendOTPDto,
  VerifyOTPDto,
  CompletePhoneRegistrationDto,
  OTPPurpose,
} from '../dto/phone-auth.dto';

@ApiTags('auth/phone')
@Controller('auth/phone')
export class PhoneAuthController {
  constructor(
    private readonly otpService: OTPService,
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
  @Post('send-otp')
  @Throttle({ strict: { ttl: 60000, limit: 5 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send OTP to phone number' })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  @ApiResponse({ status: 429, description: 'Too many requests - rate limited' })
  async sendOTP(
    @Body() sendOtpDto: SendOTPDto,
    @Req() req: Request,
  ) {
    const ipAddress = this.getClientIp(req);
    const result = await this.otpService.sendOTP(
      sendOtpDto.phone_number,
      sendOtpDto.channel,
      sendOtpDto.purpose,
      ipAddress,
    );
    return result;
  }

  @Public()
  @Post('verify-otp')
  @Throttle({ strict: { ttl: 60000, limit: 10 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP and authenticate/register user' })
  @ApiResponse({ status: 200, description: 'OTP verified successfully' })
  @ApiResponse({ status: 401, description: 'Invalid OTP code' })
  @ApiResponse({ status: 429, description: 'Too many failed attempts' })
  async verifyOTP(
    @Body() verifyOtpDto: VerifyOTPDto,
    @Req() req: Request,
    @Headers('user-agent') userAgent?: string,
  ) {
    const ipAddress = this.getClientIp(req);

    // Verify OTP
    const otpResult = await this.otpService.verifyOTP(
      verifyOtpDto.phone_number,
      verifyOtpDto.otp_code,
      ipAddress,
    );

    if (!otpResult.valid) {
      return {
        success: false,
        message: 'Invalid or expired verification code',
        attempts_remaining: otpResult.attemptsRemaining,
      };
    }

    // Check if this is a social login completion flow
    if (verifyOtpDto.temp_token) {
      // Social login flow - phone verification after social auth
      return {
        success: true,
        status: 'phone_verified',
        temp_token: otpResult.tempToken,
        message: 'Phone verified. Complete registration.',
      };
    }

    // Check if user exists with this phone
    const existingUser = await this.authService.findUserByPhone(verifyOtpDto.phone_number);

    if (existingUser) {
      // Existing user - login
      const tokens = await this.authService.loginByPhone(
        existingUser,
        ipAddress,
        userAgent,
      );

      return {
        success: true,
        status: 'authenticated',
        ...tokens,
        user: {
          id: existingUser.id,
          email: existingUser.email,
          full_name: existingUser.full_name,
          phone_verified: true,
        },
        biometric_enrollment_token: tokens.biometric_enrollment_token,
      };
    }

    // New user - need to complete registration
    return {
      success: true,
      status: 'registration_required',
      temp_token: otpResult.tempToken,
      message: 'Phone verified. Complete your profile.',
    };
  }

  @Public()
  @Post('complete-registration')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Complete phone registration with profile data' })
  @ApiResponse({ status: 201, description: 'Registration completed' })
  @ApiResponse({ status: 400, description: 'Invalid or expired temp token' })
  async completeRegistration(
    @Body() completeDto: CompletePhoneRegistrationDto,
    @Req() req: Request,
    @Headers('user-agent') userAgent?: string,
  ) {
    const ipAddress = this.getClientIp(req);

    // Validate temp token
    const tokenData = this.otpService.validateTempToken(completeDto.temp_token);
    if (!tokenData.valid || !tokenData.phoneNumber) {
      return {
        success: false,
        message: 'Registration session expired. Please verify your phone again.',
      };
    }

    // Create user
    const result = await this.authService.registerByPhone({
      phone: tokenData.phoneNumber,
      fullName: completeDto.full_name,
      email: completeDto.email,
      birthDate: completeDto.birth_date,
    }, ipAddress, userAgent);

    return {
      success: true,
      status: 'authenticated',
      access_token: result.access_token,
      refresh_token: result.refresh_token,
      user: {
        id: result.user.id,
        email: result.user.email,
        full_name: result.user.full_name,
        phone_verified: true,
      },
      biometric_enrollment_token: result.biometric_enrollment_token,
    };
  }
}

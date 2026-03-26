/**
 * OTP Authentication Service
 * 
 * Handles phone-based OTP authentication via WhatsApp and SMS.
 * Follows the Okinawa authentication specification.
 */

import ApiService from './api';
import { secureStorage } from './secure-storage';
import logger from '../utils/logger';

export type OTPChannel = 'whatsapp' | 'sms';
export type OTPPurpose = 'registration' | 'login' | 'verification';

export interface SendOTPRequest {
  phoneNumber: string;
  channel?: OTPChannel;
  purpose: OTPPurpose;
}

export interface SendOTPResponse {
  success: boolean;
  message: string;
  channel: OTPChannel;
  expiresAt?: string;
  retryAfter?: number;
}

export interface VerifyOTPRequest {
  phoneNumber: string;
  code: string;
  tempToken?: string;
  deviceInfo?: {
    deviceId: string;
    platform: 'ios' | 'android' | 'web';
    model?: string;
    osVersion?: string;
  };
}

export interface VerifyOTPResponse {
  success: boolean;
  status: 'authenticated' | 'registration_required' | 'phone_verified';
  accessToken?: string;
  refreshToken?: string;
  biometricEnrollmentToken?: string;
  user?: {
    id: string;
    email?: string;
    fullName?: string;
    phoneVerified: boolean;
  };
  message?: string;
}

class OTPAuthService {
  private baseUrl = '/auth/phone';

  /**
   * Send OTP code to phone number
   * Priority: WhatsApp → SMS
   */
  async sendOTP(request: SendOTPRequest): Promise<SendOTPResponse> {
    try {
      logger.info('Sending OTP', { 
        phone: this.maskPhone(request.phoneNumber),
        channel: request.channel || 'whatsapp',
        purpose: request.purpose,
      });

      const response = await ApiService.post(`${this.baseUrl}/send-otp`, {
        phone_number: request.phoneNumber,
        channel: request.channel || 'whatsapp',
        purpose: request.purpose,
      });

      return {
        success: true,
        message: response.data.message || 'OTP sent successfully',
        channel: response.data.channel || request.channel || 'whatsapp',
        expiresAt: response.data.expires_at,
        retryAfter: response.data.retry_after,
      };
    } catch (error: any) {
      logger.error('Send OTP failed', error);

      // Handle rate limiting
      if (error.response?.status === 429) {
        return {
          success: false,
          message: 'Too many attempts. Please wait before trying again.',
          channel: request.channel || 'whatsapp',
          retryAfter: error.response.data?.retry_after || 60,
        };
      }

      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send OTP',
        channel: request.channel || 'whatsapp',
      };
    }
  }

  /**
   * Verify OTP code and authenticate/register user
   */
  async verifyOTP(request: VerifyOTPRequest): Promise<VerifyOTPResponse> {
    try {
      logger.info('Verifying OTP', { 
        phone: this.maskPhone(request.phoneNumber),
      });

      const response = await ApiService.post(`${this.baseUrl}/verify-otp`, {
        phone_number: request.phoneNumber,
        otp_code: request.code,
        temp_token: request.tempToken,
        device_info: request.deviceInfo,
      });

      const data = response.data;

      // Store tokens if authenticated
      if (data.access_token) {
        await Promise.all([
          secureStorage.setAccessToken(data.access_token),
          secureStorage.setRefreshToken(data.refresh_token),
          data.user && secureStorage.setUser(data.user),
        ]);
      }

      return {
        success: true,
        status: data.status,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        biometricEnrollmentToken: data.biometric_enrollment_token,
        user: data.user ? {
          id: data.user.id,
          email: data.user.email,
          fullName: data.user.full_name,
          phoneVerified: data.user.phone_verified || true,
        } : undefined,
      };
    } catch (error: any) {
      logger.error('Verify OTP failed', error);

      // Handle invalid code
      if (error.response?.status === 401) {
        return {
          success: false,
          status: 'authenticated',
          message: 'Invalid or expired code. Please try again.',
        };
      }

      // Handle too many attempts
      if (error.response?.status === 429) {
        return {
          success: false,
          status: 'authenticated',
          message: 'Too many failed attempts. Please request a new code.',
        };
      }

      return {
        success: false,
        status: 'authenticated',
        message: error.response?.data?.message || 'Verification failed',
      };
    }
  }

  /**
   * Complete registration after phone verification
   */
  async completeRegistration(data: {
    tempToken: string;
    fullName: string;
    email?: string;
    birthDate?: string;
    acceptedTermsVersion?: string;
    acceptedPrivacyVersion?: string;
    marketingConsent?: boolean;
  }): Promise<VerifyOTPResponse> {
    try {
      logger.info('Completing registration');

      const response = await ApiService.post(`${this.baseUrl}/complete-registration`, {
        temp_token: data.tempToken,
        full_name: data.fullName,
        email: data.email,
        birth_date: data.birthDate,
        accepted_terms_version: data.acceptedTermsVersion,
        accepted_privacy_version: data.acceptedPrivacyVersion,
        marketing_consent: data.marketingConsent,
      });

      const responseData = response.data;

      // Store tokens
      if (responseData.access_token) {
        await Promise.all([
          secureStorage.setAccessToken(responseData.access_token),
          secureStorage.setRefreshToken(responseData.refresh_token),
          responseData.user && secureStorage.setUser(responseData.user),
        ]);
      }

      return {
        success: true,
        status: 'authenticated',
        accessToken: responseData.access_token,
        refreshToken: responseData.refresh_token,
        biometricEnrollmentToken: responseData.biometric_enrollment_token,
        user: responseData.user ? {
          id: responseData.user.id,
          email: responseData.user.email,
          fullName: responseData.user.full_name,
          phoneVerified: true,
        } : undefined,
      };
    } catch (error: any) {
      logger.error('Complete registration failed', error);
      return {
        success: false,
        status: 'registration_required',
        message: error.response?.data?.message || 'Registration failed',
      };
    }
  }

  /**
   * Mask phone number for logging (privacy)
   */
  private maskPhone(phone: string): string {
    if (phone.length < 6) return '***';
    return phone.slice(0, 4) + '****' + phone.slice(-2);
  }
}

export const otpAuthService = new OTPAuthService();
export default otpAuthService;

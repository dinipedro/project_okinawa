import { IsNotEmpty, IsString, IsEnum, IsOptional, Length, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export enum OTPChannel {
  WHATSAPP = 'whatsapp',
  SMS = 'sms',
}

export enum OTPPurpose {
  REGISTRATION = 'registration',
  LOGIN = 'login',
  VERIFICATION = 'verification',
}

export class SendOTPDto {
  @ApiProperty({
    description: 'Phone number with country code',
    example: '+5511999999999',
  })
  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^\+\d{10,15}$/, { message: 'Invalid phone number format. Use +[country code][number]' })
  @Transform(({ value }) => value?.replace(/\s/g, ''))
  phone_number: string;

  @ApiPropertyOptional({
    description: 'Channel to send OTP (defaults to WhatsApp)',
    enum: OTPChannel,
    default: OTPChannel.WHATSAPP,
  })
  @IsEnum(OTPChannel)
  @IsOptional()
  channel?: OTPChannel = OTPChannel.WHATSAPP;

  @ApiProperty({
    description: 'Purpose of the OTP',
    enum: OTPPurpose,
  })
  @IsEnum(OTPPurpose)
  @IsNotEmpty()
  purpose: OTPPurpose;
}

export class VerifyOTPDto {
  @ApiProperty({
    description: 'Phone number with country code',
    example: '+5511999999999',
  })
  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  @Transform(({ value }) => value?.replace(/\s/g, ''))
  phone_number: string;

  @ApiProperty({
    description: '6-digit OTP code',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty({ message: 'OTP code is required' })
  @Length(6, 6, { message: 'OTP code must be 6 digits' })
  @Matches(/^\d{6}$/, { message: 'OTP code must contain only numbers' })
  otp_code: string;

  @ApiPropertyOptional({
    description: 'Temporary token from social login flow',
  })
  @IsString()
  @IsOptional()
  temp_token?: string;

  @ApiPropertyOptional({
    description: 'Device information for session binding',
  })
  @IsOptional()
  device_info?: {
    device_id: string;
    platform: 'ios' | 'android' | 'web';
    model?: string;
    os_version?: string;
  };
}

export class CompletePhoneRegistrationDto {
  @ApiProperty({
    description: 'Temporary token from OTP verification',
  })
  @IsString()
  @IsNotEmpty()
  temp_token: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  @Transform(({ value }) => value?.trim())
  full_name: string;

  @ApiPropertyOptional({
    description: 'Optional email address',
    example: 'user@example.com',
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email?: string;

  @ApiPropertyOptional({
    description: 'Optional birth date (YYYY-MM-DD)',
    example: '1990-01-15',
  })
  @IsString()
  @IsOptional()
  birth_date?: string;
}

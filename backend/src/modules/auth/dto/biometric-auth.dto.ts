import { IsNotEmpty, IsString, IsEnum, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum BiometricAuthType {
  FACE_ID = 'face_id',
  TOUCH_ID = 'touch_id',
  FINGERPRINT = 'fingerprint',
}

export class BiometricEnrollDto {
  @ApiProperty({
    description: 'Enrollment token received after authentication',
  })
  @IsString()
  @IsNotEmpty({ message: 'Enrollment token is required' })
  enrollment_token: string;

  @ApiProperty({
    description: 'Type of biometric authentication',
    enum: BiometricAuthType,
  })
  @IsEnum(BiometricAuthType)
  @IsNotEmpty()
  biometric_type: BiometricAuthType;

  @ApiPropertyOptional({
    description: 'Device information',
  })
  @IsObject()
  @IsOptional()
  device_info?: {
    device_id: string;
    platform: 'ios' | 'android';
    model?: string;
    os_version?: string;
  };

  @ApiPropertyOptional({
    description: 'Public key generated on device for asymmetric auth',
  })
  @IsString()
  @IsOptional()
  public_key?: string;
}

export class BiometricAuthenticateDto {
  @ApiProperty({
    description: 'Biometric token stored on device',
  })
  @IsString()
  @IsNotEmpty({ message: 'Biometric token is required' })
  biometric_token: string;

  @ApiPropertyOptional({
    description: 'Signature for challenge verification (if using asymmetric)',
  })
  @IsString()
  @IsOptional()
  signature?: string;

  @ApiPropertyOptional({
    description: 'Device information',
  })
  @IsObject()
  @IsOptional()
  device_info?: {
    device_id: string;
    platform: 'ios' | 'android';
    model?: string;
    os_version?: string;
  };
}

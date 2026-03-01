import { IsNotEmpty, IsString, IsEnum, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum SocialProvider {
  APPLE = 'apple',
  GOOGLE = 'google',
}

export class SocialAuthDto {
  @ApiProperty({
    description: 'Social provider (apple or google)',
    enum: SocialProvider,
  })
  @IsEnum(SocialProvider)
  @IsNotEmpty()
  provider: SocialProvider;

  @ApiProperty({
    description: 'ID token from the OAuth provider',
  })
  @IsString()
  @IsNotEmpty({ message: 'ID token is required' })
  id_token: string;

  @ApiPropertyOptional({
    description: 'Device information for session binding',
  })
  @IsObject()
  @IsOptional()
  device_info?: {
    device_id: string;
    platform: 'ios' | 'android' | 'web';
    model?: string;
    os_version?: string;
  };
}

export class VerifyPhoneAfterSocialDto {
  @ApiProperty({
    description: 'Temporary token from social login',
  })
  @IsString()
  @IsNotEmpty()
  temp_token: string;

  @ApiProperty({
    description: 'Phone number to verify',
    example: '+5511999999999',
  })
  @IsString()
  @IsNotEmpty()
  phone_number: string;
}

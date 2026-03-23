import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsEmail, IsPhoneNumber, IsEnum } from 'class-validator';

export enum InviteMethod {
  APP = 'app',
  SMS = 'sms',
  EMAIL = 'email',
  LINK = 'link',
}

export class InviteGuestDto {
  @ApiPropertyOptional({ description: 'User ID if guest has app account' })
  @IsOptional()
  @IsString()
  guest_user_id?: string;

  @ApiPropertyOptional({ description: 'Guest name' })
  @IsOptional()
  @IsString()
  guest_name?: string;

  @ApiPropertyOptional({ description: 'Guest phone number' })
  @IsOptional()
  @IsPhoneNumber()
  guest_phone?: string;

  @ApiPropertyOptional({ description: 'Guest email' })
  @IsOptional()
  @IsEmail()
  guest_email?: string;

  @ApiProperty({
    description: 'Invite method',
    enum: InviteMethod,
    default: InviteMethod.APP
  })
  @IsNotEmpty()
  @IsEnum(InviteMethod)
  invite_method: InviteMethod;

  @ApiPropertyOptional({ description: 'Requires host approval before accepting' })
  @IsOptional()
  requires_host_approval?: boolean;
}

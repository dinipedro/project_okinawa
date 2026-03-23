import { IsOptional, IsBoolean, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class UpdateNotificationDto {
  @ApiPropertyOptional({ description: 'Notification title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Notification message' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({ description: 'Read status' })
  @IsOptional()
  @IsBoolean()
  is_read?: boolean;

  // Exclude system fields from being set by users
  @Exclude()
  id?: string;

  @Exclude()
  user_id?: string;

  @Exclude()
  created_at?: Date;

  @Exclude()
  updated_at?: Date;
}

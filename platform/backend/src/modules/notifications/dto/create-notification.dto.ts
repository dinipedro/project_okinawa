import { IsNotEmpty, IsString, IsOptional, IsEnum, IsUUID, MaxLength, IsUrl, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { NotificationType, RelatedType } from '../entities/notification.entity';

export class CreateNotificationDto {
  @ApiProperty({
    description: 'User UUID to send notification to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({ message: 'User ID is required' })
  @IsUUID('4', { message: 'User ID must be a valid UUID' })
  user_id: string;

  @ApiProperty({
    description: 'Notification title',
    example: 'Order Ready',
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'Title is required' })
  @IsString({ message: 'Title must be a string' })
  @MaxLength(100, { message: 'Title cannot exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  title: string;

  @ApiProperty({
    description: 'Notification message body',
    example: 'Your order #1234 is ready for pickup',
    maxLength: 500,
  })
  @IsNotEmpty({ message: 'Message is required' })
  @IsString({ message: 'Message must be a string' })
  @MaxLength(500, { message: 'Message cannot exceed 500 characters' })
  @Transform(({ value }) => value?.trim())
  message: string;

  @ApiPropertyOptional({
    description: 'Notification type',
    enum: NotificationType,
    example: 'order',
  })
  @IsOptional()
  @IsEnum(NotificationType, { message: 'Invalid notification type' })
  type?: NotificationType;

  @ApiPropertyOptional({
    description: 'Type of related entity',
    enum: RelatedType,
    example: 'order',
  })
  @IsOptional()
  @IsEnum(RelatedType, { message: 'Invalid related type' })
  related_type?: RelatedType;

  @ApiPropertyOptional({
    description: 'Related entity UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Related ID must be a valid UUID' })
  related_id?: string;

  @ApiPropertyOptional({
    description: 'Action URL for the notification',
    example: '/orders/1234',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Action URL must be a string' })
  @MaxLength(500, { message: 'Action URL cannot exceed 500 characters' })
  action_url?: string;

  @ApiPropertyOptional({
    description: 'Additional notification data',
    example: { order_id: '1234', amount: 50.00 },
  })
  @IsOptional()
  @IsObject({ message: 'Data must be an object' })
  data?: Record<string, any>;
}

import { IsNotEmpty, IsString, IsArray, IsOptional, IsUrl, IsBoolean, IsUUID, MaxLength, ArrayMinSize, ArrayMaxSize, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { WebhookEvent } from '../entities/webhook-subscription.entity';

export class CreateWebhookSubscriptionDto {
  @ApiProperty({
    description: 'Restaurant UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({ message: 'Restaurant ID is required' })
  @IsUUID('4', { message: 'Restaurant ID must be a valid UUID' })
  restaurant_id: string;

  @ApiProperty({
    description: 'Webhook endpoint URL (HTTPS required)',
    example: 'https://example.com/webhook',
  })
  @IsNotEmpty({ message: 'URL is required' })
  @IsUrl({ protocols: ['https'], require_protocol: true }, { message: 'URL must be a valid HTTPS URL' })
  url: string;

  @ApiProperty({
    description: 'Events to subscribe to',
    type: [String],
    enum: WebhookEvent,
    example: ['order.created', 'order.updated'],
  })
  @IsNotEmpty({ message: 'At least one event is required' })
  @IsArray({ message: 'Events must be an array' })
  @ArrayMinSize(1, { message: 'At least one event is required' })
  @ArrayMaxSize(50, { message: 'Cannot subscribe to more than 50 events' })
  events: WebhookEvent[];

  @ApiPropertyOptional({
    description: 'Description of the webhook subscription',
    example: 'Order notifications for POS system',
    maxLength: 200,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(200, { message: 'Description cannot exceed 200 characters' })
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiPropertyOptional({
    description: 'Custom headers to include in webhook requests',
    example: { 'X-API-Key': 'your-api-key' },
  })
  @IsOptional()
  @IsObject({ message: 'Headers must be an object' })
  headers?: Record<string, string>;
}

export class UpdateWebhookSubscriptionDto {
  @ApiPropertyOptional({
    description: 'New webhook endpoint URL',
    example: 'https://example.com/webhook-v2',
  })
  @IsOptional()
  @IsUrl({ protocols: ['https'], require_protocol: true }, { message: 'URL must be a valid HTTPS URL' })
  url?: string;

  @ApiPropertyOptional({
    description: 'Events to subscribe to',
    type: [String],
    enum: WebhookEvent,
  })
  @IsOptional()
  @IsArray({ message: 'Events must be an array' })
  @ArrayMaxSize(50, { message: 'Cannot subscribe to more than 50 events' })
  events?: WebhookEvent[];

  @ApiPropertyOptional({
    description: 'Whether the webhook subscription is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'is_active must be a boolean' })
  is_active?: boolean;

  @ApiPropertyOptional({
    description: 'Description of the webhook subscription',
    maxLength: 200,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(200, { message: 'Description cannot exceed 200 characters' })
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiPropertyOptional({
    description: 'Custom headers to include in webhook requests',
  })
  @IsOptional()
  @IsObject({ message: 'Headers must be an object' })
  headers?: Record<string, string>;
}

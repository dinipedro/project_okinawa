import {
  IsString,
  IsBoolean,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsEnum,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { PlatformName } from '../interfaces/platform-adapter.interface';

export class CreatePlatformConnectionDto {
  @ApiProperty({ description: 'Restaurant UUID' })
  @IsString()
  restaurant_id: string;

  @ApiProperty({ enum: ['ifood', 'rappi', 'ubereats'], description: 'Delivery platform name' })
  @IsEnum(['ifood', 'rappi', 'ubereats'] as const)
  platform: PlatformName;

  @ApiProperty({ description: 'Platform API credentials (encrypted at rest)' })
  @IsObject()
  credentials: Record<string, any>;

  @ApiPropertyOptional({ description: 'Webhook signing secret for signature validation' })
  @IsOptional()
  @IsString()
  webhook_secret?: string;

  @ApiPropertyOptional({ description: 'Whether the connection is active', default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({ description: 'Auto-accept incoming orders', default: true })
  @IsOptional()
  @IsBoolean()
  auto_accept?: boolean;

  @ApiPropertyOptional({ description: 'Maximum concurrent orders before rejection', default: 30 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(200)
  max_concurrent_orders?: number;

  @ApiPropertyOptional({ description: 'Order count threshold for high-load delay', default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(200)
  high_load_threshold?: number;
}

export class UpdatePlatformConnectionDto extends PartialType(CreatePlatformConnectionDto) {}

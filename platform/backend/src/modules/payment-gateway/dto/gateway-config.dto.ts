import { IsString, IsOptional, IsBoolean, IsEnum, IsUUID, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for creating or updating a gateway config per restaurant.
 */
export class CreateGatewayConfigDto {
  @ApiProperty({ description: 'Restaurant ID' })
  @IsUUID()
  restaurant_id: string;

  @ApiProperty({
    description: 'Gateway provider',
    enum: ['asaas', 'stripe_terminal'],
    example: 'asaas',
  })
  @IsEnum(['asaas', 'stripe_terminal'] as const)
  provider: 'asaas' | 'stripe_terminal';

  @ApiProperty({
    description: 'Provider credentials (API keys, etc.)',
    example: { api_key: 'xxx', webhook_token: 'yyy', environment: 'sandbox' },
  })
  @IsObject()
  credentials: Record<string, any>;

  @ApiPropertyOptional({ description: 'Whether this config is active', default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({
    description: 'Provider-specific settings',
    example: { max_installments: 12, pix_expiration_seconds: 600 },
  })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}

export class UpdateGatewayConfigDto {
  @ApiPropertyOptional({ description: 'Provider credentials' })
  @IsOptional()
  @IsObject()
  credentials?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Whether this config is active' })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({ description: 'Provider-specific settings' })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}

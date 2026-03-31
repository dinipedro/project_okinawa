import { IsBoolean, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpsertLoyaltyConfigDto {
  @ApiPropertyOptional({ description: 'Enable cashback', default: false })
  @IsOptional()
  @IsBoolean()
  cashback_enabled?: boolean;

  @ApiPropertyOptional({ description: 'Cashback percentage (0-100)', default: 5.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  cashback_percentage?: number;

  @ApiPropertyOptional({ description: 'Enable points system', default: false })
  @IsOptional()
  @IsBoolean()
  points_enabled?: boolean;

  @ApiPropertyOptional({ description: 'Points per R$ spent', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  points_per_real?: number;

  @ApiPropertyOptional({ description: 'Points redemption rate (1 point = X reais)', default: 0.01 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  points_redemption_rate?: number;

  @ApiPropertyOptional({ description: 'Minimum points for redemption', default: 100 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  min_points_for_redemption?: number;
}

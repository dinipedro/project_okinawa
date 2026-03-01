import { IsUUID, IsOptional, IsDateString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum AnalyticsPeriod {
  TODAY = 'today',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
  CUSTOM = 'custom',
}

export class AnalyticsQueryDto {
  @ApiProperty({
    description: 'Restaurant UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'Restaurant ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Restaurant ID is required' })
  restaurant_id: string;

  @ApiPropertyOptional({
    description: 'Start date (ISO 8601 format)',
    example: '2025-01-01',
  })
  @IsDateString({}, { message: 'Start date must be in ISO 8601 format' })
  @IsOptional()
  start_date?: string;

  @ApiPropertyOptional({
    description: 'End date (ISO 8601 format)',
    example: '2025-01-31',
  })
  @IsDateString({}, { message: 'End date must be in ISO 8601 format' })
  @IsOptional()
  end_date?: string;

  @ApiPropertyOptional({
    description: 'Predefined time period',
    enum: AnalyticsPeriod,
    example: 'month',
  })
  @IsOptional()
  @IsEnum(AnalyticsPeriod, { message: 'Invalid analytics period' })
  period?: AnalyticsPeriod;
}

export class RealtimeMetricsDto {
  @ApiProperty({
    description: 'Restaurant UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'Restaurant ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Restaurant ID is required' })
  restaurant_id: string;
}

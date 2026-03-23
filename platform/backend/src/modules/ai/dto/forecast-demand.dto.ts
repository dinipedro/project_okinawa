import { IsUUID, IsOptional, IsInt, Min, Max, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ForecastDemandDto {
  @ApiProperty({
    description: 'Restaurant UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'Restaurant ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Restaurant ID is required' })
  restaurant_id: string;

  @ApiPropertyOptional({
    description: 'Number of days to forecast',
    default: 7,
    minimum: 1,
    maximum: 30,
    example: 14,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Days must be an integer' })
  @Min(1, { message: 'Days must be at least 1' })
  @Max(30, { message: 'Days cannot exceed 30' })
  days?: number;
}

class ConfidenceIntervalDto {
  @ApiProperty({ description: 'Lower bound of prediction', example: 45 })
  lower: number;

  @ApiProperty({ description: 'Upper bound of prediction', example: 65 })
  upper: number;
}

export class DemandForecastResultDto {
  @ApiProperty({ description: 'Forecast date (YYYY-MM-DD)', example: '2025-01-15' })
  date: string;

  @ApiProperty({ description: 'Predicted number of orders', example: 55 })
  predicted_orders: number;

  @ApiProperty({ description: 'Confidence interval for the prediction', type: ConfidenceIntervalDto })
  @Type(() => ConfidenceIntervalDto)
  confidence_interval: ConfidenceIntervalDto;

  @ApiProperty({
    description: 'Predicted peak hours (HH:MM format)',
    type: [String],
    example: ['12:00', '13:00', '19:00', '20:00']
  })
  peak_hours: string[];
}

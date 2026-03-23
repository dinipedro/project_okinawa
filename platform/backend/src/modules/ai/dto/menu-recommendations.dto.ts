import { IsUUID, IsOptional, IsInt, Min, Max, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class MenuRecommendationsDto {
  @ApiProperty({
    description: 'Restaurant UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'Restaurant ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Restaurant ID is required' })
  restaurant_id: string;

  @ApiPropertyOptional({
    description: 'User UUID for personalized recommendations',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'User ID must be a valid UUID' })
  @IsOptional()
  user_id?: string;

  @ApiPropertyOptional({
    description: 'Maximum number of recommendations to return',
    default: 10,
    minimum: 1,
    maximum: 50,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(50, { message: 'Limit cannot exceed 50' })
  limit?: number;
}

export class MenuRecommendationResultDto {
  @ApiProperty({
    description: 'Menu item UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  item_id: string;

  @ApiProperty({
    description: 'Menu item name',
    example: 'Margherita Pizza',
  })
  item_name: string;

  @ApiProperty({
    description: 'Confidence score (0-1)',
    example: 0.85,
    minimum: 0,
    maximum: 1,
  })
  confidence: number;

  @ApiProperty({
    description: 'Reason for recommendation',
    example: 'Popular among users with similar taste preferences',
  })
  reason: string;
}

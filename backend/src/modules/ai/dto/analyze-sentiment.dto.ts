import { IsUUID, IsNotEmpty, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AnalyzeSentimentDto {
  @ApiProperty({
    description: 'Review UUID to analyze',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'Review ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Review ID is required' })
  review_id: string;
}

export class BatchAnalyzeSentimentsDto {
  @ApiProperty({
    description: 'Restaurant UUID to analyze all reviews',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'Restaurant ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Restaurant ID is required' })
  restaurant_id: string;

  @ApiPropertyOptional({
    description: 'Maximum number of reviews to analyze',
    example: 100,
    minimum: 1,
    maximum: 1000,
    default: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(1000, { message: 'Limit cannot exceed 1000' })
  limit?: number;
}

export class SentimentResultDto {
  @ApiProperty({
    description: 'Sentiment score from -1 (very negative) to 1 (very positive)',
    minimum: -1,
    maximum: 1,
    example: 0.75,
  })
  score: number;

  @ApiProperty({
    description: 'Magnitude of the sentiment (emotional strength)',
    minimum: 0,
    example: 0.9,
  })
  magnitude: number;

  @ApiProperty({
    description: 'Overall sentiment classification',
    enum: ['positive', 'negative', 'neutral'],
    example: 'positive',
  })
  sentiment: 'positive' | 'negative' | 'neutral';

  @ApiProperty({
    description: 'Key words/phrases extracted from the review',
    type: [String],
    example: ['excellent', 'delicious', 'recommended'],
  })
  keywords: string[];
}

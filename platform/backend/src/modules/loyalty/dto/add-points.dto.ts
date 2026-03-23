import { IsNotEmpty, IsInt, IsString, Min, Max, MaxLength, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class AddPointsDto {
  @ApiProperty({
    description: 'Number of loyalty points to add',
    example: 100,
    minimum: 1,
    maximum: 100000,
  })
  @IsNotEmpty({ message: 'Points amount is required' })
  @Type(() => Number)
  @IsInt({ message: 'Points must be an integer' })
  @Min(1, { message: 'Points must be at least 1' })
  @Max(100000, { message: 'Points cannot exceed 100,000' })
  points: number;

  @ApiProperty({
    description: 'Reason for adding points',
    example: 'Purchase at restaurant',
    maxLength: 200,
  })
  @IsNotEmpty({ message: 'Reason is required' })
  @IsString({ message: 'Reason must be a string' })
  @MaxLength(200, { message: 'Reason cannot exceed 200 characters' })
  @Transform(({ value }) => value?.trim())
  reason: string;

  @ApiPropertyOptional({
    description: 'Order ID associated with the points',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Order ID must be a valid UUID' })
  order_id?: string;
}

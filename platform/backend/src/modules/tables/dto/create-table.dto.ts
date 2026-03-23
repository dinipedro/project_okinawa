import { IsNotEmpty, IsString, IsInt, IsOptional, IsBoolean, Min, Max, IsUUID, MaxLength, IsIn, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class CreateTableDto {
  @ApiProperty({
    description: 'Restaurant UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({ message: 'Restaurant ID is required' })
  @IsUUID('4', { message: 'Restaurant ID must be a valid UUID' })
  restaurant_id: string;

  @ApiProperty({
    description: 'Unique table number/identifier within the restaurant',
    example: 'T-01',
    maxLength: 20,
  })
  @IsNotEmpty({ message: 'Table number is required' })
  @IsString({ message: 'Table number must be a string' })
  @MaxLength(20, { message: 'Table number cannot exceed 20 characters' })
  @Transform(({ value }) => value?.trim())
  table_number: string;

  @ApiProperty({
    description: 'Maximum seating capacity',
    example: 4,
    minimum: 1,
    maximum: 50,
  })
  @IsNotEmpty({ message: 'Capacity is required' })
  @Type(() => Number)
  @IsInt({ message: 'Capacity must be an integer' })
  @Min(1, { message: 'Capacity must be at least 1' })
  @Max(50, { message: 'Capacity cannot exceed 50' })
  capacity: number;

  @ApiPropertyOptional({
    description: 'X coordinate for floor plan positioning',
    example: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Position X must be an integer' })
  position_x?: number;

  @ApiPropertyOptional({
    description: 'Y coordinate for floor plan positioning',
    example: 200,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Position Y must be an integer' })
  position_y?: number;

  @ApiPropertyOptional({
    description: 'Table shape for visual representation',
    example: 'rectangle',
    enum: ['rectangle', 'circle', 'square', 'oval'],
  })
  @IsOptional()
  @IsString({ message: 'Shape must be a string' })
  @IsIn(['rectangle', 'circle', 'square', 'oval'], { message: 'Shape must be one of: rectangle, circle, square, oval' })
  shape?: string;

  @ApiPropertyOptional({
    description: 'Restaurant section/area where table is located',
    example: 'patio',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Section must be a string' })
  @MaxLength(50, { message: 'Section cannot exceed 50 characters' })
  @Transform(({ value }) => value?.trim())
  section?: string;

  @ApiPropertyOptional({
    description: 'Whether the table is active and available for reservations',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'is_active must be a boolean' })
  is_active?: boolean;

  @ApiPropertyOptional({
    description: 'Additional metadata for the table',
    example: { floor: 1, near_window: true },
  })
  @IsOptional()
  @IsObject({ message: 'Metadata must be an object' })
  metadata?: Record<string, any>;
}

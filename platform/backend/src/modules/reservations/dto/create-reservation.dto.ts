import { IsNotEmpty, IsString, IsNumber, IsOptional, IsArray, IsDateString, IsUUID, Min, Max, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

/**
 * DTO for creating a restaurant reservation
 * @description Contains all required and optional fields for booking a table
 * @example
 * {
 *   "restaurant_id": "123e4567-e89b-12d3-a456-426614174000",
 *   "reservation_date": "2024-12-25",
 *   "reservation_time": "19:30",
 *   "party_size": 4,
 *   "occasion": "Birthday",
 *   "special_requests": "Window seat preferred"
 * }
 */
export class CreateReservationDto {
  @ApiProperty({ description: 'Restaurant UUID' })
  @IsNotEmpty()
  @IsUUID('4', { message: 'Invalid restaurant ID format' })
  restaurant_id: string;

  @ApiProperty({ description: 'Reservation date (YYYY-MM-DD)' })
  @IsNotEmpty()
  @IsDateString({}, { message: 'Invalid date format. Use YYYY-MM-DD' })
  reservation_date: string;

  @ApiProperty({ description: 'Reservation time (HH:mm)' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Invalid time format. Use HH:mm (24-hour format)',
  })
  reservation_time: string;

  @ApiProperty({ description: 'Number of guests', minimum: 1, maximum: 50 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber({}, { message: 'Party size must be a number' })
  @Min(1, { message: 'Party size must be at least 1' })
  @Max(50, { message: 'Party size cannot exceed 50' })
  party_size: number;

  @ApiProperty({ required: false, maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Seating preference cannot exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  seating_preference?: string;

  @ApiProperty({ required: false, maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Occasion cannot exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  occasion?: string;

  @ApiProperty({ required: false, maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Special requests cannot exceed 500 characters' })
  @Transform(({ value }) => value?.trim())
  special_requests?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dietary_restrictions?: string[];

  @ApiProperty({ required: false, description: 'Contact phone in international format' })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Invalid phone number format',
  })
  contact_phone?: string;
}

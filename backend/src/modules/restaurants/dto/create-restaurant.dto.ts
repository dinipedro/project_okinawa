import { IsNotEmpty, IsString, IsOptional, IsArray, IsNumber, IsEmail, MaxLength, MinLength, Min, Max, Matches, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { ServiceType } from '@common/enums';

/**
 * DTO for creating a new restaurant
 * @description Contains all required and optional fields for restaurant registration
 * @example
 * {
 *   "name": "Sushi Okinawa",
 *   "description": "Authentic Japanese cuisine",
 *   "cuisine_type": "Japanese",
 *   "address": "123 Main Street",
 *   "city": "São Paulo",
 *   "state": "SP",
 *   "zip_code": "01310-100",
 *   "phone": "+5511999999999",
 *   "email": "contact@sushiokinawa.com"
 * }
 */
export class CreateRestaurantDto {
  @ApiProperty({ minLength: 2, maxLength: 100 })
  @IsNotEmpty()
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name cannot exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({ required: false, maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Description cannot exceed 1000 characters' })
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiProperty({ required: false, maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Cuisine type cannot exceed 50 characters' })
  @Transform(({ value }) => value?.trim())
  cuisine_type?: string;

  @ApiProperty({ maxLength: 200 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200, { message: 'Address cannot exceed 200 characters' })
  @Transform(({ value }) => value?.trim())
  address: string;

  @ApiProperty({ maxLength: 100 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100, { message: 'City cannot exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  city: string;

  @ApiProperty({ maxLength: 50 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50, { message: 'State cannot exceed 50 characters' })
  @Transform(({ value }) => value?.trim())
  state: string;

  @ApiProperty({ maxLength: 20 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20, { message: 'ZIP code cannot exceed 20 characters' })
  @Matches(/^[\d\-]+$/, { message: 'ZIP code should only contain digits and dashes' })
  zip_code: string;

  @ApiProperty({ required: false, minimum: -90, maximum: 90, description: 'Latitude coordinate' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Latitude must be a number' })
  @Min(-90, { message: 'Latitude must be between -90 and 90' })
  @Max(90, { message: 'Latitude must be between -90 and 90' })
  latitude?: number;

  @ApiProperty({ required: false, minimum: -180, maximum: 180, description: 'Longitude coordinate' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Longitude must be a number' })
  @Min(-180, { message: 'Longitude must be between -180 and 180' })
  @Max(180, { message: 'Longitude must be between -180 and 180' })
  longitude?: number;

  @ApiProperty({ required: false, description: 'Phone number in international format' })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Invalid phone number format' })
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email?: string;

  @ApiProperty({ required: false, type: [String], enum: ServiceType })
  @IsOptional()
  @IsArray()
  service_types?: ServiceType[];
}

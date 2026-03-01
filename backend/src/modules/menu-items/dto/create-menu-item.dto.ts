import { IsNotEmpty, IsString, IsNumber, IsOptional, IsBoolean, IsArray, IsUUID, Min, Max, MaxLength, IsUrl, ArrayMaxSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class CreateMenuItemDto {
  @ApiProperty({ description: 'Restaurant UUID' })
  @IsNotEmpty()
  @IsUUID('4', { message: 'Invalid restaurant ID format' })
  restaurant_id: string;

  @ApiProperty({ required: false, description: 'Category UUID' })
  @IsOptional()
  @IsUUID('4', { message: 'Invalid category ID format' })
  category_id?: string;

  @ApiProperty({ maxLength: 100 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100, { message: 'Name cannot exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({ required: false, maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Description cannot exceed 500 characters' })
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiProperty({ minimum: 0, maximum: 100000 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Price must be a valid number with up to 2 decimal places' })
  @Min(0, { message: 'Price cannot be negative' })
  @Max(100000, { message: 'Price cannot exceed 100,000' })
  price: number;

  @ApiProperty({ required: false, description: 'Valid URL for menu item image' })
  @IsOptional()
  @IsUrl({}, { message: 'Image URL must be a valid URL' })
  image_url?: string;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  is_available?: boolean;

  @ApiProperty({ required: false, type: [String], maxItems: 20 })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20, { message: 'Cannot have more than 20 allergens' })
  @IsString({ each: true })
  allergens?: string[];

  @ApiProperty({ required: false, type: [String], maxItems: 10 })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10, { message: 'Cannot have more than 10 dietary tags' })
  @IsString({ each: true })
  dietary_tags?: string[];

  @ApiProperty({ required: false, minimum: 1, maximum: 240 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Preparation time must be a number' })
  @Min(1, { message: 'Preparation time must be at least 1 minute' })
  @Max(240, { message: 'Preparation time cannot exceed 240 minutes' })
  preparation_time_minutes?: number;
}

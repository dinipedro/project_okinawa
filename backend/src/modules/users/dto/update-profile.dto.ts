import { IsOptional, IsString, IsArray, MinLength, MaxLength, Matches, IsUrl, ArrayMaxSize } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: 'Full name of the user',
    example: 'John Doe',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Full name must be a string' })
  @MinLength(2, { message: 'Full name must be at least 2 characters' })
  @MaxLength(100, { message: 'Full name cannot exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  full_name?: string;

  @ApiPropertyOptional({
    description: 'URL to user avatar image',
    example: 'https://example.com/avatars/user123.jpg',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Avatar URL must be a valid URL' })
  avatar_url?: string;

  @ApiPropertyOptional({
    description: 'Phone number in international format',
    example: '+5511999999999',
  })
  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Phone must be a valid international phone number' })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Default delivery address',
    example: 'Av. Paulista, 1000 - São Paulo, SP',
    maxLength: 300,
  })
  @IsOptional()
  @IsString({ message: 'Default address must be a string' })
  @MaxLength(300, { message: 'Default address cannot exceed 300 characters' })
  @Transform(({ value }) => value?.trim())
  default_address?: string;

  @ApiPropertyOptional({
    description: 'List of dietary restrictions',
    example: ['vegetarian', 'gluten-free'],
    type: [String],
    maxItems: 20,
  })
  @IsOptional()
  @IsArray({ message: 'Dietary restrictions must be an array' })
  @ArrayMaxSize(20, { message: 'Cannot have more than 20 dietary restrictions' })
  @IsString({ each: true, message: 'Each dietary restriction must be a string' })
  dietary_restrictions?: string[];

  @ApiPropertyOptional({
    description: 'List of favorite cuisines',
    example: ['italian', 'japanese', 'brazilian'],
    type: [String],
    maxItems: 20,
  })
  @IsOptional()
  @IsArray({ message: 'Favorite cuisines must be an array' })
  @ArrayMaxSize(20, { message: 'Cannot have more than 20 favorite cuisines' })
  @IsString({ each: true, message: 'Each cuisine must be a string' })
  favorite_cuisines?: string[];
}

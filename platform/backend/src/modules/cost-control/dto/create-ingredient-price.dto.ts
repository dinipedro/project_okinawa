import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateIngredientPriceDto {
  @ApiProperty({ description: 'Price per unit (up to 4 decimal places)' })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 4 }, { message: 'Price must be a valid number' })
  @Min(0, { message: 'Price cannot be negative' })
  price_per_unit: number;

  @ApiProperty({ required: false, maxLength: 200, description: 'Supplier name' })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Supplier name cannot exceed 200 characters' })
  supplier?: string;

  @ApiProperty({ description: 'Effective date (YYYY-MM-DD)' })
  @IsNotEmpty()
  @IsDateString({}, { message: 'Effective date must be a valid date string (YYYY-MM-DD)' })
  effective_date: string;
}

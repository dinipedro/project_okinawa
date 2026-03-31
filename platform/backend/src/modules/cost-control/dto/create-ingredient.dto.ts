import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUUID,
  IsIn,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateIngredientDto {
  @ApiProperty({ description: 'Restaurant UUID' })
  @IsNotEmpty()
  @IsUUID('4', { message: 'Invalid restaurant ID format' })
  restaurant_id: string;

  @ApiProperty({ maxLength: 200, description: 'Ingredient name' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200, { message: 'Name cannot exceed 200 characters' })
  name: string;

  @ApiProperty({ enum: ['kg', 'l', 'un', 'g', 'ml'], description: 'Unit of measurement' })
  @IsNotEmpty()
  @IsIn(['kg', 'l', 'un', 'g', 'ml'], { message: 'Unit must be one of: kg, l, un, g, ml' })
  unit: string;

  @ApiProperty({ required: false, maxLength: 50, description: 'Category (e.g., protein, vegetable)' })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Category cannot exceed 50 characters' })
  category?: string;
}

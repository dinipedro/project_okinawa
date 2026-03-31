import {
  IsString,
  IsOptional,
  IsIn,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateIngredientDto {
  @ApiProperty({ required: false, maxLength: 200, description: 'Ingredient name' })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Name cannot exceed 200 characters' })
  name?: string;

  @ApiProperty({ required: false, enum: ['kg', 'l', 'un', 'g', 'ml'], description: 'Unit of measurement' })
  @IsOptional()
  @IsIn(['kg', 'l', 'un', 'g', 'ml'], { message: 'Unit must be one of: kg, l, un, g, ml' })
  unit?: string;

  @ApiProperty({ required: false, maxLength: 50, description: 'Category' })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Category cannot exceed 50 characters' })
  category?: string;

  @ApiProperty({ required: false, description: 'Active status' })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

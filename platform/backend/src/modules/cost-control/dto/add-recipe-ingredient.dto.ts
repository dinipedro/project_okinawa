import {
  IsNotEmpty,
  IsNumber,
  IsUUID,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AddRecipeIngredientDto {
  @ApiProperty({ description: 'Ingredient UUID' })
  @IsNotEmpty()
  @IsUUID('4', { message: 'Invalid ingredient ID format' })
  ingredient_id: string;

  @ApiProperty({ description: 'Quantity of ingredient used in recipe' })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 4 }, { message: 'Quantity must be a valid number' })
  @Min(0.0001, { message: 'Quantity must be greater than 0' })
  quantity: number;
}

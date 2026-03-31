import { IsNotEmpty, IsUUID, IsNumber, IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdjustStockDto {
  @ApiProperty({ description: 'Ingredient UUID' })
  @IsNotEmpty()
  @IsUUID('4')
  ingredient_id: string;

  @ApiProperty({ description: 'Restaurant UUID' })
  @IsNotEmpty()
  @IsUUID('4')
  restaurant_id: string;

  @ApiProperty({ description: 'Quantity delta (positive to add, negative to subtract)' })
  @IsNotEmpty()
  @IsNumber()
  quantity_delta: number;

  @ApiProperty({ required: false, description: 'Reason for adjustment' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

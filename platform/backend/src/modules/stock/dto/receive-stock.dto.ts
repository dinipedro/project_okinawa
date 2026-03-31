import { IsNotEmpty, IsUUID, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReceiveStockDto {
  @ApiProperty({ description: 'Ingredient UUID' })
  @IsNotEmpty()
  @IsUUID('4')
  ingredient_id: string;

  @ApiProperty({ description: 'Restaurant UUID' })
  @IsNotEmpty()
  @IsUUID('4')
  restaurant_id: string;

  @ApiProperty({ description: 'Quantity received' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.0001)
  quantity: number;

  @ApiProperty({ required: false, description: 'Purchase price per unit' })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty({ required: false, description: 'Supplier name' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  supplier?: string;
}

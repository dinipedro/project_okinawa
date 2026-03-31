import {
  IsNotEmpty,
  IsUUID,
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  MaxLength,
  IsDateString,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class PurchaseItemDto {
  @ApiProperty({ description: 'Item name' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({ description: 'Quantity purchased' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.0001)
  quantity: number;

  @ApiProperty({ description: 'Unit of measurement' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  unit: string;

  @ApiProperty({ description: 'Unit price' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  unit_price: number;

  @ApiProperty({ required: false, description: 'Matched ingredient UUID' })
  @IsOptional()
  @IsUUID('4')
  matched_ingredient_id?: string;
}

export class ImportManualDto {
  @ApiProperty({ description: 'Restaurant UUID' })
  @IsNotEmpty()
  @IsUUID('4')
  restaurant_id: string;

  @ApiProperty({ description: 'Supplier name' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  supplier_name: string;

  @ApiProperty({ required: false, description: 'Invoice number' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  invoice_number?: string;

  @ApiProperty({ description: 'Invoice date (ISO)' })
  @IsNotEmpty()
  @IsDateString()
  invoice_date: string;

  @ApiProperty({ type: [PurchaseItemDto], description: 'Purchased items' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseItemDto)
  items: PurchaseItemDto[];
}

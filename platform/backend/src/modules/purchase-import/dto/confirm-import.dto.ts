import {
  IsArray,
  ValidateNested,
  IsUUID,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class MatchedItemDto {
  @ApiProperty({ description: 'Item name from the import' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({ description: 'Matched ingredient UUID' })
  @IsNotEmpty()
  @IsUUID('4')
  ingredient_id: string;

  @ApiProperty({ description: 'Quantity' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.0001)
  quantity: number;

  @ApiProperty({ description: 'Unit price' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  unit_price: number;

  @ApiProperty({ required: false, description: 'Unit of measurement' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  unit?: string;
}

export class ConfirmImportDto {
  @ApiProperty({ type: [MatchedItemDto], description: 'Confirmed matched items' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MatchedItemDto)
  matched_items: MatchedItemDto[];
}

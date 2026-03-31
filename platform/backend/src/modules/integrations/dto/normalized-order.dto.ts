import { IsString, IsNumber, IsOptional, IsArray, ValidateNested, IsEnum, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NormalizedOrderItemCustomizationDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  value: string;

  @ApiProperty()
  @IsNumber()
  price_modifier: number;
}

export class NormalizedOrderItemDto {
  @ApiProperty()
  @IsString()
  external_item_id: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  internal_menu_item_id?: string;

  @ApiProperty()
  @IsString()
  source_item_name: string;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @IsNumber()
  unit_price: number;

  @ApiProperty({ type: [NormalizedOrderItemCustomizationDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NormalizedOrderItemCustomizationDto)
  customizations: NormalizedOrderItemCustomizationDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  special_instructions?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  course?: string;
}

export class NormalizedOrderDto {
  @ApiProperty({ enum: ['ifood', 'rappi', 'ubereats'] })
  @IsEnum(['ifood', 'rappi', 'ubereats'] as const)
  source: 'ifood' | 'rappi' | 'ubereats';

  @ApiProperty()
  @IsString()
  source_order_id: string;

  @ApiProperty()
  @IsString()
  restaurant_id: string;

  @ApiProperty({ enum: ['delivery', 'pickup'] })
  @IsEnum(['delivery', 'pickup'] as const)
  order_type: 'delivery' | 'pickup';

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  delivery_rider_eta?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customer_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customer_phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  delivery_address?: string;

  @ApiProperty({ type: [NormalizedOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NormalizedOrderItemDto)
  items: NormalizedOrderItemDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  payment_method?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  total_amount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: Record<string, any>;
}

import { IsOptional, IsString, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { OrderStatus } from '@/common/enums/order-status.enum';

class UpdateOrderItemDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  menu_item_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  quantity?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  special_instructions?: string;
}

export class UpdateOrderDto {
  @ApiProperty({ required: false, enum: OrderStatus })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  special_instructions?: string;

  @ApiProperty({ required: false, type: [UpdateOrderItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateOrderItemDto)
  items?: UpdateOrderItemDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  table_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

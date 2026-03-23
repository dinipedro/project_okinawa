import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsEnum, IsOptional, IsArray } from 'class-validator';
import { PaymentSplitMode } from '../entities/payment-split.entity';

export class CalculateSplitDto {
  @ApiProperty({ description: 'Order ID' })
  @IsNotEmpty()
  @IsUUID()
  order_id: string;

  @ApiProperty({
    description: 'Split mode',
    enum: PaymentSplitMode,
  })
  @IsNotEmpty()
  @IsEnum(PaymentSplitMode)
  split_mode: PaymentSplitMode;

  @ApiPropertyOptional({ description: 'Selected item IDs (for selective mode)' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  selected_items?: string[];
}

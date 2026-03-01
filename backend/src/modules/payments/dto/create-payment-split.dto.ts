import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsUUID,
  IsEnum,
  IsNumber,
  IsOptional,
  IsArray,
  Min,
} from 'class-validator';
import { PaymentSplitMode } from '../entities/payment-split.entity';

export class CreatePaymentSplitDto {
  @ApiProperty({ description: 'Order ID' })
  @IsNotEmpty()
  @IsUUID()
  order_id: string;

  @ApiProperty({ description: 'Guest user ID' })
  @IsNotEmpty()
  @IsUUID()
  guest_user_id: string;

  @ApiProperty({
    description: 'Split mode',
    enum: PaymentSplitMode,
  })
  @IsNotEmpty()
  @IsEnum(PaymentSplitMode)
  split_mode: PaymentSplitMode;

  @ApiProperty({ description: 'Amount due for this guest' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount_due: number;

  @ApiPropertyOptional({ description: 'Selected item IDs (for selective mode)' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  selected_items?: string[];

  @ApiPropertyOptional({ description: 'Custom amount (for selective mode with fixed value)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  custom_amount?: number;

  @ApiPropertyOptional({ description: 'Service charge for this guest' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  service_charge?: number;

  @ApiPropertyOptional({ description: 'Tip amount for this guest' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tip_amount?: number;

  @ApiPropertyOptional({ description: 'Optional notes' })
  @IsOptional()
  notes?: string;
}

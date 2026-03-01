import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethodType } from '@/common/enums';

/**
 * Secure payment details - uses tokens instead of raw card data
 */
class SecurePaymentDetails {
  @ApiPropertyOptional({ description: 'Payment token from payment gateway (Stripe, PagSeguro, etc)' })
  @IsOptional()
  @IsString()
  payment_token?: string;

  @ApiPropertyOptional({ description: 'Saved payment method ID' })
  @IsOptional()
  @IsUUID()
  saved_payment_method_id?: string;

  @ApiPropertyOptional({ description: 'Last 4 digits of card (for display only)' })
  @IsOptional()
  @IsString()
  last_four?: string;

  @ApiPropertyOptional({ description: 'Card brand (visa, mastercard, etc)' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ description: 'PIX key for PIX payments' })
  @IsOptional()
  @IsString()
  pix_key?: string;
}

export class ProcessSplitPaymentDto {
  @ApiProperty({ description: 'Payment split ID' })
  @IsNotEmpty()
  @IsUUID()
  split_id: string;

  @ApiProperty({ description: 'Amount to pay' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({
    description: 'Payment method',
    enum: PaymentMethodType,
  })
  @IsNotEmpty()
  payment_method: PaymentMethodType;

  @ApiPropertyOptional({
    description: 'Secure payment details (tokens only, no raw card data)',
    type: SecurePaymentDetails,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SecurePaymentDetails)
  payment_details?: SecurePaymentDetails;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

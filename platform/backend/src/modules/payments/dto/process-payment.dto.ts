import { IsString, IsNumber, IsEnum, IsOptional, IsUUID, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  PIX = 'pix',
  WALLET = 'wallet',
  CASH = 'cash',
}

/**
 * Tokenized card reference - never contains raw card data
 * Card data should be tokenized via a secure payment gateway (Stripe, PagSeguro, etc)
 */
class TokenizedCardReference {
  @ApiProperty({ description: 'Payment token from payment gateway (e.g., Stripe token)' })
  @IsString()
  payment_token: string;

  @ApiPropertyOptional({ description: 'Last 4 digits of card (for display only)' })
  @IsOptional()
  @IsString()
  last_four?: string;

  @ApiPropertyOptional({ description: 'Card brand (visa, mastercard, etc)' })
  @IsOptional()
  @IsString()
  brand?: string;
}

/**
 * Saved payment method reference
 */
class SavedPaymentMethodReference {
  @ApiProperty({ description: 'Saved payment method ID' })
  @IsUUID()
  payment_method_id: string;
}

export class ProcessPaymentDto {
  @ApiProperty({ description: 'Order ID to process payment for' })
  @IsUUID()
  order_id: string;

  @ApiProperty({ enum: PaymentMethod, description: 'Payment method type' })
  @IsEnum(PaymentMethod)
  payment_method: PaymentMethod;

  @ApiProperty({ description: 'Amount to charge (min 0.01, max 1,000,000)' })
  @IsNumber()
  @Min(0.01, { message: 'Amount must be at least 0.01' })
  @Max(1000000, { message: 'Amount cannot exceed 1,000,000' })
  amount: number;

  @ApiPropertyOptional({ description: 'Tokenized card reference (from payment gateway)' })
  @IsOptional()
  @ValidateNested()
  @Type(() => TokenizedCardReference)
  tokenized_card?: TokenizedCardReference;

  @ApiPropertyOptional({ description: 'Reference to saved payment method' })
  @IsOptional()
  @ValidateNested()
  @Type(() => SavedPaymentMethodReference)
  saved_payment_method?: SavedPaymentMethodReference;

  @ApiPropertyOptional({ description: 'PIX key for PIX payments' })
  @IsOptional()
  @IsString()
  pix_key?: string;
}

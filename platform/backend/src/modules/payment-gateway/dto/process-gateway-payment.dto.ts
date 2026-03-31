import { IsString, IsInt, IsOptional, IsEnum, Min, Max, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethodType } from '../interfaces/gateway-adapter.interface';

/**
 * DTO for processing a payment through the gateway.
 * Amount is in centavos (integer). R$ 98,90 = 9890.
 */
export class ProcessGatewayPaymentDto {
  @ApiProperty({ description: 'Order ID', example: 'uuid' })
  @IsUUID()
  order_id: string;

  @ApiProperty({ description: 'Restaurant ID', example: 'uuid' })
  @IsUUID()
  restaurant_id: string;

  @ApiProperty({
    description: 'Amount in centavos (R$ 98,90 = 9890)',
    example: 9890,
  })
  @IsInt()
  @Min(1)
  amount_cents: number;

  @ApiProperty({
    description: 'Payment method',
    enum: ['credit_card', 'debit_card', 'pix', 'wallet', 'cash', 'tap_to_pay'],
    example: 'credit_card',
  })
  @IsEnum(['credit_card', 'debit_card', 'pix', 'wallet', 'cash', 'tap_to_pay'] as const)
  payment_method: PaymentMethodType;

  @ApiPropertyOptional({ description: 'Idempotency key to prevent duplicate charges' })
  @IsOptional()
  @IsString()
  idempotency_key?: string;

  @ApiPropertyOptional({ description: 'Card token from Asaas.js SDK' })
  @IsOptional()
  @IsString()
  card_token?: string;

  @ApiPropertyOptional({ description: 'Number of installments (1-12, credit card only)', minimum: 1, maximum: 12 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  installments?: number;

  @ApiPropertyOptional({ description: 'PIX QR code expiration in seconds (default 600)', default: 600 })
  @IsOptional()
  @IsInt()
  @Min(60)
  @Max(3600)
  pix_expiration_seconds?: number;

  @ApiPropertyOptional({ description: 'Stripe PaymentIntent ID (for tap_to_pay)' })
  @IsOptional()
  @IsString()
  stripe_payment_intent_id?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  metadata?: Record<string, any>;
}

/**
 * DTO for creating a Stripe Terminal Tap-to-Pay PaymentIntent.
 */
export class CreateTapToPayIntentDto {
  @ApiProperty({ description: 'Order ID', example: 'uuid' })
  @IsUUID()
  order_id: string;

  @ApiProperty({ description: 'Restaurant ID', example: 'uuid' })
  @IsUUID()
  restaurant_id: string;

  @ApiProperty({ description: 'Amount in centavos', example: 35857 })
  @IsInt()
  @Min(1)
  amount_cents: number;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  metadata?: Record<string, any>;
}

/**
 * DTO for requesting a Stripe Terminal connection token.
 */
export class ConnectionTokenDto {
  @ApiProperty({ description: 'Restaurant ID', example: 'uuid' })
  @IsUUID()
  restaurant_id: string;
}

/**
 * DTO for refund request.
 */
export class RefundPaymentDto {
  @ApiPropertyOptional({
    description: 'Partial refund amount in centavos. If omitted, full refund is performed.',
    example: 5000,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  amount_cents?: number;

  @ApiPropertyOptional({ description: 'Reason for refund' })
  @IsOptional()
  @IsString()
  reason?: string;
}

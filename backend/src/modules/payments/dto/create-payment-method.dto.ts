import { IsNotEmpty, IsEnum, IsString, IsOptional, Matches, MaxLength, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { PaymentMethodType } from '@common/enums';

export class CreatePaymentMethodDto {
  @ApiProperty({
    description: 'Type of payment method',
    enum: PaymentMethodType,
    example: 'credit_card',
  })
  @IsNotEmpty({ message: 'Payment method type is required' })
  @IsEnum(PaymentMethodType, { message: 'Invalid payment method type' })
  method_type: PaymentMethodType;

  @ApiPropertyOptional({
    description: 'Last 4 digits of the card (for display only)',
    example: '4242',
    pattern: '^[0-9]{4}$',
  })
  @IsOptional()
  @IsString({ message: 'Card last four must be a string' })
  @Matches(/^[0-9]{4}$/, { message: 'Card last four must be exactly 4 digits' })
  card_last_four?: string;

  @ApiPropertyOptional({
    description: 'Card brand (visa, mastercard, amex, etc.)',
    example: 'visa',
    maxLength: 20,
  })
  @IsOptional()
  @IsString({ message: 'Card brand must be a string' })
  @MaxLength(20, { message: 'Card brand cannot exceed 20 characters' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  card_brand?: string;

  @ApiPropertyOptional({
    description: 'External payment method ID from payment provider',
    example: 'pm_1234567890',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'External payment method ID must be a string' })
  @MaxLength(100, { message: 'External payment method ID cannot exceed 100 characters' })
  external_payment_method_id?: string;

  @ApiPropertyOptional({
    description: 'Set as default payment method',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'is_default must be a boolean' })
  is_default?: boolean;
}

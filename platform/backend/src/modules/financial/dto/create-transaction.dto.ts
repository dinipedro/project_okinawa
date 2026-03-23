import { IsNotEmpty, IsEnum, IsNumber, IsOptional, IsString, Min, Max, IsUUID, MaxLength, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { TransactionType, TransactionCategory, ReferenceType } from '../entities/financial-transaction.entity';

export class CreateTransactionDto {
  @ApiProperty({
    description: 'Restaurant UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({ message: 'Restaurant ID is required' })
  @IsUUID('4', { message: 'Restaurant ID must be a valid UUID' })
  restaurant_id: string;

  @ApiProperty({
    description: 'Transaction type (income or expense)',
    enum: TransactionType,
    example: 'income',
  })
  @IsNotEmpty({ message: 'Transaction type is required' })
  @IsEnum(TransactionType, { message: 'Invalid transaction type' })
  type: TransactionType;

  @ApiProperty({
    description: 'Transaction category',
    enum: TransactionCategory,
    example: 'order_payment',
  })
  @IsNotEmpty({ message: 'Transaction category is required' })
  @IsEnum(TransactionCategory, { message: 'Invalid transaction category' })
  category: TransactionCategory;

  @ApiProperty({
    description: 'Transaction amount',
    example: 150.00,
    minimum: 0.01,
    maximum: 10000000,
  })
  @IsNotEmpty({ message: 'Amount is required' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Amount must be a valid number with up to 2 decimal places' })
  @Min(0.01, { message: 'Amount must be at least 0.01' })
  @Max(10000000, { message: 'Amount cannot exceed 10,000,000' })
  amount: number;

  @ApiPropertyOptional({
    description: 'Transaction description',
    example: 'Payment for order #1234',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(500, { message: 'Description cannot exceed 500 characters' })
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiPropertyOptional({
    description: 'Reference entity UUID (order, payment, etc.)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Reference ID must be a valid UUID' })
  reference_id?: string;

  @ApiPropertyOptional({
    description: 'Type of referenced entity',
    enum: ReferenceType,
    example: 'order',
  })
  @IsOptional()
  @IsEnum(ReferenceType, { message: 'Invalid reference type' })
  reference_type?: ReferenceType;

  @ApiPropertyOptional({
    description: 'Additional transaction metadata',
    example: { payment_method: 'credit_card', invoice_number: 'INV-001' },
  })
  @IsOptional()
  @IsObject({ message: 'Metadata must be an object' })
  metadata?: Record<string, any>;
}

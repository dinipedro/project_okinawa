import { IsNotEmpty, IsNumber, IsString, IsOptional, Min, Max, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';

export class RechargeWalletDto {
  @ApiProperty({
    description: 'Amount to recharge in wallet',
    example: 100.00,
    minimum: 1,
    maximum: 50000,
  })
  @IsNotEmpty({ message: 'Amount is required' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Amount must be a valid number with up to 2 decimal places' })
  @Min(1, { message: 'Minimum recharge amount is 1' })
  @Max(50000, { message: 'Maximum recharge amount is 50,000' })
  amount: number;

  @ApiProperty({
    description: 'Payment method UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({ message: 'Payment method ID is required' })
  @IsUUID('4', { message: 'Payment method ID must be a valid UUID' })
  payment_method_id: string;

  @ApiPropertyOptional({
    description: 'Description for the recharge transaction',
    example: 'Monthly wallet recharge',
    maxLength: 200,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(200, { message: 'Description cannot exceed 200 characters' })
  @Transform(({ value }) => value?.trim())
  description?: string;
}

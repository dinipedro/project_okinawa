import { IsNotEmpty, IsNumber, IsString, IsOptional, Min, Max, MaxLength, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';

export class WithdrawWalletDto {
  @ApiProperty({
    description: 'Amount to withdraw from wallet',
    example: 50.00,
    minimum: 1,
    maximum: 50000,
  })
  @IsNotEmpty({ message: 'Amount is required' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Amount must be a valid number with up to 2 decimal places' })
  @Min(1, { message: 'Minimum withdrawal amount is 1' })
  @Max(50000, { message: 'Maximum withdrawal amount is 50,000' })
  amount: number;

  @ApiPropertyOptional({
    description: 'Description for the withdrawal',
    example: 'Withdrawal to bank account',
    maxLength: 200,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(200, { message: 'Description cannot exceed 200 characters' })
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiPropertyOptional({
    description: 'Bank account ID to transfer to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Bank account ID must be a valid UUID' })
  bank_account_id?: string;
}

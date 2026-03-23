import { IsNotEmpty, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType, TransactionCategory } from '../entities/financial-transaction.entity';

export class FinancialReportQueryDto {
  @ApiProperty({
    description: 'Report start date (ISO 8601 format)',
    format: 'date',
    example: '2025-01-01'
  })
  @IsNotEmpty()
  @IsDateString()
  start_date: string;

  @ApiProperty({
    description: 'Report end date (ISO 8601 format)',
    format: 'date',
    example: '2025-01-31'
  })
  @IsNotEmpty()
  @IsDateString()
  end_date: string;

  @ApiPropertyOptional({ description: 'Filter by transaction type', enum: TransactionType })
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @ApiPropertyOptional({ description: 'Filter by transaction category', enum: TransactionCategory })
  @IsOptional()
  @IsEnum(TransactionCategory)
  category?: TransactionCategory;
}

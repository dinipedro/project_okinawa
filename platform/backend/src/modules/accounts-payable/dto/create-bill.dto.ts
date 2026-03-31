import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsIn,
  MaxLength,
  IsDateString,
  Min,
} from 'class-validator';

export class CreateBillDto {
  @ApiProperty({ description: 'Restaurant ID' })
  @IsUUID()
  restaurant_id: string;

  @ApiProperty({ description: 'Bill description', maxLength: 200 })
  @IsString()
  @MaxLength(200)
  description: string;

  @ApiPropertyOptional({ description: 'Supplier name', maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  supplier?: string;

  @ApiProperty({
    description: 'Bill category',
    enum: ['rent', 'utilities', 'supplies', 'staff', 'marketing', 'maintenance', 'other'],
  })
  @IsString()
  @IsIn(['rent', 'utilities', 'supplies', 'staff', 'marketing', 'maintenance', 'other'])
  category: string;

  @ApiProperty({ description: 'Bill amount', minimum: 0.01 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;

  @ApiProperty({ description: 'Due date (YYYY-MM-DD)' })
  @IsDateString()
  due_date: string;

  @ApiPropertyOptional({ description: 'Whether the bill is recurring', default: false })
  @IsOptional()
  @IsBoolean()
  is_recurring?: boolean;

  @ApiPropertyOptional({
    description: 'Recurrence period',
    enum: ['monthly', 'weekly', 'yearly'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['monthly', 'weekly', 'yearly'])
  recurrence?: string;
}

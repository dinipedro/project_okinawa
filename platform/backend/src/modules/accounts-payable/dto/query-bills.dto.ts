import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsIn, IsUUID } from 'class-validator';

export class QueryBillsDto {
  @ApiPropertyOptional({ description: 'Restaurant ID' })
  @IsOptional()
  @IsUUID()
  restaurant_id?: string;

  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: ['pending', 'paid', 'overdue', 'cancelled'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['pending', 'paid', 'overdue', 'cancelled'])
  status?: string;

  @ApiPropertyOptional({
    description: 'Filter by category',
    enum: ['rent', 'utilities', 'supplies', 'staff', 'marketing', 'maintenance', 'other'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['rent', 'utilities', 'supplies', 'staff', 'marketing', 'maintenance', 'other'])
  category?: string;
}

import { IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetWaiterStatsDto {
  @ApiPropertyOptional({ description: 'Start date for stats (defaults to today)' })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiPropertyOptional({ description: 'End date for stats (defaults to today)' })
  @IsOptional()
  @IsDateString()
  end_date?: string;
}

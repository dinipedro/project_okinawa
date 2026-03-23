import { IsOptional, IsEnum, IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TipStatus } from '../entities/tip.entity';

export class UpdateTipDto {
  @ApiProperty({ required: false, enum: TipStatus })
  @IsOptional()
  @IsEnum(TipStatus)
  status?: TipStatus;

  @ApiProperty({ required: false, description: 'Distribution timestamp' })
  @IsOptional()
  @IsDateString()
  distributed_at?: string;

  @ApiProperty({ required: false, description: 'Distribution details (JSON)' })
  @IsOptional()
  @IsString()
  distribution_details?: string;

  @ApiProperty({ required: false, description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

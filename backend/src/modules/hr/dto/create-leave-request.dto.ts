import { IsNotEmpty, IsDateString, IsString, IsBoolean, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLeaveRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  restaurant_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  leave_type: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
  start_date: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
  end_date: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  reason: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  is_paid?: boolean;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];
}

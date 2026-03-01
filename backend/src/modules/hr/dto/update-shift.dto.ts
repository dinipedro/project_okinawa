import { IsOptional, IsString, IsEnum, Matches, IsBoolean, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StaffRole, ShiftStatus } from '../entities/shift.entity';

export class UpdateShiftDto {
  @ApiProperty({ required: false, description: 'Shift date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({ required: false, description: 'Start time (HH:MM or HH:MM:SS)', example: '09:00' })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, { message: 'Start time must be in HH:MM or HH:MM:SS format' })
  start_time?: string;

  @ApiProperty({ required: false, description: 'End time (HH:MM or HH:MM:SS)', example: '17:00' })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, { message: 'End time must be in HH:MM or HH:MM:SS format' })
  end_time?: string;

  @ApiProperty({ required: false, description: 'Role for this shift', enum: StaffRole })
  @IsOptional()
  @IsEnum(StaffRole)
  role?: StaffRole;

  @ApiProperty({ required: false, description: 'Shift status', enum: ShiftStatus })
  @IsOptional()
  @IsEnum(ShiftStatus)
  status?: ShiftStatus;

  @ApiProperty({ required: false, description: 'Whether this is overtime' })
  @IsOptional()
  @IsBoolean()
  is_overtime?: boolean;

  @ApiProperty({ required: false, description: 'Hourly rate', minimum: 0 })
  @IsOptional()
  @IsNumber()
  hourly_rate?: number;

  @ApiProperty({ required: false, description: 'Shift notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

import { IsNotEmpty, IsDateString, IsString, IsOptional, IsBoolean, IsNumber, IsUUID, IsEnum, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StaffRole, ShiftStatus } from '../entities/shift.entity';

export class CreateShiftDto {
  @ApiProperty({ description: 'Staff member UUID' })
  @IsNotEmpty()
  @IsUUID('4', { message: 'Invalid staff ID format' })
  staff_id: string;

  @ApiProperty({ description: 'Restaurant UUID' })
  @IsNotEmpty()
  @IsUUID('4', { message: 'Invalid restaurant ID format' })
  restaurant_id: string;

  @ApiProperty({ description: 'Shift date (YYYY-MM-DD)' })
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @ApiProperty({ description: 'Start time (HH:MM or HH:MM:SS)', example: '09:00' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, { message: 'Start time must be in HH:MM or HH:MM:SS format' })
  start_time: string;

  @ApiProperty({ description: 'End time (HH:MM or HH:MM:SS)', example: '17:00' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, { message: 'End time must be in HH:MM or HH:MM:SS format' })
  end_time: string;

  @ApiProperty({ required: false, enum: StaffRole, description: 'Role for this shift' })
  @IsOptional()
  @IsEnum(StaffRole)
  role?: StaffRole;

  @ApiProperty({ required: false, enum: ShiftStatus, description: 'Initial shift status' })
  @IsOptional()
  @IsEnum(ShiftStatus)
  status?: ShiftStatus;

  @ApiProperty({ required: false, description: 'Whether this is overtime' })
  @IsOptional()
  @IsBoolean()
  is_overtime?: boolean;

  @ApiProperty({ required: false, description: 'Hourly rate for this shift', minimum: 0 })
  @IsOptional()
  @IsNumber()
  hourly_rate?: number;

  @ApiProperty({ required: false, description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

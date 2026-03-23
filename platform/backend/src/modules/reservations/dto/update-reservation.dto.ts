import { IsOptional, IsString, IsEnum, IsInt, IsDateString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReservationStatus } from '@/common/enums/reservation-status.enum';

export class UpdateReservationDto {
  @ApiProperty({ required: false, enum: ReservationStatus })
  @IsOptional()
  @IsEnum(ReservationStatus)
  status?: ReservationStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  reservation_time?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  party_size?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  special_requests?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  table_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

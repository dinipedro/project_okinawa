import { IsNotEmpty, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReservationStatus } from '@common/enums';

export class UpdateReservationStatusDto {
  @ApiProperty({ enum: ReservationStatus })
  @IsNotEmpty()
  @IsEnum(ReservationStatus)
  status: ReservationStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  table_id?: string;
}

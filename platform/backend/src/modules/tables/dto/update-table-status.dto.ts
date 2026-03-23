import { IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TableStatus } from '../entities/restaurant-table.entity';

export class UpdateTableStatusDto {
  @ApiProperty({
    enum: TableStatus,
    description: 'New status for the table',
    example: TableStatus.AVAILABLE,
  })
  @IsNotEmpty()
  @IsEnum(TableStatus, { message: 'status must be a valid TableStatus value' })
  status: TableStatus;
}

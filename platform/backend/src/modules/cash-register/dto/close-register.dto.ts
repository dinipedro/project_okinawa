import { IsNotEmpty, IsUUID, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CloseRegisterDto {
  @ApiProperty({ description: 'Session ID to close' })
  @IsNotEmpty()
  @IsUUID()
  sessionId: string;

  @ApiProperty({ description: 'Actual cash balance (manual count at closing)', example: 1350.50 })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  actualBalance: number;

  @ApiProperty({ required: false, description: 'Closing notes or observations' })
  @IsOptional()
  @IsString()
  notes?: string;
}

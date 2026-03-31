import { IsNumber, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RedeemPointsDto {
  @ApiProperty({ description: 'Restaurant ID' })
  @IsUUID()
  restaurant_id: string;

  @ApiProperty({ description: 'Number of points to redeem', minimum: 1 })
  @IsNumber()
  @Min(1)
  points: number;
}

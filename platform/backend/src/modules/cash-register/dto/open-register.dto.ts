import { IsNotEmpty, IsUUID, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OpenRegisterDto {
  @ApiProperty({ description: 'Restaurant ID to open register for' })
  @IsNotEmpty()
  @IsUUID()
  restaurantId: string;

  @ApiProperty({ description: 'Opening balance (manual cash count)', example: 200.00 })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  openingBalance: number;
}

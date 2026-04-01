import { IsNotEmpty, IsUUID, IsNumber, IsString, MaxLength, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterInternalUseDto {
  @ApiProperty({ description: 'Ingredient UUID' })
  @IsNotEmpty()
  @IsUUID('4')
  ingredient_id: string;

  @ApiProperty({ description: 'Restaurant UUID' })
  @IsNotEmpty()
  @IsUUID('4')
  restaurant_id: string;

  @ApiProperty({ description: 'Quantity used internally (positive value)' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.0001)
  quantity: number;

  @ApiProperty({ description: 'Reason for internal use' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  reason: string;
}

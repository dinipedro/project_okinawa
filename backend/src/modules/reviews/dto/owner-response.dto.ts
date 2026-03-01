import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OwnerResponseDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  response: string;
}

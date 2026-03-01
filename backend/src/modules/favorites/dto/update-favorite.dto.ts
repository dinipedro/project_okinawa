import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFavoriteDto {
  @ApiProperty({ required: false, description: 'Personal notes about the restaurant' })
  @IsOptional()
  @IsString()
  notes?: string;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class AddOrderGuestDto {
  @ApiPropertyOptional({ description: 'User ID if guest has app account' })
  @IsOptional()
  @IsUUID()
  guest_user_id?: string;

  @ApiProperty({ description: 'Guest name' })
  @IsNotEmpty()
  @IsString()
  guest_name: string;
}

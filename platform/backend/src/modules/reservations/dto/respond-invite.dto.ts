import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';

export enum InviteResponse {
  ACCEPT = 'accept',
  DECLINE = 'decline',
}

export class RespondInviteDto {
  @ApiProperty({
    description: 'Response to invitation',
    enum: InviteResponse
  })
  @IsNotEmpty()
  @IsEnum(InviteResponse)
  response: InviteResponse;

  @ApiPropertyOptional({ description: 'Message for host (optional)' })
  @IsOptional()
  @IsString()
  message?: string;
}

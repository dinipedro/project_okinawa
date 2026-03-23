import { IsNotEmpty, IsArray, IsUUID, ArrayMaxSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MarkAsReadDto {
  @ApiProperty({ type: [String], description: 'Array of notification UUIDs (max 100)' })
  @IsNotEmpty()
  @IsArray()
  @IsUUID('4', { each: true, message: 'Each notification_id must be a valid UUID' })
  @ArrayMaxSize(100, { message: 'Cannot mark more than 100 notifications at once' })
  notification_ids: string[];
}

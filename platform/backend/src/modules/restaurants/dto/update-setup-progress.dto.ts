import { IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSetupProgressDto {
  @ApiProperty({
    description: 'Array of completed setup step IDs',
    type: [String],
    example: ['1', '2', '3']
  })
  @IsArray()
  @IsString({ each: true })
  completedSteps: string[];
}

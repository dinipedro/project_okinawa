import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsOptional,
  IsInt,
  IsIn,
  Length,
  Min,
  Max,
} from 'class-validator';

export class CreateCookStationDto {
  @ApiProperty({ description: 'Station name', example: 'Grill Station' })
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiProperty({ description: 'Station type', enum: ['kitchen', 'bar'] })
  @IsIn(['kitchen', 'bar'])
  type: 'kitchen' | 'bar';

  @ApiPropertyOptional({ description: 'Emoji icon for the station', example: '🔥' })
  @IsOptional()
  @IsString()
  emoji?: string;

  @ApiPropertyOptional({
    description: 'Minutes before an item is considered late',
    default: 15,
    minimum: 1,
    maximum: 120,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(120)
  late_threshold_minutes?: number;

  @ApiPropertyOptional({ description: 'Display order for sorting', default: 0 })
  @IsOptional()
  @IsInt()
  display_order?: number;

  @ApiProperty({ description: 'Restaurant ID' })
  @IsUUID()
  restaurant_id: string;
}

export class UpdateCookStationDto extends PartialType(CreateCookStationDto) {}

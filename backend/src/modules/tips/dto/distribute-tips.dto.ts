import { IsNotEmpty, IsArray, IsOptional, IsString, IsUUID, ValidateNested, IsNumber, Min, ArrayMaxSize, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

enum DistributionMethod {
  EQUAL = 'equal',
  PERCENTAGE = 'percentage',
  HOURS_WORKED = 'hours_worked',
}

class DistributionMethodDto {
  @ApiProperty({ enum: DistributionMethod })
  @IsEnum(DistributionMethod)
  method: DistributionMethod;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  staff_count: number;
}

export class DistributeTipsDto {
  @ApiProperty({ description: 'Restaurant UUID' })
  @IsNotEmpty()
  @IsUUID()
  restaurant_id: string;

  @ApiProperty({ type: [String], description: 'Array of staff UUIDs (max 50)' })
  @IsArray()
  @IsUUID('4', { each: true, message: 'Each staff_id must be a valid UUID' })
  @ArrayMaxSize(50, { message: 'Cannot distribute to more than 50 staff members at once' })
  staff_ids: string[];

  @ApiPropertyOptional({ type: DistributionMethodDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => DistributionMethodDto)
  distribution_method?: DistributionMethodDto;
}

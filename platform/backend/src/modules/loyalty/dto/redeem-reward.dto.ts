import { IsNotEmpty, IsUUID, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class RedeemRewardDto {
  @ApiProperty({
    description: 'Reward UUID to redeem',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({ message: 'Reward ID is required' })
  @IsUUID('4', { message: 'Reward ID must be a valid UUID' })
  reward_id: string;

  @ApiPropertyOptional({
    description: 'Order ID to apply reward to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Order ID must be a valid UUID' })
  order_id?: string;

  @ApiPropertyOptional({
    description: 'Additional notes for redemption',
    example: 'Apply to main dish',
    maxLength: 200,
  })
  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  @MaxLength(200, { message: 'Notes cannot exceed 200 characters' })
  @Transform(({ value }) => value?.trim())
  notes?: string;
}

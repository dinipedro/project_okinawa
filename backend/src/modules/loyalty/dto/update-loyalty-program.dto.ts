import { IsOptional, IsInt, IsString, IsEnum, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum LoyaltyTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
}

export class UpdateLoyaltyProgramDto {
  @ApiProperty({ required: false, description: 'Loyalty points' })
  @IsOptional()
  @IsInt()
  @Min(0)
  points?: number;

  @ApiProperty({ required: false, description: 'Loyalty tier', enum: LoyaltyTier })
  @IsOptional()
  @IsEnum(LoyaltyTier)
  tier?: LoyaltyTier;

  @ApiProperty({ required: false, description: 'Total visits count' })
  @IsOptional()
  @IsInt()
  @Min(0)
  total_visits?: number;

  @ApiProperty({ required: false, description: 'Total amount spent' })
  @IsOptional()
  @IsInt()
  @Min(0)
  total_spent?: number;

  @ApiProperty({ required: false, description: 'Number of rewards claimed' })
  @IsOptional()
  @IsInt()
  @Min(0)
  rewards_claimed?: number;

  @ApiProperty({ required: false, description: 'Special notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

import { IsNotEmpty, IsString, IsNumber, IsOptional, IsEnum, Min, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TipType } from '../entities/tip.entity';

export class CreateTipDto {
  @ApiProperty({ description: 'Restaurant UUID' })
  @IsNotEmpty()
  @IsUUID('4', { message: 'Invalid restaurant ID format' })
  restaurant_id: string;

  @ApiProperty({ required: false, description: 'Staff UUID (for direct tips)' })
  @IsOptional()
  @IsUUID('4', { message: 'Invalid staff ID format' })
  staff_id?: string;

  @ApiProperty({ required: false, description: 'Order UUID (for order-related tips)' })
  @IsOptional()
  @IsUUID('4', { message: 'Invalid order ID format' })
  order_id?: string;

  @ApiProperty({ description: 'Tip amount', minimum: 0.01 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01, { message: 'Tip amount must be at least 0.01' })
  amount: number;

  @ApiProperty({ enum: TipType, description: 'Type of tip' })
  @IsNotEmpty()
  @IsEnum(TipType, { message: 'Invalid tip type' })
  tip_type: TipType;

  @ApiProperty({ required: false, description: 'Optional message with the tip' })
  @IsOptional()
  @IsString()
  message?: string;
}

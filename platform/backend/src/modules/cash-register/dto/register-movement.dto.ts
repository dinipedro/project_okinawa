import {
  IsNotEmpty,
  IsUUID,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsString,
  IsIn,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MovementType } from '../entities/cash-register-movement.entity';

const MOVEMENT_TYPES: MovementType[] = [
  'sale_cash',
  'sale_card',
  'sale_pix',
  'sale_tap',
  'sale_wallet',
  'tip',
  'sangria',
  'reforco',
  'refund',
  'expense',
];

export class RegisterMovementDto {
  @ApiProperty({ description: 'Session ID to add movement to' })
  @IsNotEmpty()
  @IsUUID()
  sessionId: string;

  @ApiProperty({
    description: 'Movement type',
    enum: MOVEMENT_TYPES,
    example: 'sale_cash',
  })
  @IsNotEmpty()
  @IsString()
  @IsIn(MOVEMENT_TYPES)
  type: MovementType;

  @ApiProperty({ description: 'Movement amount (negative for sangria)', example: 150.00 })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  amount: number;

  @ApiProperty({ description: 'Whether this movement affects the physical cash register' })
  @IsNotEmpty()
  @IsBoolean()
  isCash: boolean;

  @ApiProperty({ required: false, description: 'Associated order ID' })
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @ApiProperty({ required: false, description: 'Movement description' })
  @IsOptional()
  @IsString()
  description?: string;
}

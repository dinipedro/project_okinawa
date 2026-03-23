import { IsOptional, IsBoolean, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePaymentMethodDto {
  @ApiProperty({ required: false, description: 'Card holder name' })
  @IsOptional()
  @IsString()
  card_holder_name?: string;

  @ApiProperty({ required: false, description: 'Set as default payment method' })
  @IsOptional()
  @IsBoolean()
  is_default?: boolean;

  @ApiProperty({ required: false, description: 'Nickname for this payment method' })
  @IsOptional()
  @IsString()
  nickname?: string;
}

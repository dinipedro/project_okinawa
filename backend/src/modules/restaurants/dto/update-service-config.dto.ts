import { IsBoolean, IsNumber, IsEnum, IsArray, IsOptional, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CasualDiningConfigDto } from './casual-dining-config.dto';
import { PubBarConfigDto } from './pub-bar-config.dto';
import { ClubConfigDto } from './club-config.dto';

enum ServiceChargeType {
  OPTIONAL = 'optional',
  MANDATORY = 'mandatory',
}

enum TipsDistribution {
  EQUAL = 'equal',
  WEIGHTED = 'weighted',
  MANUAL = 'manual',
}

class ServiceChargeDto {
  @ApiProperty()
  @IsBoolean()
  enabled: boolean;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(100)
  percentage: number;

  @ApiProperty({ enum: ServiceChargeType })
  @IsEnum(ServiceChargeType)
  type: ServiceChargeType;
}

class TipsDto {
  @ApiProperty()
  @IsBoolean()
  enabled: boolean;

  @ApiProperty({ type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  defaultPercentages: number[];

  @ApiProperty()
  @IsBoolean()
  allowCustom: boolean;

  @ApiProperty({ enum: TipsDistribution })
  @IsEnum(TipsDistribution)
  distribution: TipsDistribution;
}

class ReservationsDto {
  @ApiProperty()
  @IsBoolean()
  enabled: boolean;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  advanceBookingDays: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  minPartySize: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  maxPartySize: number;

  @ApiProperty()
  @IsBoolean()
  requireDeposit: boolean;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  depositAmount: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  cancellationHours: number;
}

class OrdersDto {
  @ApiProperty()
  @IsBoolean()
  enableTableOrdering: boolean;

  @ApiProperty()
  @IsBoolean()
  enableDelivery: boolean;

  @ApiProperty()
  @IsBoolean()
  enablePickup: boolean;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  preparationTime: number;

  @ApiProperty()
  @IsBoolean()
  autoAcceptOrders: boolean;
}

class NotificationsDto {
  @ApiProperty()
  @IsBoolean()
  newOrder: boolean;

  @ApiProperty()
  @IsBoolean()
  newReservation: boolean;

  @ApiProperty()
  @IsBoolean()
  cancelledReservation: boolean;

  @ApiProperty()
  @IsBoolean()
  payment: boolean;

  @ApiProperty()
  @IsBoolean()
  review: boolean;
}

export class UpdateServiceConfigDto {
  @ApiPropertyOptional({ type: ServiceChargeDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ServiceChargeDto)
  serviceCharge?: ServiceChargeDto;

  @ApiPropertyOptional({ type: TipsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => TipsDto)
  tips?: TipsDto;

  @ApiPropertyOptional({ type: ReservationsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ReservationsDto)
  reservations?: ReservationsDto;

  @ApiPropertyOptional({ type: OrdersDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => OrdersDto)
  orders?: OrdersDto;

  @ApiPropertyOptional({ type: NotificationsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => NotificationsDto)
  notifications?: NotificationsDto;

  @ApiPropertyOptional({ type: CasualDiningConfigDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CasualDiningConfigDto)
  casualDining?: CasualDiningConfigDto;

  @ApiPropertyOptional({ type: PubBarConfigDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PubBarConfigDto)
  pubBar?: PubBarConfigDto;

  @ApiPropertyOptional({ type: ClubConfigDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ClubConfigDto)
  club?: ClubConfigDto;
}

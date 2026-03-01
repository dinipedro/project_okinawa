import { IsOptional, IsEnum, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum KDSType {
  KITCHEN = 'kitchen',
  BAR = 'bar',
}

export enum KDSStatus {
  PENDING = 'pending',
  PREPARING = 'preparing',
  READY = 'ready',
}

export class GetKdsOrdersDto {
  @ApiPropertyOptional({ enum: KDSType })
  @IsOptional()
  @IsEnum(KDSType)
  type?: KDSType;

  @ApiPropertyOptional({ enum: KDSStatus })
  @IsOptional()
  @IsEnum(KDSStatus)
  status?: KDSStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  restaurant_id?: string;
}

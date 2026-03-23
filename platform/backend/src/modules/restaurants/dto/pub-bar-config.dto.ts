import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  IsEnum,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DayOfWeek, HappyHourDiscountType, HappyHourAppliesTo } from '@/common/enums/club-entry.enum';

/**
 * Cover charge schedule configuration
 */
export class CoverChargeScheduleDto {
  @ApiPropertyOptional({ description: 'Schedule name', example: 'Sexta à noite' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: DayOfWeek, isArray: true, description: 'Days of week' })
  @IsOptional()
  @IsArray()
  @IsEnum(DayOfWeek, { each: true })
  days?: DayOfWeek[];

  @ApiPropertyOptional({ description: 'Start time HH:mm', example: '22:00' })
  @IsOptional()
  @IsString()
  start_time?: string;

  @ApiPropertyOptional({ description: 'End time HH:mm', example: '04:00' })
  @IsOptional()
  @IsString()
  end_time?: string;

  @ApiPropertyOptional({ description: 'Cover charge amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional({ description: 'Enable credit from cover charge' })
  @IsOptional()
  @IsBoolean()
  credit_enabled?: boolean;

  @ApiPropertyOptional({ description: 'Credit percentage (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  credit_percentage?: number;
}

/**
 * Happy hour schedule configuration
 */
export class HappyHourScheduleDto {
  @ApiPropertyOptional({ description: 'Schedule name', example: 'Happy Hour' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: DayOfWeek, isArray: true, description: 'Days of week' })
  @IsOptional()
  @IsArray()
  @IsEnum(DayOfWeek, { each: true })
  days?: DayOfWeek[];

  @ApiPropertyOptional({ description: 'Start time HH:mm', example: '17:00' })
  @IsOptional()
  @IsString()
  start_time?: string;

  @ApiPropertyOptional({ description: 'End time HH:mm', example: '20:00' })
  @IsOptional()
  @IsString()
  end_time?: string;

  @ApiPropertyOptional({ enum: HappyHourDiscountType })
  @IsOptional()
  @IsEnum(HappyHourDiscountType)
  discount_type?: HappyHourDiscountType;

  @ApiPropertyOptional({ description: 'Discount value (percentage or fixed amount)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount_value?: number;

  @ApiPropertyOptional({ enum: HappyHourAppliesTo })
  @IsOptional()
  @IsEnum(HappyHourAppliesTo)
  applies_to?: HappyHourAppliesTo;

  @ApiPropertyOptional({ description: 'Category IDs for targeted discount', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  category_ids?: string[];

  @ApiPropertyOptional({ description: 'Item IDs for targeted discount', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  item_ids?: string[];
}

/**
 * DTO for Pub & Bar specific configuration
 * Pub & Bar: Establishment focused on beverages with social atmosphere for extended conversations and meetings
 */
export class PubBarConfigDto {
  // === COVER CHARGE / ENTRADA ===

  @ApiPropertyOptional({ description: 'Enable cover charge', example: false })
  @IsOptional()
  @IsBoolean()
  cover_charge_enabled?: boolean;

  @ApiPropertyOptional({ description: 'Default cover charge amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cover_charge_amount?: number;

  @ApiPropertyOptional({ description: 'Convert cover charge to consumption credit' })
  @IsOptional()
  @IsBoolean()
  cover_charge_credit_enabled?: boolean;

  @ApiPropertyOptional({ description: 'Percentage of cover converted to credit (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  cover_charge_credit_percentage?: number;

  @ApiPropertyOptional({ type: [CoverChargeScheduleDto], description: 'Cover charge schedules' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CoverChargeScheduleDto)
  cover_charge_schedules?: CoverChargeScheduleDto[];

  // === TAB / COMANDA DIGITAL ===

  @ApiPropertyOptional({ description: 'Enable digital tab', example: true })
  @IsOptional()
  @IsBoolean()
  digital_tab_enabled?: boolean;

  @ApiPropertyOptional({ description: 'Require card pre-authorization for tab' })
  @IsOptional()
  @IsBoolean()
  tab_requires_card_preauth?: boolean;

  @ApiPropertyOptional({ description: 'Pre-authorization amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tab_preauth_amount?: number;

  @ApiPropertyOptional({ description: 'Enable tab spending limit' })
  @IsOptional()
  @IsBoolean()
  tab_limit_enabled?: boolean;

  @ApiPropertyOptional({ description: 'Tab spending limit amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tab_limit_amount?: number;

  @ApiPropertyOptional({ description: 'Enable automatic tab close at specific time' })
  @IsOptional()
  @IsBoolean()
  tab_auto_close_enabled?: boolean;

  @ApiPropertyOptional({ description: 'Auto close time HH:mm', example: '04:00' })
  @IsOptional()
  @IsString()
  tab_auto_close_time?: string;

  @ApiPropertyOptional({ description: 'Minutes of idle before warning' })
  @IsOptional()
  @IsNumber()
  @Min(15)
  @Max(120)
  tab_idle_warning_minutes?: number;

  // === GROUP TAB / TAB COMPARTILHADO ===

  @ApiPropertyOptional({ description: 'Enable group/shared tabs', example: true })
  @IsOptional()
  @IsBoolean()
  group_tab_enabled?: boolean;

  @ApiPropertyOptional({ description: 'Maximum members per group tab' })
  @IsOptional()
  @IsNumber()
  @Min(2)
  @Max(20)
  group_tab_max_members?: number;

  @ApiPropertyOptional({ description: 'Track individual consumption within group' })
  @IsOptional()
  @IsBoolean()
  track_individual_consumption?: boolean;

  @ApiPropertyOptional({ description: 'Allow invite via shareable link' })
  @IsOptional()
  @IsBoolean()
  group_invite_via_link?: boolean;

  @ApiPropertyOptional({ description: 'Allow members to order without host approval' })
  @IsOptional()
  @IsBoolean()
  group_member_can_order?: boolean;

  // === HAPPY HOUR / PROMOÇÕES ===

  @ApiPropertyOptional({ description: 'Enable happy hour promotions', example: true })
  @IsOptional()
  @IsBoolean()
  happy_hour_enabled?: boolean;

  @ApiPropertyOptional({ type: [HappyHourScheduleDto], description: 'Happy hour schedules' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HappyHourScheduleDto)
  happy_hour_schedules?: HappyHourScheduleDto[];

  // === RESERVATIONS ===

  @ApiPropertyOptional({ description: 'Enable table reservations', example: true })
  @IsOptional()
  @IsBoolean()
  reservations_enabled?: boolean;

  @ApiPropertyOptional({ description: 'Group size that requires reservation' })
  @IsOptional()
  @IsNumber()
  @Min(4)
  @Max(20)
  reservations_required_from_group_size?: number;

  @ApiPropertyOptional({ description: 'Require deposit for reservations' })
  @IsOptional()
  @IsBoolean()
  reservation_deposit_enabled?: boolean;

  @ApiPropertyOptional({ description: 'Deposit amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  reservation_deposit_amount?: number;

  @ApiPropertyOptional({ description: 'Convert deposit to consumption credit' })
  @IsOptional()
  @IsBoolean()
  reservation_deposit_credit_enabled?: boolean;

  @ApiPropertyOptional({ description: 'Deposit credit percentage (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  reservation_deposit_credit_percentage?: number;

  @ApiPropertyOptional({ description: 'Enable minimum spend for reservations' })
  @IsOptional()
  @IsBoolean()
  reservation_minimum_spend_enabled?: boolean;

  @ApiPropertyOptional({ description: 'Minimum spend amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  reservation_minimum_spend_amount?: number;

  // === ENVIRONMENT ===

  @ApiPropertyOptional({ description: 'Has outdoor area' })
  @IsOptional()
  @IsBoolean()
  outdoor_area_available?: boolean;

  @ApiPropertyOptional({ description: 'Has smoking area' })
  @IsOptional()
  @IsBoolean()
  smoking_area_available?: boolean;
}

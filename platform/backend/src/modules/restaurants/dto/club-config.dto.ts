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
import { DayOfWeek } from '@/common/enums/club-entry.enum';

/**
 * Cover charge variation (Pista, VIP, Open Bar, etc.)
 */
export class CoverChargeVariationDto {
  @ApiPropertyOptional({ description: 'Variation name', example: 'Pista' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Door price' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ description: 'Advance purchase price' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  advance_price?: number;

  @ApiPropertyOptional({ description: 'What is included', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  includes?: string[];

  @ApiPropertyOptional({ description: 'Available until time HH:mm' })
  @IsOptional()
  @IsString()
  available_until?: string;

  @ApiPropertyOptional({ description: 'Ticket quota (null for unlimited)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quota?: number;

  @ApiPropertyOptional({ description: 'Enable credit from entry' })
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
 * VIP Table type configuration
 */
export class TableTypeDto {
  @ApiPropertyOptional({ description: 'Table type name', example: 'Camarote' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Minimum capacity' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  capacity_min?: number;

  @ApiPropertyOptional({ description: 'Maximum capacity' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  capacity_max?: number;

  @ApiPropertyOptional({ description: 'Minimum spend required' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minimum_spend?: number;

  @ApiPropertyOptional({ description: 'Location description' })
  @IsOptional()
  @IsString()
  location_description?: string;

  @ApiPropertyOptional({ description: 'Amenities included', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @ApiPropertyOptional({ description: 'Photo URL' })
  @IsOptional()
  @IsString()
  photo_url?: string;
}

/**
 * Occupancy level display configuration
 */
export class OccupancyLevelDto {
  @ApiPropertyOptional({ description: 'Threshold percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  threshold_percentage?: number;

  @ApiPropertyOptional({ description: 'Label', example: 'Lotado' })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional({ description: 'Display color' })
  @IsOptional()
  @IsString()
  color?: string;
}

/**
 * Queue priority level configuration
 */
export class QueuePriorityLevelDto {
  @ApiPropertyOptional({ description: 'Priority name', example: 'VIP' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Priority order (lower = higher priority)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  priority?: number;

  @ApiPropertyOptional({ description: 'Wait time multiplier (0.5 = half time)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  estimated_wait_multiplier?: number;
}

/**
 * Club area configuration
 */
export class ClubAreaDto {
  @ApiPropertyOptional({ description: 'Area name', example: 'Pista Principal' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Area description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Music style' })
  @IsOptional()
  @IsString()
  music_style?: string;

  @ApiPropertyOptional({ description: 'Access type', enum: ['all', 'vip_only', 'separate_entry'] })
  @IsOptional()
  @IsString()
  access_type?: 'all' | 'vip_only' | 'separate_entry';

  @ApiPropertyOptional({ description: 'Has separate cover charge' })
  @IsOptional()
  @IsBoolean()
  separate_cover?: boolean;

  @ApiPropertyOptional({ description: 'Separate cover price' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cover_price?: number;
}

/**
 * DTO for Club & Balada specific configuration
 * Club: Entertainment venue with music, dance, VIP tables, and nightlife experience
 */
export class ClubConfigDto {
  // === COVER CHARGE / ENTRADA ===

  @ApiPropertyOptional({ description: 'Enable cover charge', example: true })
  @IsOptional()
  @IsBoolean()
  cover_charge_enabled?: boolean;

  @ApiPropertyOptional({ description: 'Default cover charge price' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cover_charge_default_price?: number;

  @ApiPropertyOptional({ description: 'Door price (without advance purchase)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cover_charge_door_price?: number;

  @ApiPropertyOptional({ description: 'Advance purchase price' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cover_charge_advance_price?: number;

  @ApiPropertyOptional({ description: 'Convert entry to consumption credit' })
  @IsOptional()
  @IsBoolean()
  cover_charge_credit_enabled?: boolean;

  @ApiPropertyOptional({ description: 'Credit percentage (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  cover_charge_credit_percentage?: number;

  @ApiPropertyOptional({ type: [CoverChargeVariationDto], description: 'Entry variations' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CoverChargeVariationDto)
  cover_charge_variations?: CoverChargeVariationDto[];

  // === GUEST LIST ===

  @ApiPropertyOptional({ description: 'Enable guest list', example: true })
  @IsOptional()
  @IsBoolean()
  guest_list_enabled?: boolean;

  @ApiPropertyOptional({ description: 'Guest list discount percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  guest_list_discount_percentage?: number;

  @ApiPropertyOptional({ description: 'Guest list deadline HH:mm', example: '23:00' })
  @IsOptional()
  @IsString()
  guest_list_deadline?: string;

  // === BIRTHDAY ===

  @ApiPropertyOptional({ description: 'Enable free entry for birthday person' })
  @IsOptional()
  @IsBoolean()
  birthday_free_entry_enabled?: boolean;

  @ApiPropertyOptional({ description: 'Minimum companions required for birthday' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  birthday_minimum_companions?: number;

  @ApiPropertyOptional({ description: 'Days in advance to request birthday entry' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(30)
  birthday_advance_days?: number;

  // === ACCESS CONTROL ===

  @ApiPropertyOptional({ description: 'Minimum age restriction' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(25)
  age_restriction?: number;

  @ApiPropertyOptional({ description: 'Enable dress code' })
  @IsOptional()
  @IsBoolean()
  dress_code_enabled?: boolean;

  @ApiPropertyOptional({ description: 'Dress code description' })
  @IsOptional()
  @IsString()
  dress_code_description?: string;

  // === LINEUP / ATRAÇÕES ===

  @ApiPropertyOptional({ description: 'Enable lineup display', example: true })
  @IsOptional()
  @IsBoolean()
  lineup_enabled?: boolean;

  // === VIP TABLES / CAMAROTES ===

  @ApiPropertyOptional({ description: 'Enable VIP table service', example: true })
  @IsOptional()
  @IsBoolean()
  table_service_enabled?: boolean;

  @ApiPropertyOptional({ type: [TableTypeDto], description: 'VIP table types' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TableTypeDto)
  table_types?: TableTypeDto[];

  @ApiPropertyOptional({ description: 'Enable visual table map' })
  @IsOptional()
  @IsBoolean()
  table_map_enabled?: boolean;

  @ApiPropertyOptional({ description: 'Require deposit for VIP tables' })
  @IsOptional()
  @IsBoolean()
  table_deposit_required?: boolean;

  @ApiPropertyOptional({ description: 'Deposit type', enum: ['fixed', 'percentage'] })
  @IsOptional()
  @IsString()
  table_deposit_type?: 'fixed' | 'percentage';

  @ApiPropertyOptional({ description: 'Deposit value' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  table_deposit_value?: number;

  @ApiPropertyOptional({ description: 'Convert deposit to consumption credit' })
  @IsOptional()
  @IsBoolean()
  table_deposit_credit_enabled?: boolean;

  @ApiPropertyOptional({ description: 'Deposit credit percentage (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  table_deposit_credit_percentage?: number;

  @ApiPropertyOptional({ description: 'Cancellation deadline in hours' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(72)
  table_cancellation_deadline_hours?: number;

  @ApiPropertyOptional({ description: 'Require confirmation before event' })
  @IsOptional()
  @IsBoolean()
  table_confirmation_required?: boolean;

  @ApiPropertyOptional({ description: 'Confirmation deadline in hours' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(72)
  table_confirmation_deadline_hours?: number;

  // === CONSUMPTION ===

  @ApiPropertyOptional({ description: 'Enable bottle service', example: true })
  @IsOptional()
  @IsBoolean()
  bottle_service_enabled?: boolean;

  @ApiPropertyOptional({ description: 'Enable minimum spend tracker' })
  @IsOptional()
  @IsBoolean()
  minimum_spend_tracker_enabled?: boolean;

  @ApiPropertyOptional({ description: 'Alert at percentage of minimum spend' })
  @IsOptional()
  @IsNumber()
  @Min(50)
  @Max(100)
  minimum_spend_alert_percentage?: number;

  @ApiPropertyOptional({ description: 'Enable ordering at bar via app' })
  @IsOptional()
  @IsBoolean()
  bar_order_enabled?: boolean;

  // === CAPACITY & QUEUE ===

  @ApiPropertyOptional({ description: 'Venue capacity limit' })
  @IsOptional()
  @IsNumber()
  @Min(50)
  capacity_limit?: number;

  @ApiPropertyOptional({ description: 'Show occupancy level to users' })
  @IsOptional()
  @IsBoolean()
  show_occupancy_level?: boolean;

  @ApiPropertyOptional({ type: [OccupancyLevelDto], description: 'Occupancy level thresholds' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OccupancyLevelDto)
  occupancy_levels?: OccupancyLevelDto[];

  @ApiPropertyOptional({ description: 'Enable virtual queue management', example: true })
  @IsOptional()
  @IsBoolean()
  queue_management_enabled?: boolean;

  @ApiPropertyOptional({ type: [QueuePriorityLevelDto], description: 'Queue priority levels' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QueuePriorityLevelDto)
  queue_priority_levels?: QueuePriorityLevelDto[];

  @ApiPropertyOptional({ description: 'Enable check-in/out tracking' })
  @IsOptional()
  @IsBoolean()
  check_in_out_enabled?: boolean;

  // === MULTIPLE AREAS ===

  @ApiPropertyOptional({ description: 'Enable multiple areas/environments' })
  @IsOptional()
  @IsBoolean()
  multiple_areas_enabled?: boolean;

  @ApiPropertyOptional({ type: [ClubAreaDto], description: 'Club areas configuration' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClubAreaDto)
  areas?: ClubAreaDto[];
}

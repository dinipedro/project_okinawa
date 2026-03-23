import { IsBoolean, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for Casual Dining specific configuration
 * Casual Dining: Traditional restaurant with table service, optional reservations, and group support
 */
export class CasualDiningConfigDto {
  // === RESERVATIONS & ENTRY ===

  @ApiPropertyOptional({
    description: 'Accept both walk-ins and reservations',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  reservations_optional?: boolean;

  @ApiPropertyOptional({
    description: 'Grace period in minutes before reservation is cancelled',
    example: 15,
  })
  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(30)
  reservation_grace_period?: number;

  @ApiPropertyOptional({
    description: 'Enable smart waitlist for walk-ins',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  waitlist_enabled?: boolean;

  @ApiPropertyOptional({
    description: 'Allow ordering drinks/appetizers while waiting in queue',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  waitlist_advance_drinks?: boolean;

  @ApiPropertyOptional({
    description: 'Display estimated wait time to customers',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  estimated_wait_display?: boolean;

  // === TABLE SERVICE ===

  @ApiPropertyOptional({
    description: 'Full table service with dedicated waiter',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  table_service?: boolean;

  @ApiPropertyOptional({
    description: 'Allow ordering via app while at the table',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  order_at_table?: boolean;

  @ApiPropertyOptional({
    description: 'Enable call waiter button in app',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  call_waiter_button?: boolean;

  @ApiPropertyOptional({
    description: 'Allow adding items to existing order without waiter',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  partial_order_enabled?: boolean;

  // === GROUPS ===

  @ApiPropertyOptional({
    description: 'Restaurant is group-friendly',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  group_friendly?: boolean;

  @ApiPropertyOptional({
    description: 'Maximum group size allowed',
    example: 20,
  })
  @IsOptional()
  @IsNumber()
  @Min(4)
  @Max(50)
  max_group_size?: number;

  @ApiPropertyOptional({
    description: 'Party size threshold that requires reservation',
    example: 8,
  })
  @IsOptional()
  @IsNumber()
  @Min(4)
  @Max(20)
  group_reservation_required?: number;

  // === PAYMENT ===

  @ApiPropertyOptional({
    description: 'Suggested tip percentage shown to customers',
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(20)
  suggested_tip_percentage?: number;

  @ApiPropertyOptional({
    description: 'Service charge is already included in prices',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  service_charge_included?: boolean;

  @ApiPropertyOptional({
    description: 'Promote split bill feature prominently',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  split_bill_promoted?: boolean;

  // === OPERATIONAL ===

  @ApiPropertyOptional({
    description: 'Average meal duration in minutes',
    example: 75,
  })
  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(180)
  average_meal_duration?: number;

  @ApiPropertyOptional({
    description: 'Target table turnover per day',
    example: 4,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  table_turnover_target?: number;
}

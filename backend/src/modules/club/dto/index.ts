import { IsString, IsOptional, IsNumber, IsEnum, IsUUID, IsDate, IsInt, Min, Max, IsArray, IsBoolean, ValidateNested, ArrayMaxSize } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ClubEntryPurchaseType, VipTableGuestStatus } from '@/common/enums';

// ==========================================
// CLUB ENTRIES DTOs
// ==========================================

export class PurchaseClubEntryDto {
  @ApiProperty()
  @IsUUID()
  restaurant_id: string;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  event_date: Date;

  @ApiProperty()
  @IsString()
  variation_id: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  variation_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @ApiProperty()
  @IsNumber()
  unit_price: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  credit_amount?: number;

  @ApiPropertyOptional({ enum: ClubEntryPurchaseType })
  @IsOptional()
  @IsEnum(ClubEntryPurchaseType)
  purchase_type?: ClubEntryPurchaseType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  transaction_id?: string;
}

export class ValidateClubEntryDto {
  @ApiProperty()
  @IsString()
  qr_code: string;
}

// ==========================================
// GUEST LIST DTOs
// ==========================================

export class JoinGuestListDto {
  @ApiProperty()
  @IsUUID()
  restaurant_id: string;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  event_date: Date;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  party_size?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  promoter_id?: string;
}

// ==========================================
// VIP TABLE RESERVATION DTOs
// ==========================================

export class CreateVipTableReservationDto {
  @ApiProperty()
  @IsUUID()
  restaurant_id: string;

  @ApiProperty()
  @IsString()
  table_type_id: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  table_id?: string;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  event_date: Date;

  @ApiProperty()
  @IsInt()
  @Min(1)
  party_size: number;

  @ApiProperty()
  @IsNumber()
  minimum_spend: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  deposit_amount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  special_requests?: string;
}

export class InviteVipTableGuestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  user_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;
}

export class RespondToVipInviteDto {
  @ApiProperty()
  @IsString()
  invite_token: string;

  @ApiProperty({ enum: ['confirmed', 'declined'] })
  @IsString()
  response: 'confirmed' | 'declined';
}

// ==========================================
// VIP TABLE TAB DTOs
// ==========================================

export class AddVipTabItemDto {
  @ApiProperty()
  @IsUUID()
  menu_item_id: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty()
  @IsNumber()
  unit_price: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  special_instructions?: string;
}

// ==========================================
// QUEUE DTOs
// ==========================================

export class JoinQueueDto {
  @ApiProperty()
  @IsUUID()
  restaurant_id: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  party_size: number;

  @ApiProperty()
  @IsString()
  priority_level_id: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  priority_level_name?: string;
}

// ==========================================
// LINEUP DTOs
// ==========================================

export class CreateLineupDto {
  @ApiProperty()
  @IsUUID()
  restaurant_id: string;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  event_date: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  event_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cover_image_url?: string;
}

export class CreateLineupSlotDto {
  @ApiProperty()
  @IsString()
  artist_name: string;

  @ApiProperty()
  @IsString()
  artist_type: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  photo_url?: string;

  @ApiProperty()
  @IsString()
  start_time: string;

  @ApiProperty()
  @IsString()
  end_time: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  stage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  genre?: string;

  @ApiPropertyOptional()
  @IsOptional()
  is_headliner?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  display_order?: number;
}

// ==========================================
// CHECK-IN DTOs
// ==========================================

export class CheckInDto {
  @ApiProperty()
  @IsUUID()
  restaurant_id: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  entry_id?: string;
}

export class CheckOutDto {
  @ApiProperty()
  @IsUUID()
  check_in_id: string;
}

// ==========================================
// BIRTHDAY ENTRY DTOs
// ==========================================

export class BirthdayCompanionDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  document_number?: string;
}

export class RequestBirthdayEntryDto {
  @ApiProperty()
  @IsUUID()
  restaurant_id: string;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  event_date: Date;

  @ApiProperty({ description: 'Birthday person\'s birth date' })
  @Type(() => Date)
  @IsDate()
  birth_date: Date;

  @ApiProperty({ enum: ['cpf', 'rg', 'passport'] })
  @IsString()
  document_type: string;

  @ApiProperty()
  @IsString()
  document_number: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  document_photo_url?: string;

  @ApiPropertyOptional({ type: [BirthdayCompanionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BirthdayCompanionDto)
  @ArrayMaxSize(10)
  companions?: BirthdayCompanionDto[];
}

export class ApproveBirthdayEntryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  free_entry?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discount_percentage?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  credit_amount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  companions_allowed?: number;
}

export class RejectBirthdayEntryDto {
  @ApiProperty()
  @IsString()
  reason: string;
}

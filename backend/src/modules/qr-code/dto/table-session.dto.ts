import { IsUUID, IsNotEmpty, IsOptional, IsString, IsInt, Min, Max, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum SessionStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
}

export class StartSessionDto {
  @ApiProperty({
    description: 'Restaurant UUID from QR code',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'Restaurant ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Restaurant ID is required' })
  restaurant_id: string;

  @ApiProperty({
    description: 'Table UUID from QR code',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'Table ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Table ID is required' })
  table_id: string;

  @ApiProperty({
    description: 'QR code signature for validation',
    example: 'a1b2c3d4e5f6...',
  })
  @IsString()
  @IsNotEmpty({ message: 'Signature is required' })
  signature: string;

  @ApiPropertyOptional({
    description: 'QR code version',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  version?: number;

  @ApiPropertyOptional({
    description: 'Guest name (for anonymous users)',
    example: 'João',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  guest_name?: string;

  @ApiPropertyOptional({
    description: 'Number of guests at the table',
    example: 4,
    minimum: 1,
    maximum: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'Guest count must be at least 1' })
  @Max(50, { message: 'Guest count cannot exceed 50' })
  guest_count?: number;
}

export class SessionResponseDto {
  @ApiProperty({
    description: 'Session UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Restaurant UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  restaurant_id: string;

  @ApiProperty({
    description: 'Table UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  table_id: string;

  @ApiProperty({
    description: 'Table number/name',
    example: 'T-01',
  })
  table_number: string;

  @ApiProperty({
    description: 'Session status',
    enum: SessionStatus,
    example: SessionStatus.ACTIVE,
  })
  status: SessionStatus;

  @ApiPropertyOptional({
    description: 'Customer ID if authenticated',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  customer_id?: string;

  @ApiPropertyOptional({
    description: 'Guest name if anonymous',
    example: 'João',
  })
  guest_name?: string;

  @ApiProperty({
    description: 'Number of guests',
    example: 4,
  })
  guest_count: number;

  @ApiProperty({
    description: 'Session start time',
    example: '2024-01-15T19:30:00Z',
  })
  started_at: Date;

  @ApiPropertyOptional({
    description: 'Last activity timestamp',
    example: '2024-01-15T20:15:00Z',
  })
  last_activity?: Date;

  @ApiProperty({
    description: 'Total orders in this session',
    example: 3,
  })
  total_orders: number;

  @ApiProperty({
    description: 'Total amount spent in this session',
    example: 285.50,
  })
  total_spent: number;

  @ApiPropertyOptional({
    description: 'Restaurant details',
  })
  restaurant?: {
    id: string;
    name: string;
    logo_url?: string;
  };
}

export class EndSessionDto {
  @ApiProperty({
    description: 'Session UUID to end',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'Session ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Session ID is required' })
  session_id: string;

  @ApiPropertyOptional({
    description: 'End status',
    enum: [SessionStatus.COMPLETED, SessionStatus.ABANDONED],
    default: SessionStatus.COMPLETED,
  })
  @IsOptional()
  @IsEnum([SessionStatus.COMPLETED, SessionStatus.ABANDONED])
  status?: SessionStatus.COMPLETED | SessionStatus.ABANDONED;
}

export class QRScanLogDto {
  @ApiProperty({
    description: 'QR code ID that was scanned',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  qr_code_id: string;

  @ApiProperty({
    description: 'Restaurant UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  restaurant_id: string;

  @ApiProperty({
    description: 'Table UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  table_id: string;

  @ApiProperty({
    description: 'Scan result',
    enum: ['success', 'invalid', 'expired', 'revoked'],
    example: 'success',
  })
  scan_result: 'success' | 'invalid' | 'expired' | 'revoked';

  @ApiPropertyOptional({
    description: 'Device information',
  })
  device_info?: Record<string, any>;
}

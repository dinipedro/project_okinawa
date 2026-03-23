import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ValidateQRCodeDto {
  @ApiProperty({
    description: 'QR code data string to validate',
    example: 'okinawa://table/123e4567-e89b-12d3-a456-426614174000',
    maxLength: 1000,
  })
  @IsString({ message: 'QR code data must be a string' })
  @IsNotEmpty({ message: 'QR code data is required' })
  @MaxLength(1000, { message: 'QR code data cannot exceed 1000 characters' })
  qr_code_data: string;
}

export class QRCodeValidationResultDto {
  @ApiProperty({
    description: 'Whether the QR code is valid',
    example: true,
  })
  is_valid: boolean;

  @ApiProperty({
    description: 'Type of QR code',
    example: 'table',
    enum: ['table', 'menu', 'payment'],
  })
  type: string;

  @ApiProperty({
    description: 'Restaurant UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  restaurant_id: string;

  @ApiProperty({
    description: 'Reference ID (table_id, order_id, etc.)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  reference_id: string;

  @ApiPropertyOptional({
    description: 'Additional metadata from the QR code',
    example: { table_number: 'T-01', capacity: 4 },
  })
  metadata?: Record<string, any>;
}

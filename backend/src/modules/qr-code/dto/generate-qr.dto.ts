import { IsUUID, IsEnum, IsNotEmpty, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum QRCodeType {
  TABLE = 'table',
  MENU = 'menu',
  PAYMENT = 'payment',
}

export class GenerateQRCodeDto {
  @ApiProperty({
    description: 'Type of QR code to generate',
    enum: QRCodeType,
    example: QRCodeType.TABLE,
  })
  @IsEnum(QRCodeType, { message: 'Type must be one of: table, menu, payment' })
  @IsNotEmpty({ message: 'QR code type is required' })
  type: QRCodeType;

  @ApiProperty({
    description: 'Restaurant UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'Restaurant ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Restaurant ID is required' })
  restaurant_id: string;

  @ApiProperty({
    description: 'Reference ID (table_id, order_id, etc.)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'Reference ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Reference ID is required' })
  reference_id: string;

  @ApiPropertyOptional({
    description: 'Expiration time in minutes (default: 60)',
    example: 120,
    minimum: 5,
    maximum: 10080,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Expiration must be an integer' })
  @Min(5, { message: 'Minimum expiration is 5 minutes' })
  @Max(10080, { message: 'Maximum expiration is 7 days (10080 minutes)' })
  expires_in_minutes?: number;
}

export class QRCodeResultDto {
  @ApiProperty({
    description: 'URL to access the QR code image',
    example: 'https://example.com/qr/abc123.png',
  })
  qr_code_url: string;

  @ApiProperty({
    description: 'Raw QR code data/content',
    example: 'okinawa://table/123e4567-e89b-12d3-a456-426614174000',
  })
  qr_code_data: string;

  @ApiPropertyOptional({
    description: 'Expiration date/time of the QR code',
    example: '2024-12-31T23:59:59Z',
  })
  expires_at?: Date;
}

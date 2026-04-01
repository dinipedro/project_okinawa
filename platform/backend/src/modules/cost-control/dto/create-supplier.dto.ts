import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUUID,
  IsEmail,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSupplierDto {
  @ApiProperty({ description: 'Restaurant UUID' })
  @IsNotEmpty()
  @IsUUID('4', { message: 'Invalid restaurant ID format' })
  restaurant_id: string;

  @ApiProperty({ maxLength: 200, description: 'Supplier name' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200, { message: 'Name cannot exceed 200 characters' })
  name: string;

  @ApiProperty({ required: false, maxLength: 14, description: 'CNPJ (Brazilian tax ID)' })
  @IsOptional()
  @IsString()
  @MaxLength(14, { message: 'CNPJ cannot exceed 14 characters' })
  cnpj?: string;

  @ApiProperty({ required: false, maxLength: 200, description: 'Contact person name' })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Contact name cannot exceed 200 characters' })
  contact_name?: string;

  @ApiProperty({ required: false, maxLength: 20, description: 'Phone number' })
  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'Phone cannot exceed 20 characters' })
  phone?: string;

  @ApiProperty({ required: false, maxLength: 200, description: 'Email address' })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  @MaxLength(200, { message: 'Email cannot exceed 200 characters' })
  email?: string;

  @ApiProperty({ required: false, description: 'Supplier address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ required: false, description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

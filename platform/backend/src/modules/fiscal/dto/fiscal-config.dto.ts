import {
  IsString,
  IsOptional,
  IsBoolean,
  IsObject,
  IsUUID,
  Length,
  IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for creating/updating fiscal configuration for a restaurant.
 */
export class UpsertFiscalConfigDto {
  @ApiProperty({ description: 'Restaurant ID' })
  @IsUUID()
  restaurantId: string;

  @ApiProperty({ description: 'CNPJ (14 digits, no formatting)', example: '12345678000190' })
  @IsString()
  @Length(14, 14)
  cnpj: string;

  @ApiPropertyOptional({ description: 'State Registration (IE)' })
  @IsOptional()
  @IsString()
  @Length(1, 15)
  ie?: string;

  @ApiProperty({ description: 'Legal name (Razao Social)' })
  @IsString()
  @Length(1, 200)
  razaoSocial: string;

  @ApiPropertyOptional({ description: 'Trade name (Nome Fantasia)' })
  @IsOptional()
  @IsString()
  @Length(1, 200)
  nomeFantasia?: string;

  @ApiProperty({ description: 'State code (UF)', example: 'SP' })
  @IsString()
  @Length(2, 2)
  stateCode: string;

  @ApiProperty({ description: 'Address (JSONB)' })
  @IsObject()
  endereco: Record<string, any>;

  @ApiProperty({
    description: 'Tax regime',
    enum: ['simples_nacional', 'lucro_presumido', 'lucro_real'],
  })
  @IsString()
  @IsIn(['simples_nacional', 'lucro_presumido', 'lucro_real'])
  regimeTributario: string;

  @ApiProperty({ description: 'Tax defaults (JSONB with cfop, ncm_default, icms_csosn, etc.)' })
  @IsObject()
  taxDefaults: Record<string, any>;

  @ApiPropertyOptional({ description: 'CSC ID from SEFAZ' })
  @IsOptional()
  @IsString()
  @Length(1, 10)
  cscId?: string;

  @ApiPropertyOptional({ description: 'CSC Token from SEFAZ' })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  cscToken?: string;

  @ApiPropertyOptional({
    description: 'Fiscal provider',
    enum: ['focus_nfe', 'sefaz_direct', 'none'],
    default: 'focus_nfe',
  })
  @IsOptional()
  @IsString()
  @IsIn(['focus_nfe', 'sefaz_direct', 'none'])
  fiscalProvider?: string;

  @ApiPropertyOptional({ description: 'Focus NFe API token for this restaurant' })
  @IsOptional()
  @IsString()
  focusNfeToken?: string;

  @ApiPropertyOptional({ description: 'Auto-emit NFC-e on payment confirmation', default: true })
  @IsOptional()
  @IsBoolean()
  autoEmit?: boolean;
}

/**
 * DTO for cancelling a fiscal document.
 */
export class CancelFiscalDocumentDto {
  @ApiProperty({ description: 'Cancellation reason (minimum 15 characters)' })
  @IsString()
  @Length(15, 255)
  reason: string;
}

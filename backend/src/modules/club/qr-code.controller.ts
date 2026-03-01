import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { QrCodeService } from './qr-code.service';

class GenerateEntryQrDto {
  entryId: string;
  userId: string;
  restaurantId: string;
  eventDate: string;
  entryType: 'ticket' | 'guest_list' | 'birthday' | 'vip_table';
  quantity?: number;
  expiresAt?: string;
}

class ValidateQrDto {
  qrPayload: string;
}

class GenerateBatchDto {
  restaurantId: string;
  eventDate: string;
  entryType: 'ticket' | 'guest_list';
  count: number;
  expiresAt?: string;
}

class GeneratePromoterQrDto {
  promoterId: string;
  promoterCode: string;
  restaurantId: string;
  eventDate?: string;
}

class GenerateWristbandQrDto {
  entryId: string;
  userId: string;
  restaurantId: string;
  eventDate: string;
  wristbandColor: string;
  vipLevel?: number;
  consumptionCredit?: number;
}

@ApiTags('QR Codes')
@Controller('qr-codes')
@ApiBearerAuth()
export class QrCodeController {
  constructor(private readonly qrCodeService: QrCodeService) {}

  @Post('generate/entry')
  @ApiOperation({ summary: 'Generate QR code for entry' })
  async generateEntryQr(@Body() dto: GenerateEntryQrDto) {
    return this.qrCodeService.generateEntryQrCode({
      entryId: dto.entryId,
      userId: dto.userId,
      restaurantId: dto.restaurantId,
      eventDate: new Date(dto.eventDate),
      entryType: dto.entryType,
      quantity: dto.quantity,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
    });
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validate a QR code' })
  async validateQr(@Body() dto: ValidateQrDto) {
    const result = this.qrCodeService.validateQrPayload(dto.qrPayload);
    
    if (result.valid && result.data) {
      // Mark as validated but not yet used
      return {
        valid: true,
        data: result.data,
        message: 'QR code is valid and ready for use',
      };
    }
    
    return result;
  }

  @Post('use/:entryId')
  @ApiOperation({ summary: 'Mark QR code as used (check-in)' })
  async useQr(
    @Param('entryId') entryId: string,
    @Body('type') type: string
  ) {
    const isUsed = this.qrCodeService.isCodeUsed(entryId);
    
    if (isUsed) {
      return {
        success: false,
        error: 'This code has already been used',
      };
    }
    
    this.qrCodeService.markAsUsed(entryId, type);
    
    return {
      success: true,
      message: 'Entry successfully checked in',
      checkedInAt: new Date(),
    };
  }

  @Get('check/:entryId')
  @ApiOperation({ summary: 'Check if QR code has been used' })
  async checkUsed(@Param('entryId') entryId: string) {
    const isUsed = this.qrCodeService.isCodeUsed(entryId);
    return { entryId, isUsed };
  }

  @Post('generate/batch')
  @ApiOperation({ summary: 'Generate batch QR codes for bulk tickets' })
  async generateBatch(@Body() dto: GenerateBatchDto) {
    const codes = this.qrCodeService.generateBatchQrCodes(
      {
        restaurantId: dto.restaurantId,
        eventDate: new Date(dto.eventDate),
        entryType: dto.entryType,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      },
      dto.count
    );

    return {
      count: codes.length,
      codes,
    };
  }

  @Post('generate/promoter')
  @ApiOperation({ summary: 'Generate QR code for promoter tracking' })
  async generatePromoterQr(@Body() dto: GeneratePromoterQrDto) {
    return this.qrCodeService.generatePromoterQrCode({
      promoterId: dto.promoterId,
      promoterCode: dto.promoterCode,
      restaurantId: dto.restaurantId,
      eventDate: dto.eventDate ? new Date(dto.eventDate) : undefined,
    });
  }

  @Post('generate/wristband')
  @ApiOperation({ summary: 'Generate QR code for wristband' })
  async generateWristbandQr(@Body() dto: GenerateWristbandQrDto) {
    return this.qrCodeService.generateWristbandQrCode({
      entryId: dto.entryId,
      userId: dto.userId,
      restaurantId: dto.restaurantId,
      eventDate: new Date(dto.eventDate),
      wristbandColor: dto.wristbandColor,
      vipLevel: dto.vipLevel,
      consumptionCredit: dto.consumptionCredit,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get QR validation statistics' })
  async getStats() {
    return this.qrCodeService.getValidationStats();
  }
}

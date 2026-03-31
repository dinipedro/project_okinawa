import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums';
import { FiscalEmissionService } from '../services/fiscal-emission.service';
import { FiscalOnboardingService } from '../services/fiscal-onboarding.service';
import {
  UpsertFiscalConfigDto,
  CancelFiscalDocumentDto,
} from '../dto/fiscal-config.dto';

/**
 * Fiscal Controller -- NFC-e emission, config, and document management.
 *
 * Endpoints:
 * POST   /fiscal/config              -- OWNER: upsert fiscal config
 * GET    /fiscal/config               -- OWNER, MANAGER: get fiscal config
 * POST   /fiscal/emit/:orderId        -- OWNER, MANAGER: manual emission
 * POST   /fiscal/cancel/:documentId   -- OWNER, MANAGER: cancel NFC-e
 * GET    /fiscal/documents            -- OWNER, MANAGER: list NFC-e
 * GET    /fiscal/documents/:id        -- OWNER, MANAGER: document details
 */
@ApiTags('fiscal')
@Controller('fiscal')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class FiscalController {
  constructor(
    private readonly emissionService: FiscalEmissionService,
    private readonly onboardingService: FiscalOnboardingService,
  ) {}

  // ─── Config ────────────────────────────────────────────────────────────────

  @Post('config')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Create or update fiscal configuration for a restaurant' })
  @ApiResponse({ status: 201, description: 'Fiscal config saved successfully' })
  upsertConfig(@Body() dto: UpsertFiscalConfigDto) {
    return this.onboardingService.upsertConfig(dto);
  }

  @Get('config')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get fiscal configuration for a restaurant' })
  @ApiResponse({ status: 200, description: 'Returns fiscal config' })
  @ApiResponse({ status: 404, description: 'Config not found' })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  getConfig(@Query('restaurant_id') restaurantId: string) {
    return this.onboardingService.getConfig(restaurantId);
  }

  // ─── Certificate Upload (Placeholder) ──────────────────────────────────────

  @Post('certificate/upload')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Upload A1 digital certificate (sends to Focus NFe)' })
  @ApiResponse({ status: 201, description: 'Certificate uploaded successfully' })
  uploadCertificate(
    @Body() body: { restaurantId: string; certificate: string; password: string },
  ) {
    // In production: parse multipart/form-data for the .pfx file
    // For now, accept base64 string as placeholder
    const certBuffer = Buffer.from(body.certificate || '', 'base64');
    return this.onboardingService.uploadCertificate(
      body.restaurantId,
      certBuffer,
      body.password,
    );
  }

  // ─── Emission ──────────────────────────────────────────────────────────────

  @Post('emit/:orderId')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Manually emit NFC-e for an order' })
  @ApiResponse({ status: 201, description: 'NFC-e emitted (or pending)' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 400, description: 'Already emitted' })
  emitNfce(@Param('orderId') orderId: string) {
    return this.emissionService.emitForOrder(orderId);
  }

  // ─── Cancellation ─────────────────────────────────────────────────────────

  @Post('cancel/:documentId')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Cancel an authorized NFC-e (up to 24h)' })
  @ApiResponse({ status: 200, description: 'NFC-e cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  cancelNfce(
    @Param('documentId') documentId: string,
    @Body() dto: CancelFiscalDocumentDto,
  ) {
    return this.emissionService.cancelDocument(documentId, dto.reason);
  }

  // ─── Documents ─────────────────────────────────────────────────────────────

  @Get('documents')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'List fiscal documents for a restaurant' })
  @ApiResponse({ status: 200, description: 'Returns list of fiscal documents' })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  getDocuments(@Query('restaurant_id') restaurantId: string) {
    return this.emissionService.getDocuments(restaurantId);
  }

  @Get('documents/:id')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get fiscal document details' })
  @ApiResponse({ status: 200, description: 'Returns fiscal document details' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  getDocument(@Param('id') id: string) {
    return this.emissionService.getDocument(id);
  }
}

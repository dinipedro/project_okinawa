import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { AuthenticatedUser } from '@common/interfaces/authenticated-user.interface';
import { UserRole } from '@/common/enums/user-role.enum';
import { PurchaseImportService } from '../services/purchase-import.service';
import { ImportManualDto } from '../dto/import-manual.dto';
import { ImportXmlDto } from '../dto/import-xml.dto';
import { ConfirmImportDto } from '../dto/confirm-import.dto';

@ApiTags('purchase-import')
@Controller('purchase-import')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PurchaseImportController {
  constructor(
    private readonly purchaseImportService: PurchaseImportService,
  ) {}

  @Post('manual')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Manual purchase import' })
  importManual(
    @Body() dto: ImportManualDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.purchaseImportService.importManual(dto, user?.id);
  }

  @Post('xml')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Import from NF-e XML (placeholder)' })
  importXml(
    @Body() dto: ImportXmlDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.purchaseImportService.importFromXml(
      dto.restaurant_id,
      dto.xml_content,
      user?.id,
    );
  }

  @Get('records')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'List purchase import records' })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  getRecords(@Query('restaurant_id') restaurantId: string) {
    return this.purchaseImportService.getRecords(restaurantId);
  }

  @Post('records/:id/confirm')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Confirm import and apply to stock' })
  confirmImport(
    @Param('id') id: string,
    @Body() dto: ConfirmImportDto,
  ) {
    return this.purchaseImportService.confirmImport(id, dto);
  }
}

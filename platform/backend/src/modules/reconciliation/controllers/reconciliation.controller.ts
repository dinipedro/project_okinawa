import {
  Controller,
  Get,
  Post,
  Body,
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
import { ReconciliationService } from '../services/reconciliation.service';

/**
 * ReconciliationController -- delivery platform settlement reconciliation.
 *
 * Endpoints:
 * GET  /reconciliation/overview  -- OWNER, MANAGER: per-platform summary
 * POST /reconciliation/settle    -- OWNER: manual reconciliation entry
 * GET  /reconciliation/list      -- OWNER, MANAGER: list settlements
 */
@ApiTags('reconciliation')
@Controller('reconciliation')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReconciliationController {
  constructor(
    private readonly reconciliationService: ReconciliationService,
  ) {}

  @Get('overview')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get reconciliation overview per delivery platform' })
  @ApiResponse({ status: 200, description: 'Returns per-platform settlement summary' })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  @ApiQuery({ name: 'period', required: false, type: Number, description: 'Period in days (default: 30)' })
  getOverview(
    @Query('restaurant_id') restaurantId: string,
    @Query('period') period?: string,
  ): Promise<any> {
    return this.reconciliationService.getOverview(
      restaurantId,
      period ? parseInt(period, 10) : 30,
    );
  }

  @Post('settle')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Manually reconcile a delivery settlement' })
  @ApiResponse({ status: 201, description: 'Settlement reconciled' })
  settle(
    @Body()
    body: {
      settlementId: string;
      actualReceived: number;
    },
  ) {
    return this.reconciliationService.reconcile({
      settlementId: body.settlementId,
      actualReceived: body.actualReceived,
    });
  }

  @Get('list')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'List delivery settlements for a restaurant' })
  @ApiResponse({ status: 200, description: 'Returns list of settlements' })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  @ApiQuery({ name: 'platform', required: false, type: String })
  @ApiQuery({ name: 'period', required: false, type: Number })
  listSettlements(
    @Query('restaurant_id') restaurantId: string,
    @Query('platform') platform?: string,
    @Query('period') period?: string,
  ) {
    return this.reconciliationService.listSettlements(
      restaurantId,
      platform,
      period ? parseInt(period, 10) : 30,
    );
  }
}

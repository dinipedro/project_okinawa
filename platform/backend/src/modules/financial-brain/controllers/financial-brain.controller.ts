import {
  Controller,
  Get,
  Query,
  UseGuards,
  ForbiddenException,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { ForecastService } from '../services/forecast.service';
import { AccountingExportService } from '../services/accounting-export.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { AuthenticatedUser } from '@common/interfaces/authenticated-user.interface';
import { UserRole } from '@/common/enums';

@ApiTags('financial-brain')
@Controller('financial-brain')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER, UserRole.MANAGER)
@ApiBearerAuth()
export class FinancialBrainController {
  constructor(
    private readonly forecastService: ForecastService,
    private readonly accountingExportService: AccountingExportService,
  ) {}

  private verifyRestaurantAccess(
    user: AuthenticatedUser,
    restaurantId: string,
  ): void {
    const userRestaurants = user.restaurants || [];
    const hasAccess = userRestaurants.some(
      (r: { id: string; role: string }) =>
        r.id === restaurantId &&
        [UserRole.OWNER as string, UserRole.MANAGER as string].includes(r.role),
    );

    if (!hasAccess) {
      throw new ForbiddenException(
        'Access denied - not affiliated with this restaurant',
      );
    }
  }

  // ────────── Forecast ──────────

  @Get('forecast')
  @ApiOperation({ summary: 'Get cash flow forecast' })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Forecast horizon (7, 30, 90). Default: 30' })
  @ApiResponse({ status: 200, description: 'Forecast generated successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  getForecast(
    @CurrentUser() user: AuthenticatedUser,
    @Query('restaurant_id') restaurantId: string,
    @Query('days', new ParseIntPipe({ optional: true })) days?: number,
  ) {
    this.verifyRestaurantAccess(user, restaurantId);
    return this.forecastService.getForecast(restaurantId, days || 30);
  }

  // ────────── Accounting Export ──────────

  @Get('export')
  @ApiOperation({ summary: 'Export transactions for accounting' })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  @ApiQuery({ name: 'period', required: true, type: String, description: 'Month in YYYY-MM format' })
  @ApiQuery({ name: 'format', required: false, enum: ['csv', 'pdf'], description: 'Export format. Default: csv' })
  @ApiResponse({ status: 200, description: 'Export generated successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  exportTransactions(
    @CurrentUser() user: AuthenticatedUser,
    @Query('restaurant_id') restaurantId: string,
    @Query('period') period: string,
    @Query('format') format?: 'csv' | 'pdf',
  ) {
    this.verifyRestaurantAccess(user, restaurantId);
    return this.accountingExportService.exportTransactions(
      restaurantId,
      period,
      format || 'csv',
    );
  }
}

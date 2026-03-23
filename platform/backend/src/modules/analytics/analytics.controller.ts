import {
  Controller,
  Get,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER, UserRole.MANAGER)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({
    summary: 'Get dashboard metrics (today, week, month with comparisons)',
  })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  getDashboard(@Query('restaurant_id') restaurantId: string) {
    return this.analyticsService.getDashboardMetrics(restaurantId);
  }

  @Get('sales')
  @ApiOperation({ summary: 'Get sales analytics for period' })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  @ApiQuery({ name: 'start_date', required: true, type: String })
  @ApiQuery({ name: 'end_date', required: true, type: String })
  getSalesAnalytics(
    @Query('restaurant_id') restaurantId: string,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
  ) {
    return this.analyticsService.getSalesAnalytics(
      restaurantId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('customers')
  @ApiOperation({
    summary: 'Get customer analytics (loyalty, spending, new vs returning)',
  })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  @ApiQuery({ name: 'start_date', required: true, type: String })
  @ApiQuery({ name: 'end_date', required: true, type: String })
  getCustomerAnalytics(
    @Query('restaurant_id') restaurantId: string,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
  ) {
    return this.analyticsService.getCustomerAnalytics(
      restaurantId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('performance')
  @ApiOperation({
    summary:
      'Get restaurant performance metrics (ratings, no-show rate, staff efficiency)',
  })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  getPerformance(@Query('restaurant_id') restaurantId: string) {
    return this.analyticsService.getRestaurantPerformance(restaurantId);
  }

  @Get('forecast')
  @ApiOperation({ summary: 'Get revenue forecast for next N days' })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  @ApiQuery({ name: 'days', required: false, type: Number })
  getForecast(
    @Query('restaurant_id') restaurantId: string,
    @Query('days', new ParseIntPipe({ optional: true })) days?: number,
  ) {
    return this.analyticsService.getRevenueForecast(restaurantId, days);
  }

  @Get('realtime')
  @ApiOperation({
    summary:
      'Get real-time metrics (active orders, tables, staff, last hour revenue)',
  })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  getRealTime(@Query('restaurant_id') restaurantId: string) {
    return this.analyticsService.getRealTimeMetrics(restaurantId);
  }
}

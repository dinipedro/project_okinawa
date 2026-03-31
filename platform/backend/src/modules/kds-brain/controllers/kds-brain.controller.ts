import {
  Controller,
  Get,
  Put,
  Patch,
  Post,
  Param,
  Query,
  Body,
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
import { BrainRouterService } from '../services/brain-router.service';
import { ItemAvailabilityService } from '../services/item-availability.service';
import { AutoSyncService } from '../services/auto-sync.service';
import { AnalyticsService } from '../services/analytics.service';
import { SelfLearningService } from '../services/self-learning.service';
import { KdsBrainConfigService } from '../services/kds-brain-config.service';

@ApiTags('kds-brain')
@Controller('kds/brain')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class KdsBrainController {
  constructor(
    private readonly brainRouterService: BrainRouterService,
    private readonly itemAvailabilityService: ItemAvailabilityService,
    private readonly autoSyncService: AutoSyncService,
    private readonly analyticsService: AnalyticsService,
    private readonly selfLearningService: SelfLearningService,
    private readonly configService: KdsBrainConfigService,
  ) {}

  // ─── Chef Overview ──────────────────────────────────────────────

  @Get('chef/overview')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.CHEF)
  @ApiOperation({ summary: 'Get chef overview with station summaries, metrics and alerts' })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Returns chef overview data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires chef/manager/owner role' })
  getChefOverview(
    @Query('restaurant_id') restaurantId: string,
  ) {
    return this.brainRouterService.getChefOverview(restaurantId);
  }

  // ─── Station Queue ───────────────────────────────────────────────

  @Get('stations/:stationId/queue')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.CHEF, UserRole.BARMAN)
  @ApiOperation({ summary: 'Get station queue with priority and countdown' })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filter by item status (pending, preparing, ready)' })
  @ApiResponse({ status: 200, description: 'Returns station queue items with priority and countdown' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires kitchen/bar staff role' })
  getStationQueue(
    @Param('stationId') stationId: string,
    @Query('restaurant_id') restaurantId: string,
    @Query('status') status?: string,
  ) {
    return this.brainRouterService.getStationQueue({
      station_id: stationId,
      restaurant_id: restaurantId,
      status,
    });
  }

  // ─── Item Bump / Undo ────────────────────────────────────────────

  @Patch('items/:itemId/bump')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.CHEF, UserRole.BARMAN)
  @ApiOperation({ summary: 'Bump item to next status (pending -> preparing -> ready)' })
  @ApiResponse({ status: 200, description: 'Item bumped to next status' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  bumpItem(@Param('itemId') itemId: string) {
    return this.brainRouterService.bumpItem(itemId);
  }

  @Patch('items/:itemId/undo')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.CHEF, UserRole.BARMAN)
  @ApiOperation({ summary: 'Undo item to previous status (ready -> preparing -> pending)' })
  @ApiResponse({ status: 200, description: 'Item reverted to previous status' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  undoItem(@Param('itemId') itemId: string) {
    return this.brainRouterService.undoItem(itemId);
  }

  // ─── Menu Item Availability (86) ─────────────────────────────────

  @Patch('menu-items/:id/toggle-available')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.CHEF, UserRole.BARMAN)
  @ApiOperation({ summary: 'Toggle menu item availability (86 / un-86)' })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Menu item availability toggled' })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  toggleItemAvailability(
    @Param('id') menuItemId: string,
    @Query('restaurant_id') restaurantId: string,
  ) {
    return this.itemAvailabilityService.toggleAvailability(
      menuItemId,
      restaurantId,
    );
  }

  // ─── Convergence ──────────────────────────────────────────────

  @Get('orders/:orderId/convergence')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.CHEF, UserRole.BARMAN, UserRole.WAITER)
  @ApiOperation({ summary: 'Get convergence state for an order (all courses or specific course)' })
  @ApiQuery({ name: 'course', required: false, type: String, description: 'Filter by course (appetizer, main, dessert, drink, side)' })
  @ApiResponse({ status: 200, description: 'Returns convergence state with station statuses' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires kitchen/service staff role' })
  getConvergenceState(
    @Param('orderId') orderId: string,
    @Query('course') course?: string,
  ) {
    return this.autoSyncService.getConvergenceState(orderId, course);
  }

  // ─── Analytics (Sprint 4) ─────────────────────────────────────

  @Get('analytics/prep-times')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.CHEF)
  @ApiOperation({ summary: 'Get prep time analytics per menu item and station' })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  @ApiQuery({ name: 'period', required: false, type: Number, description: 'Period in days (default: 7)' })
  @ApiResponse({ status: 200, description: 'Returns prep time aggregation' })
  getPrepTimes(
    @Query('restaurant_id') restaurantId: string,
    @Query('period') period?: string,
  ) {
    return this.analyticsService.getPrepTimes(restaurantId, period ? Number(period) : 7);
  }

  @Get('analytics/bottlenecks')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.CHEF)
  @ApiOperation({ summary: 'Get station bottlenecks sorted by late percentage' })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  @ApiQuery({ name: 'period', required: false, type: Number, description: 'Period in days (default: 7)' })
  @ApiResponse({ status: 200, description: 'Returns stations sorted by late percentage' })
  getBottlenecks(
    @Query('restaurant_id') restaurantId: string,
    @Query('period') period?: string,
  ) {
    return this.analyticsService.getBottlenecks(restaurantId, period ? Number(period) : 7);
  }

  @Get('analytics/throughput')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.CHEF)
  @ApiOperation({ summary: 'Get throughput: items completed per hour grouped by shift' })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  @ApiQuery({ name: 'period', required: false, type: Number, description: 'Period in days (default: 7)' })
  @ApiResponse({ status: 200, description: 'Returns throughput data by hour and shift' })
  getThroughput(
    @Query('restaurant_id') restaurantId: string,
    @Query('period') period?: string,
  ) {
    return this.analyticsService.getThroughput(restaurantId, period ? Number(period) : 7);
  }

  @Get('analytics/platform-performance')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.CHEF)
  @ApiOperation({ summary: 'Get performance metrics grouped by order source platform' })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  @ApiQuery({ name: 'period', required: false, type: Number, description: 'Period in days (default: 30)' })
  @ApiResponse({ status: 200, description: 'Returns platform performance comparison' })
  getPlatformPerformance(
    @Query('restaurant_id') restaurantId: string,
    @Query('period') period?: string,
  ) {
    return this.analyticsService.getPlatformPerformance(restaurantId, period ? Number(period) : 30);
  }

  // ─── Self-Learning Suggestions (Sprint 4) ─────────────────────

  @Get('suggestions')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get pending prep-time suggestions for a restaurant' })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Returns pending suggestions' })
  getSuggestions(
    @Query('restaurant_id') restaurantId: string,
  ) {
    return this.selfLearningService.getSuggestions(restaurantId);
  }

  @Post('suggestions/generate')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Manually trigger prep-time suggestion generation' })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  @ApiResponse({ status: 201, description: 'Suggestions generated' })
  generateSuggestions(
    @Query('restaurant_id') restaurantId: string,
  ) {
    return this.selfLearningService.generateSuggestions(restaurantId);
  }

  @Patch('suggestions/:id/accept')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Accept a prep-time suggestion and update the menu item' })
  @ApiResponse({ status: 200, description: 'Suggestion accepted and menu item updated' })
  @ApiResponse({ status: 404, description: 'Suggestion not found' })
  acceptSuggestion(@Param('id') id: string) {
    return this.selfLearningService.acceptSuggestion(id);
  }

  @Patch('suggestions/:id/reject')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Reject a prep-time suggestion' })
  @ApiResponse({ status: 200, description: 'Suggestion rejected' })
  @ApiResponse({ status: 404, description: 'Suggestion not found' })
  rejectSuggestion(@Param('id') id: string) {
    return this.selfLearningService.rejectSuggestion(id);
  }

  // ─── KDS Brain Config (Sprint 4) ──────────────────────────────

  @Get('config')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get KDS Brain configuration for a restaurant' })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Returns KDS Brain config' })
  getConfig(
    @Query('restaurant_id') restaurantId: string,
  ) {
    return this.configService.getConfig(restaurantId);
  }

  @Put('config')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create or update KDS Brain configuration (upsert)' })
  @ApiResponse({ status: 200, description: 'Config saved' })
  upsertConfig(@Body() body: any) {
    return this.configService.upsertConfig(body);
  }
}

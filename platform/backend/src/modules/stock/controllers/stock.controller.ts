import {
  Controller,
  Get,
  Post,
  Patch,
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
import { StockService } from '../services/stock.service';
import { InventoryCountService } from '../services/inventory-count.service';
import { PurchaseSuggestionService } from '../services/purchase-suggestion.service';
import { StockDashboardService } from '../services/stock-dashboard.service';
import { AdjustStockDto } from '../dto/adjust-stock.dto';
import { ReceiveStockDto } from '../dto/receive-stock.dto';
import { RegisterWasteDto } from '../dto/register-waste.dto';
import { RegisterInternalUseDto } from '../dto/register-internal-use.dto';
import { StockMovementType } from '../entities/stock-movement.entity';

@ApiTags('stock')
@Controller('stock')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class StockController {
  constructor(
    private readonly stockService: StockService,
    private readonly inventoryCountService: InventoryCountService,
    private readonly purchaseSuggestionService: PurchaseSuggestionService,
    private readonly stockDashboardService: StockDashboardService,
  ) {}

  // ─── Stock Levels ──────────────────────────────────────────────

  @Get()
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get current stock levels for a restaurant' })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  getStock(@Query('restaurant_id') restaurantId: string) {
    return this.stockService.getStock(restaurantId);
  }

  @Get('low')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get low stock alerts for a restaurant' })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  getLowStock(@Query('restaurant_id') restaurantId: string) {
    return this.stockService.getLowStock(restaurantId);
  }

  // ─── Stock Operations ──────────────────────────────────────────

  @Post('adjust')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Manual stock adjustment' })
  adjustStock(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: AdjustStockDto,
  ) {
    return this.stockService.adjustStock(
      dto.ingredient_id,
      dto.restaurant_id,
      dto.quantity_delta,
      dto.reason,
      user.id,
    );
  }

  @Post('receive')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Receive stock from purchase' })
  receiveStock(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ReceiveStockDto,
  ) {
    return this.stockService.receiveStock(
      dto.ingredient_id,
      dto.restaurant_id,
      dto.quantity,
      dto.price,
      dto.supplier,
      user.id,
    );
  }

  @Post('waste')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.CHEF)
  @ApiOperation({ summary: 'Register waste/loss' })
  registerWaste(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RegisterWasteDto,
  ) {
    return this.stockService.registerWaste(
      dto.ingredient_id,
      dto.restaurant_id,
      dto.quantity,
      dto.reason,
      user.id,
    );
  }

  @Post('internal-use')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Register internal use' })
  registerInternalUse(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RegisterInternalUseDto,
  ) {
    return this.stockService.registerInternalUse(
      dto.ingredient_id,
      dto.restaurant_id,
      dto.quantity,
      dto.reason,
      user.id,
    );
  }

  // ─── Movements ─────────────────────────────────────────────────

  @Get('movements')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Query stock movements with filters' })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  @ApiQuery({ name: 'ingredient_id', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiQuery({ name: 'from', required: false, type: String, description: 'ISO date' })
  @ApiQuery({ name: 'to', required: false, type: String, description: 'ISO date' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getMovements(
    @Query('restaurant_id') restaurantId: string,
    @Query('ingredient_id') ingredientId?: string,
    @Query('type') type?: StockMovementType,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.stockService.getMovements(restaurantId, {
      ingredient_id: ingredientId,
      type,
      from,
      to,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('movements/summary')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get movement summary by type for a period' })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  @ApiQuery({ name: 'from', required: false, type: String, description: 'ISO date' })
  @ApiQuery({ name: 'to', required: false, type: String, description: 'ISO date' })
  getMovementsSummary(
    @Query('restaurant_id') restaurantId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.stockService.getMovementsSummary(restaurantId, from, to);
  }

  // ─── Inventory Count ───────────────────────────────────────────

  @Post('inventory-count/start')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Start a new inventory count' })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  startInventoryCount(
    @CurrentUser() user: AuthenticatedUser,
    @Query('restaurant_id') restaurantId: string,
  ) {
    return this.inventoryCountService.startCount(restaurantId, user.id);
  }

  @Get('inventory-count/history')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get inventory count history for a restaurant' })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  getInventoryCountHistory(@Query('restaurant_id') restaurantId: string) {
    return this.inventoryCountService.getHistory(restaurantId);
  }

  @Get('inventory-count/:id')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get a specific inventory count with items' })
  getInventoryCount(@Param('id') id: string) {
    return this.inventoryCountService.getCount(id);
  }

  @Patch('inventory-count/:countId/items/:itemId')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.CHEF)
  @ApiOperation({ summary: 'Record counted quantity for an inventory count item' })
  recordInventoryCountItem(
    @Param('countId') countId: string,
    @Param('itemId') itemId: string,
    @Body() body: { counted_quantity: number },
  ) {
    return this.inventoryCountService.recordItem(
      countId,
      itemId,
      body.counted_quantity,
    );
  }

  @Post('inventory-count/:id/complete')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Complete an inventory count and adjust stock' })
  completeInventoryCount(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.inventoryCountService.completeCount(id, user.id);
  }

  @Post('inventory-count/:id/cancel')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Cancel an in-progress inventory count' })
  cancelInventoryCount(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.inventoryCountService.cancelCount(id, user.id);
  }

  // ─── Dashboard & Suggestions ───────────────────────────────────

  @Get('dashboard')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get consolidated stock dashboard' })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  getDashboard(@Query('restaurant_id') restaurantId: string) {
    return this.stockDashboardService.getDashboard(restaurantId);
  }

  @Get('purchase-suggestions')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get purchase suggestions based on consumption trends' })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  @ApiQuery({ name: 'days_of_safety', required: false, type: Number, description: 'Safety stock in days (default: 7)' })
  getPurchaseSuggestions(
    @Query('restaurant_id') restaurantId: string,
    @Query('days_of_safety') daysOfSafety?: number,
  ) {
    return this.purchaseSuggestionService.getSuggestions(
      restaurantId,
      daysOfSafety ? Number(daysOfSafety) : undefined,
    );
  }
}

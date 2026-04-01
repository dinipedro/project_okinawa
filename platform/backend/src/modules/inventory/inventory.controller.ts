import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiProperty } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { UpdateItemLevelDto } from './dto/update-item-level.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { AuthenticatedUser } from '@common/interfaces/authenticated-user.interface';
import { UserRole } from '@/common/enums/user-role.enum';

/**
 * @deprecated Use `/stock` endpoints instead. This controller is retained for
 * backward compatibility but will be removed in a future release.
 */
@ApiTags('inventory')
@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class InventoryController {
  private readonly logger = new Logger(InventoryController.name);

  constructor(private readonly inventoryService: InventoryService) {}

  /**
   * @deprecated Use GET /stock?restaurant_id=... instead.
   */
  @Get()
  @Roles(UserRole.MANAGER, UserRole.OWNER, UserRole.CHEF, UserRole.BARMAN)
  @ApiOperation({
    summary: 'List inventory items for a restaurant',
    deprecated: true,
    description: 'DEPRECATED: Use GET /stock instead.',
  })
  @ApiQuery({ name: 'restaurantId', required: true, type: String })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'ok | low | critical' })
  findAll(
    @Query('restaurantId') restaurantId: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
  ) {
    this.logger.warn('DEPRECATED: Use /stock endpoints instead of /inventory');
    return this.inventoryService.findAll(restaurantId, category, status);
  }

  /**
   * @deprecated Use GET /stock/low?restaurant_id=... instead.
   */
  @Get('alerts')
  @Roles(UserRole.MANAGER, UserRole.OWNER, UserRole.CHEF, UserRole.BARMAN)
  @ApiOperation({
    summary: 'Get inventory alerts (low + critical items)',
    deprecated: true,
    description: 'DEPRECATED: Use GET /stock/low instead.',
  })
  @ApiQuery({ name: 'restaurantId', required: true, type: String })
  getAlerts(@Query('restaurantId') restaurantId: string) {
    this.logger.warn('DEPRECATED: Use /stock endpoints instead of /inventory');
    return this.inventoryService.getAlerts(restaurantId);
  }

  /**
   * @deprecated Use GET /stock/inventory-stats?restaurant_id=... instead.
   */
  @Get('stats')
  @Roles(UserRole.MANAGER, UserRole.OWNER)
  @ApiOperation({
    summary: 'Get inventory stats (total, ok, low, critical, estimatedStockValue)',
    deprecated: true,
    description: 'DEPRECATED: Use GET /stock/inventory-stats instead.',
  })
  @ApiQuery({ name: 'restaurantId', required: true, type: String })
  getStats(@Query('restaurantId') restaurantId: string) {
    this.logger.warn('DEPRECATED: Use /stock endpoints instead of /inventory');
    return this.inventoryService.getStats(restaurantId);
  }

  /**
   * @deprecated Use the /stock module instead.
   */
  @Get(':id')
  @Roles(UserRole.MANAGER, UserRole.OWNER, UserRole.CHEF, UserRole.BARMAN)
  @ApiOperation({
    summary: 'Get a single inventory item',
    deprecated: true,
    description: 'DEPRECATED: Use /stock endpoints instead.',
  })
  findOne(@Param('id') id: string) {
    this.logger.warn('DEPRECATED: Use /stock endpoints instead of /inventory');
    return this.inventoryService.findOne(id);
  }

  /**
   * @deprecated Use POST /stock/receive instead.
   */
  @Post()
  @Roles(UserRole.MANAGER, UserRole.OWNER)
  @ApiOperation({
    summary: 'Create inventory item (OWNER, MANAGER only)',
    deprecated: true,
    description: 'DEPRECATED: Use /stock endpoints instead.',
  })
  create(@Body() dto: CreateInventoryItemDto) {
    this.logger.warn('DEPRECATED: Use /stock endpoints instead of /inventory');
    return this.inventoryService.create(dto);
  }

  /**
   * @deprecated Use POST /stock/adjust instead.
   */
  @Patch(':id')
  @Roles(UserRole.MANAGER, UserRole.OWNER)
  @ApiOperation({
    summary: 'Update inventory item config (OWNER, MANAGER only)',
    deprecated: true,
    description: 'DEPRECATED: Use /stock endpoints instead.',
  })
  update(@Param('id') id: string, @Body() dto: UpdateInventoryItemDto) {
    this.logger.warn('DEPRECATED: Use /stock endpoints instead of /inventory');
    return this.inventoryService.update(id, dto);
  }

  /**
   * @deprecated Use POST /stock/adjust instead.
   */
  @Patch(':id/level')
  @Roles(UserRole.MANAGER, UserRole.OWNER, UserRole.CHEF, UserRole.BARMAN)
  @ApiOperation({
    summary: 'Quick level update (restock / adjustment)',
    deprecated: true,
    description: 'DEPRECATED: Use POST /stock/adjust instead.',
  })
  updateLevel(
    @Param('id') id: string,
    @Body() dto: UpdateItemLevelDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    this.logger.warn('DEPRECATED: Use /stock endpoints instead of /inventory');
    return this.inventoryService.updateLevel(id, dto);
  }

  /**
   * @deprecated Use the /stock module instead.
   */
  @Delete(':id')
  @Roles(UserRole.MANAGER, UserRole.OWNER)
  @ApiOperation({
    summary: 'Soft delete inventory item (OWNER, MANAGER only)',
    deprecated: true,
    description: 'DEPRECATED: Use /stock endpoints instead.',
  })
  remove(@Param('id') id: string) {
    this.logger.warn('DEPRECATED: Use /stock endpoints instead of /inventory');
    return this.inventoryService.remove(id);
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/user-role.enum';
import { StockService } from '../services/stock.service';
import { AdjustStockDto } from '../dto/adjust-stock.dto';
import { ReceiveStockDto } from '../dto/receive-stock.dto';

@ApiTags('stock')
@Controller('stock')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class StockController {
  constructor(private readonly stockService: StockService) {}

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

  @Post('adjust')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Manual stock adjustment' })
  adjustStock(@Body() dto: AdjustStockDto) {
    return this.stockService.adjustStock(
      dto.ingredient_id,
      dto.restaurant_id,
      dto.quantity_delta,
      dto.reason,
    );
  }

  @Post('receive')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Receive stock from purchase' })
  receiveStock(@Body() dto: ReceiveStockDto) {
    return this.stockService.receiveStock(
      dto.ingredient_id,
      dto.restaurant_id,
      dto.quantity,
      dto.price,
      dto.supplier,
    );
  }
}

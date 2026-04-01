import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockItem } from './entities/stock-item.entity';
import { StockMovement } from './entities/stock-movement.entity';
import { UnitConversion } from './entities/unit-conversion.entity';
import { InventoryCount, InventoryCountItem } from './entities/inventory-count.entity';
import { IngredientPrice } from '../cost-control/entities/ingredient-price.entity';
import { StockService } from './services/stock.service';
import { UnitConversionService } from './services/unit-conversion.service';
import { InventoryCountService } from './services/inventory-count.service';
import { PurchaseSuggestionService } from './services/purchase-suggestion.service';
import { StockDashboardService } from './services/stock-dashboard.service';
import { StockController } from './controllers/stock.controller';
import { CostControlModule } from '../cost-control/cost-control.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StockItem,
      StockMovement,
      UnitConversion,
      InventoryCount,
      InventoryCountItem,
      IngredientPrice,
    ]),
    CostControlModule,
    EventsModule,
  ],
  controllers: [StockController],
  providers: [
    StockService,
    UnitConversionService,
    InventoryCountService,
    PurchaseSuggestionService,
    StockDashboardService,
  ],
  exports: [StockService, UnitConversionService],
})
export class StockModule {}

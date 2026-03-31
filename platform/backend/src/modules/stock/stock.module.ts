import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockItem } from './entities/stock-item.entity';
import { StockService } from './services/stock.service';
import { StockController } from './controllers/stock.controller';
import { CostControlModule } from '../cost-control/cost-control.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StockItem]),
    CostControlModule,
    EventsModule,
  ],
  controllers: [StockController],
  providers: [StockService],
  exports: [StockService],
})
export class StockModule {}

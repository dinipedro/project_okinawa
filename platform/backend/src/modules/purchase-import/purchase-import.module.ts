import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseRecord } from './entities/purchase-record.entity';
import { PurchaseImportService } from './services/purchase-import.service';
import { PurchaseImportController } from './controllers/purchase-import.controller';
import { CostControlModule } from '../cost-control/cost-control.module';
import { StockModule } from '../stock/stock.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PurchaseRecord]),
    CostControlModule,
    StockModule,
  ],
  controllers: [PurchaseImportController],
  providers: [PurchaseImportService],
  exports: [PurchaseImportService],
})
export class PurchaseImportModule {}

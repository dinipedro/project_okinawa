import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseRecord } from './entities/purchase-record.entity';
import { SupplierItemMapping } from './entities/supplier-item-mapping.entity';
import { FiscalConfig } from '../fiscal/entities/fiscal-config.entity';
import { PurchaseImportService } from './services/purchase-import.service';
import { NfeXmlParserService } from './services/nfe-xml-parser.service';
import { PurchaseImportController } from './controllers/purchase-import.controller';
import { CostControlModule } from '../cost-control/cost-control.module';
import { StockModule } from '../stock/stock.module';
import { FinancialModule } from '../financial/financial.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PurchaseRecord, SupplierItemMapping, FiscalConfig]),
    CostControlModule,
    StockModule,
    FinancialModule,
  ],
  controllers: [PurchaseImportController],
  providers: [PurchaseImportService, NfeXmlParserService],
  exports: [PurchaseImportService, NfeXmlParserService],
})
export class PurchaseImportModule {}

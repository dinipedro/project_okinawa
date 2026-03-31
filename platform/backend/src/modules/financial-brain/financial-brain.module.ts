import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancialTransaction } from '../financial/entities/financial-transaction.entity';
import { DeliverySettlement } from '../reconciliation/entities/delivery-settlement.entity';
import { ForecastService } from './services/forecast.service';
import { AccountingExportService } from './services/accounting-export.service';
import { FinancialBrainController } from './controllers/financial-brain.controller';
import { AccountsPayableModule } from '../accounts-payable/accounts-payable.module';

/**
 * FinancialBrainModule -- Cash flow forecast & accounting export.
 *
 * Sprint 4 of the Financial Brain:
 * - ForecastService: projects daily balance using weighted historical sales,
 *   scheduled bills, and pending delivery settlements.
 * - AccountingExportService: exports transactions in CSV/PDF for accounting systems.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([FinancialTransaction, DeliverySettlement]),
    AccountsPayableModule,
  ],
  controllers: [FinancialBrainController],
  providers: [ForecastService, AccountingExportService],
  exports: [ForecastService, AccountingExportService],
})
export class FinancialBrainModule {}

import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancialService } from './financial.service';
import { FinancialTransactionService } from './financial-transaction.service';
import { FinancialReportService } from './financial-report.service';
import { FinancialExportService } from './financial-export.service';
import { FinancialEventListenerService } from './services/financial-event-listener.service';
import { FinancialController } from './financial.controller';
import { FinancialTransaction } from './entities/financial-transaction.entity';
import { EventsModule } from '@/modules/events/events.module';
import { CashRegisterModule } from '@/modules/cash-register/cash-register.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FinancialTransaction]),
    EventsModule,
    forwardRef(() => CashRegisterModule),
  ],
  controllers: [FinancialController],
  providers: [
    FinancialTransactionService,
    FinancialReportService,
    FinancialExportService,
    FinancialService,
    FinancialEventListenerService,
  ],
  exports: [FinancialService, FinancialTransactionService, FinancialEventListenerService],
})
export class FinancialModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bill } from './entities/bill.entity';
import { AccountsPayableService } from './services/accounts-payable.service';
import { AccountsPayableController } from './controllers/accounts-payable.controller';

/**
 * AccountsPayableModule -- basic accounts payable (bills) management.
 *
 * Provides CRUD for bills + integration with the ForecastService so
 * scheduled bills are included in cash-flow projections.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Bill])],
  controllers: [AccountsPayableController],
  providers: [AccountsPayableService],
  exports: [AccountsPayableService],
})
export class AccountsPayableModule {}

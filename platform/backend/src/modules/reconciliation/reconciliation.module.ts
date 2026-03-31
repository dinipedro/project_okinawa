import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliverySettlement } from './entities/delivery-settlement.entity';
import { ReconciliationService } from './services/reconciliation.service';
import { ReconciliationController } from './controllers/reconciliation.controller';

/**
 * ReconciliationModule -- delivery platform settlement reconciliation.
 *
 * Tracks expected vs actual settlements from iFood, Rappi, UberEats.
 * Flags discrepancies when received amounts differ from expected.
 */
@Module({
  imports: [TypeOrmModule.forFeature([DeliverySettlement])],
  controllers: [ReconciliationController],
  providers: [ReconciliationService],
  exports: [ReconciliationService],
})
export class ReconciliationModule {}

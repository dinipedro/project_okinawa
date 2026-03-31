import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoyaltyService } from './loyalty.service';
import { CashbackService } from './cashback.service';
import { LoyaltyController } from './loyalty.controller';
import { LoyaltyProgram } from './entities/loyalty-program.entity';
import { LoyaltyConfig } from './entities/loyalty-config.entity';
import { StampCard } from './entities/stamp-card.entity';
import { Wallet } from '@/modules/payments/entities/wallet.entity';
import { WalletTransaction } from '@/modules/payments/entities/wallet-transaction.entity';
import { EventsModule } from '@/modules/events/events.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LoyaltyProgram,
      LoyaltyConfig,
      StampCard,
      Wallet,
      WalletTransaction,
    ]),
    EventsModule,
  ],
  controllers: [LoyaltyController],
  providers: [LoyaltyService, CashbackService],
  exports: [LoyaltyService, CashbackService],
})
export class LoyaltyModule {}

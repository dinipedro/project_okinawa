import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Wallet } from './entities/wallet.entity';
import { WalletTransaction } from './entities/wallet-transaction.entity';
import { PaymentMethod } from './entities/payment-method.entity';
import { PaymentSplit } from './entities/payment-split.entity';
import { Order } from '@/modules/orders/entities/order.entity';
import { OrderItem } from '@/modules/orders/entities/order-item.entity';
import { OrderGuest } from '@/modules/orders/entities/order-guest.entity';
import { PaymentSplitService } from './payment-split.service';
import { PaymentSplitController } from './payment-split.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Wallet,
      WalletTransaction,
      PaymentMethod,
      PaymentSplit,
      Order,
      OrderItem,
      OrderGuest,
    ]),
  ],
  controllers: [PaymentsController, PaymentSplitController],
  providers: [PaymentsService, PaymentSplitService],
  exports: [PaymentsService, PaymentSplitService],
})
export class PaymentsModule {}

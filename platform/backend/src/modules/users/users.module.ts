import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DataExportService } from './data-export.service';
import { DataRetentionService } from './data-retention.service';
import { Profile } from './entities/profile.entity';
import { UserRole } from '@/modules/user-roles/entities/user-role.entity';
import { Order } from '@/modules/orders/entities/order.entity';
import { Reservation } from '@/modules/reservations/entities/reservation.entity';
import { Review } from '@/modules/reviews/entities/review.entity';
import { Favorite } from '@/modules/favorites/entities/favorite.entity';
import { LoyaltyProgram } from '@/modules/loyalty/entities/loyalty-program.entity';
import { StampCard } from '@/modules/loyalty/entities/stamp-card.entity';
import { Tip } from '@/modules/tips/entities/tip.entity';
import { Wallet } from '@/modules/payments/entities/wallet.entity';
import { WalletTransaction } from '@/modules/payments/entities/wallet-transaction.entity';
import { Notification } from '@/modules/notifications/entities/notification.entity';
import { AuditLog } from '@/modules/identity/entities/audit-log.entity';
import { UserConsent } from '@/modules/identity/entities/user-consent.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Profile,
      UserRole,
      Order,
      Reservation,
      Review,
      Favorite,
      LoyaltyProgram,
      StampCard,
      Tip,
      Wallet,
      WalletTransaction,
      Notification,
      AuditLog,
      UserConsent,
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService, DataExportService, DataRetentionService],
  exports: [UsersService, DataExportService],
})
export class UsersModule {}

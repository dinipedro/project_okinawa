import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FraudDetectionService } from './fraud-detection.service';
import { SanctionService } from './sanction.service';
import { FraudDetectionController } from './fraud-detection.controller';
import { FraudAlert } from './entities/fraud-alert.entity';
import { UserSanction } from './entities/user-sanction.entity';
import { Order } from '../orders/entities/order.entity';
import { Review } from '../reviews/entities/review.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([FraudAlert, UserSanction, Order, Review]),
  ],
  controllers: [FraudDetectionController],
  providers: [FraudDetectionService, SanctionService],
  exports: [FraudDetectionService, SanctionService],
})
export class FraudDetectionModule {}

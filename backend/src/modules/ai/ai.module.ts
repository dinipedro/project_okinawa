import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { Review } from '@/modules/reviews/entities/review.entity';
import { Order } from '@/modules/orders/entities/order.entity';
import { MenuItem } from '@/modules/menu-items/entities/menu-item.entity';
import { LoyaltyProgram } from '@/modules/loyalty/entities/loyalty-program.entity';
import { Restaurant } from '@/modules/restaurants/entities/restaurant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review, Order, MenuItem, LoyaltyProgram, Restaurant]),
  ],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}

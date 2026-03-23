import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { Review } from './entities/review.entity';
import { UserRole } from '@/modules/user-roles/entities/user-role.entity';
import { EventsModule } from '@/modules/events/events.module';

@Module({
  imports: [TypeOrmModule.forFeature([Review, UserRole]), EventsModule],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}

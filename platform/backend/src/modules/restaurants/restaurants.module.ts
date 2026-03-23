import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantsService } from './restaurants.service';
import { RestaurantsController } from './restaurants.controller';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantServiceConfig } from './entities/restaurant-service-config.entity';
import { UserRole } from '@/modules/user-roles/entities/user-role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, RestaurantServiceConfig, UserRole])],
  controllers: [RestaurantsController],
  providers: [RestaurantsService],
  exports: [RestaurantsService],
})
export class RestaurantsModule {}

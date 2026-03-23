import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { ReservationsGateway } from './reservations.gateway';
import { Reservation } from './entities/reservation.entity';
import { ReservationGuest } from './entities/reservation-guest.entity';
import { ReservationGuestsService } from './reservation-guests.service';
import { ReservationGuestsController } from './reservation-guests.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reservation, ReservationGuest]),
    NotificationsModule,
  ],
  controllers: [ReservationsController, ReservationGuestsController],
  providers: [ReservationsService, ReservationsGateway, ReservationGuestsService],
  exports: [ReservationsService, ReservationsGateway, ReservationGuestsService],
})
export class ReservationsModule {}

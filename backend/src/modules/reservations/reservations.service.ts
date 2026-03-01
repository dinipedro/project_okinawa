import { Injectable, NotFoundException, InternalServerErrorException, ForbiddenException, Logger } from '@nestjs/common';
import { UserRole } from '@/common/enums';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Reservation } from './entities/reservation.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationStatusDto } from './dto/update-reservation-status.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ReservationStatus } from '@common/enums';
import { PaginationDto, paginate } from '@/common/dto/pagination.dto';

@Injectable()
export class ReservationsService {
  private readonly logger = new Logger(ReservationsService.name);

  constructor(
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
    private dataSource: DataSource,
  ) {}

  async create(userId: string, createReservationDto: CreateReservationDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const reservation = this.reservationRepository.create({
        ...createReservationDto,
        user_id: userId,
        status: ReservationStatus.PENDING,
      });

      const savedReservation = await queryRunner.manager.save(reservation);
      await queryRunner.commitTransaction();

      this.logger.log(`Reservation created: ${savedReservation.id}`);
      return savedReservation;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      const err = error as Error;
      this.logger.error(`Failed to create reservation: ${err.message}`, err.stack);
      throw new InternalServerErrorException('Failed to create reservation');
    } finally {
      await queryRunner.release();
    }
  }

  async findByRestaurant(restaurantId: string, pagination?: PaginationDto) {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;

    const [items, total] = await this.reservationRepository.findAndCount({
      where: { restaurant_id: restaurantId },
      relations: ['user'],
      order: { reservation_date: 'ASC', reservation_time: 'ASC' },
      skip,
      take: limit,
    });

    return paginate(items, total, { page, limit } as PaginationDto);
  }

  async findByUser(userId: string, pagination?: PaginationDto) {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;

    const [items, total] = await this.reservationRepository.findAndCount({
      where: { user_id: userId },
      relations: ['restaurant'],
      order: { reservation_date: 'DESC' },
      skip,
      take: limit,
    });

    return paginate(items, total, { page, limit } as PaginationDto);
  }

  async findOne(id: string, userId?: string, roles?: UserRole[]) {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: ['restaurant', 'user'],
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    // SECURITY: Verify access permission
    if (userId && roles) {
      const isStaff = roles.some(role =>
        [UserRole.OWNER, UserRole.MANAGER, UserRole.MAITRE, UserRole.WAITER].includes(role)
      );

      // If not staff, must be the owner of the reservation
      if (!isStaff && reservation.user_id !== userId) {
        throw new ForbiddenException('Access denied');
      }
    }

    return reservation;
  }

  async updateStatus(id: string, updateStatusDto: UpdateReservationStatusDto) {
    const reservation = await this.findOne(id);
    reservation.status = updateStatusDto.status;

    if (updateStatusDto.table_id) {
      reservation.table_id = updateStatusDto.table_id;
    }

    if (updateStatusDto.status === ReservationStatus.CONFIRMED) {
      reservation.confirmed_at = new Date();
    }

    if (updateStatusDto.status === ReservationStatus.SEATED) {
      reservation.seated_at = new Date();
    }

    if (updateStatusDto.status === ReservationStatus.COMPLETED) {
      reservation.completed_at = new Date();
    }

    if (updateStatusDto.status === ReservationStatus.CANCELLED) {
      reservation.cancelled_at = new Date();
    }

    return this.reservationRepository.save(reservation);
  }

  /**
   * Update reservation details
   */
  async update(id: string, updateReservationDto: UpdateReservationDto, userId?: string, roles?: UserRole[]) {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    // SECURITY: Verify access permission
    if (userId && roles) {
      const isStaff = roles.some(role =>
        [UserRole.OWNER, UserRole.MANAGER, UserRole.MAITRE].includes(role)
      );

      // If not staff, must be the owner of the reservation
      if (!isStaff && reservation.user_id !== userId) {
        throw new ForbiddenException('Access denied');
      }
    }

    // Update basic fields
    if (updateReservationDto.reservation_time !== undefined) {
      reservation.reservation_time = updateReservationDto.reservation_time;
    }

    if (updateReservationDto.party_size !== undefined) {
      reservation.party_size = updateReservationDto.party_size;
    }

    if (updateReservationDto.special_requests !== undefined) {
      reservation.special_requests = updateReservationDto.special_requests;
    }

    if (updateReservationDto.table_id !== undefined) {
      reservation.table_id = updateReservationDto.table_id;
    }

    // Update status and related timestamps
    if (updateReservationDto.status) {
      reservation.status = updateReservationDto.status;

      if (updateReservationDto.status === ReservationStatus.CONFIRMED) {
        reservation.confirmed_at = new Date();
      }

      if (updateReservationDto.status === ReservationStatus.SEATED) {
        reservation.seated_at = new Date();
      }

      if (updateReservationDto.status === ReservationStatus.COMPLETED) {
        reservation.completed_at = new Date();
      }

      if (updateReservationDto.status === ReservationStatus.CANCELLED) {
        reservation.cancelled_at = new Date();
      }
    }

    return this.reservationRepository.save(reservation);
  }
}

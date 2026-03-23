import { Test, TestingModule } from '@nestjs/testing';
import { ReservationGuestsService } from './reservation-guests.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ReservationGuest } from './entities/reservation-guest.entity';
import { Reservation } from './entities/reservation.entity';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InviteGuestDto } from './dto/invite-guest.dto';
import { RespondInviteDto, InviteResponse } from './dto/respond-invite.dto';
import { InviteStatus } from './entities/reservation-guest.entity';
import { NotificationsService } from '../notifications/notifications.service';

describe('ReservationGuestsService', () => {
  let service: ReservationGuestsService;
  let guestRepository: Repository<ReservationGuest>;
  let reservationRepository: Repository<Reservation>;

  const mockReservation = {
    id: 'reservation-1',
    user_id: 'host-1',
    restaurant_id: 'restaurant-1',
    party_size: 4,
    status: 'confirmed',
  };

  const mockGuest = {
    id: 'guest-1',
    reservation_id: 'reservation-1',
    guest_user_id: 'user-2',
    status: InviteStatus.PENDING,
    invited_by: 'host-1',
    reservation: mockReservation,
  };

  const mockNotificationsService = {
    create: jest.fn().mockResolvedValue({ id: 'notification-1' }),
    sendPush: jest.fn(),
    sendEmail: jest.fn(),
    sendSMS: jest.fn(),
  };

  const mockDataSource = {
    transaction: jest.fn().mockImplementation((cb) => cb({
      findOne: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 1 }),
      }),
    })),
    createQueryRunner: jest.fn().mockReturnValue({
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        findOne: jest.fn(),
        save: jest.fn(),
      },
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationGuestsService,
        {
          provide: getRepositoryToken(ReservationGuest),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            remove: jest.fn(),
            count: jest.fn(),
            findAndCount: jest.fn().mockResolvedValue([[], 0]),
            createQueryBuilder: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnThis(),
              addSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              orWhere: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              skip: jest.fn().mockReturnThis(),
              take: jest.fn().mockReturnThis(),
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              innerJoinAndSelect: jest.fn().mockReturnThis(),
              leftJoin: jest.fn().mockReturnThis(),
              innerJoin: jest.fn().mockReturnThis(),
              groupBy: jest.fn().mockReturnThis(),
              having: jest.fn().mockReturnThis(),
              setParameter: jest.fn().mockReturnThis(),
              getMany: jest.fn().mockResolvedValue([]),
              getOne: jest.fn().mockResolvedValue(null),
              getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
              getRawOne: jest.fn().mockResolvedValue({}),
              getRawMany: jest.fn().mockResolvedValue([]),
              execute: jest.fn().mockResolvedValue({ affected: 1 }),
            }),
          },
        },
        {
          provide: getRepositoryToken(Reservation),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            count: jest.fn(),
            findAndCount: jest.fn().mockResolvedValue([[], 0]),
            createQueryBuilder: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnThis(),
              addSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              orWhere: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              skip: jest.fn().mockReturnThis(),
              take: jest.fn().mockReturnThis(),
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              innerJoinAndSelect: jest.fn().mockReturnThis(),
              leftJoin: jest.fn().mockReturnThis(),
              innerJoin: jest.fn().mockReturnThis(),
              groupBy: jest.fn().mockReturnThis(),
              having: jest.fn().mockReturnThis(),
              setParameter: jest.fn().mockReturnThis(),
              getMany: jest.fn().mockResolvedValue([]),
              getOne: jest.fn().mockResolvedValue(null),
              getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
              getRawOne: jest.fn().mockResolvedValue({}),
              getRawMany: jest.fn().mockResolvedValue([]),
              execute: jest.fn().mockResolvedValue({ affected: 1 }),
            }),
          },
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<ReservationGuestsService>(ReservationGuestsService);
    guestRepository = module.get<Repository<ReservationGuest>>(getRepositoryToken(ReservationGuest));
    reservationRepository = module.get<Repository<Reservation>>(getRepositoryToken(Reservation));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('inviteGuest', () => {
    it('should invite a guest successfully', async () => {
      const inviteDto: InviteGuestDto = {
        guest_user_id: 'user-2',
        guest_name: 'John Doe',
        guest_email: 'john@example.com',
        invite_method: 'app' as any,
      };

      jest.spyOn(reservationRepository, 'findOne').mockResolvedValue(mockReservation as any);
      jest.spyOn(guestRepository, 'create').mockReturnValue(mockGuest as any);
      jest.spyOn(guestRepository, 'save').mockResolvedValue(mockGuest as any);

      const result = await service.inviteGuest('reservation-1', 'host-1', inviteDto);

      expect(result).toEqual(mockGuest);
      expect(guestRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if reservation not found', async () => {
      jest.spyOn(reservationRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.inviteGuest('reservation-1', 'host-1', {} as any)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('respondToInvite', () => {
    it('should accept invitation', async () => {
      const respondDto: RespondInviteDto = {
        response: InviteResponse.ACCEPT,
      };

      jest.spyOn(guestRepository, 'findOne').mockResolvedValue(mockGuest as any);
      jest.spyOn(guestRepository, 'save').mockResolvedValue({ ...mockGuest, status: InviteStatus.ACCEPTED } as any);

      const result = await service.respondToInvite('guest-1', 'user-2', respondDto);

      expect(result.status).toBe(InviteStatus.ACCEPTED);
    });

    it('should decline invitation', async () => {
      const respondDto: RespondInviteDto = {
        response: InviteResponse.DECLINE,
      };

      const pendingGuest = { ...mockGuest, status: InviteStatus.PENDING };
      jest.spyOn(guestRepository, 'findOne').mockResolvedValue(pendingGuest as any);
      jest.spyOn(guestRepository, 'save').mockResolvedValue({ ...pendingGuest, status: InviteStatus.DECLINED } as any);

      const result = await service.respondToInvite('guest-1', 'user-2', respondDto);

      expect(result.status).toBe(InviteStatus.DECLINED);
    });

    it('should throw NotFoundException if guest not found', async () => {
      const respondDto: RespondInviteDto = {
        response: InviteResponse.ACCEPT,
      };

      jest.spyOn(guestRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.respondToInvite('guest-1', 'user-2', respondDto)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not the guest', async () => {
      const respondDto: RespondInviteDto = {
        response: InviteResponse.ACCEPT,
      };

      jest.spyOn(guestRepository, 'findOne').mockResolvedValue(mockGuest as any);

      await expect(
        service.respondToInvite('guest-1', 'wrong-user', respondDto)
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('removeGuest', () => {
    it('should remove guest successfully', async () => {
      jest.spyOn(reservationRepository, 'findOne').mockResolvedValue(mockReservation as any);
      jest.spyOn(guestRepository, 'findOne').mockResolvedValue(mockGuest as any);
      jest.spyOn(guestRepository, 'remove').mockResolvedValue(mockGuest as any);
      jest.spyOn(guestRepository, 'find').mockResolvedValue([]);
      jest.spyOn(reservationRepository, 'save').mockResolvedValue(mockReservation as any);

      await service.removeGuest('reservation-1', 'guest-1', 'host-1');

      expect(guestRepository.remove).toHaveBeenCalledWith(mockGuest);
    });

    it('should throw NotFoundException if reservation not found', async () => {
      jest.spyOn(reservationRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.removeGuest('reservation-1', 'guest-1', 'host-1')
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not host', async () => {
      jest.spyOn(reservationRepository, 'findOne').mockResolvedValue(mockReservation as any);

      await expect(
        service.removeGuest('reservation-1', 'guest-1', 'other-user')
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('markGuestArrived', () => {
    it('should mark guest as arrived', async () => {
      jest.spyOn(guestRepository, 'findOne').mockResolvedValue(mockGuest as any);
      jest.spyOn(guestRepository, 'save').mockResolvedValue({ ...mockGuest, has_arrived: true } as any);

      const result = await service.markGuestArrived('reservation-1', 'guest-1');

      expect(result.has_arrived).toBe(true);
    });

    it('should throw NotFoundException if guest not found', async () => {
      jest.spyOn(guestRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.markGuestArrived('reservation-1', 'guest-1')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getGuestsByReservation', () => {
    it('should return all guests for a reservation', async () => {
      const mockGuests = [mockGuest, { ...mockGuest, id: 'guest-2' }];
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockGuests),
      };
      jest.spyOn(guestRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      const result = await service.getGuestsByReservation('reservation-1');

      expect(result).toEqual(mockGuests);
      expect(guestRepository.createQueryBuilder).toHaveBeenCalledWith('guest');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('guest.reservation_id = :reservationId', { reservationId: 'reservation-1' });
    });
  });

  describe('getPendingInvites', () => {
    it('should return all pending invites for a user', async () => {
      const mockInvites = [mockGuest];
      jest.spyOn(guestRepository, 'find').mockResolvedValue(mockInvites as any);

      const result = await service.getPendingInvites('user-2');

      expect(result).toEqual(mockInvites);
      expect(guestRepository.find).toHaveBeenCalled();
    });
  });
});

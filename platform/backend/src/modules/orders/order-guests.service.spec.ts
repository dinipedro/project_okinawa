import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { OrderGuestsService } from './order-guests.service';
import { OrderGuest, OrderGuestStatus } from './entities/order-guest.entity';
import { Order } from './entities/order.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { AddOrderGuestDto } from './dto/add-order-guest.dto';

describe('OrderGuestsService', () => {
  let service: OrderGuestsService;
  let orderGuestsRepository: jest.Mocked<Repository<OrderGuest>>;
  let ordersRepository: jest.Mocked<Repository<Order>>;
  let notificationsService: jest.Mocked<NotificationsService>;

  const mockOrderGuestsRepository = {
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
  };

  const mockOrdersRepository = {
    findOne: jest.fn(),
    update: jest.fn(),
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
  };

  const mockNotificationsService = {
    create: jest.fn(),
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
        OrderGuestsService,
        {
          provide: getRepositoryToken(OrderGuest),
          useValue: mockOrderGuestsRepository,
        },
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrdersRepository,
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

    service = module.get<OrderGuestsService>(OrderGuestsService);
    orderGuestsRepository = module.get(getRepositoryToken(OrderGuest));
    ordersRepository = module.get(getRepositoryToken(Order));
    notificationsService = module.get(NotificationsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addGuest', () => {
    const orderId = 'order-123';
    const hostUserId = 'host-user-123';
    const addGuestDto: AddOrderGuestDto = {
      guest_user_id: 'guest-user-456',
      guest_name: 'John Doe',
    };

    it('should add a guest to an order', async () => {
      const mockOrder = {
        id: orderId,
        user_id: hostUserId,
        guests: [],
        is_shared: false,
      } as unknown as Order;

      const mockGuest = {
        id: 'guest-123',
        order_id: orderId,
        guest_user_id: addGuestDto.guest_user_id,
        guest_name: addGuestDto.guest_name,
        is_host: false,
        status: OrderGuestStatus.JOINED,
      } as OrderGuest;

      mockOrdersRepository.findOne.mockResolvedValue(mockOrder);
      mockOrderGuestsRepository.create.mockReturnValue(mockGuest);
      mockOrderGuestsRepository.save.mockResolvedValue(mockGuest);
      mockOrdersRepository.update.mockResolvedValue({} as any);
      mockNotificationsService.create.mockResolvedValue({} as any);

      const result = await service.addGuest(orderId, hostUserId, addGuestDto);

      expect(result).toEqual(mockGuest);
      expect(mockOrderGuestsRepository.save).toHaveBeenCalled();
      expect(mockOrdersRepository.update).toHaveBeenCalledWith(orderId, { is_shared: true });
      expect(mockNotificationsService.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if order not found', async () => {
      mockOrdersRepository.findOne.mockResolvedValue(null);

      await expect(
        service.addGuest(orderId, hostUserId, addGuestDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not host', async () => {
      const mockOrder = {
        id: orderId,
        user_id: 'different-user',
        guests: [],
      } as unknown as Order;

      mockOrdersRepository.findOne.mockResolvedValue(mockOrder);

      await expect(
        service.addGuest(orderId, hostUserId, addGuestDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if guest already exists', async () => {
      const mockOrder = {
        id: orderId,
        user_id: hostUserId,
        guests: [{ guest_user_id: addGuestDto.guest_user_id }],
      } as unknown as Order;

      mockOrdersRepository.findOne.mockResolvedValue(mockOrder);

      await expect(
        service.addGuest(orderId, hostUserId, addGuestDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeGuest', () => {
    const orderId = 'order-123';
    const guestId = 'guest-123';
    const userId = 'host-user-123';

    it('should remove a guest from an order', async () => {
      const mockOrder = {
        id: orderId,
        user_id: userId,
      } as Order;

      const mockGuest = {
        id: guestId,
        order_id: orderId,
      } as OrderGuest;

      mockOrdersRepository.findOne.mockResolvedValue(mockOrder);
      mockOrderGuestsRepository.findOne.mockResolvedValue(mockGuest);
      mockOrderGuestsRepository.remove.mockResolvedValue(mockGuest);

      await service.removeGuest(orderId, guestId, userId);

      expect(mockOrderGuestsRepository.remove).toHaveBeenCalledWith(mockGuest);
    });

    it('should throw NotFoundException if order not found', async () => {
      mockOrdersRepository.findOne.mockResolvedValue(null);

      await expect(
        service.removeGuest(orderId, guestId, userId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not host', async () => {
      const mockOrder = {
        id: orderId,
        user_id: 'different-user',
      } as Order;

      mockOrdersRepository.findOne.mockResolvedValue(mockOrder);

      await expect(
        service.removeGuest(orderId, guestId, userId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if guest not found', async () => {
      const mockOrder = {
        id: orderId,
        user_id: userId,
      } as Order;

      mockOrdersRepository.findOne.mockResolvedValue(mockOrder);
      mockOrderGuestsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.removeGuest(orderId, guestId, userId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getOrderGuests', () => {
    it('should return all guests for an order', async () => {
      const orderId = 'order-123';
      const mockGuests = [
        { id: 'guest-1', order_id: orderId },
        { id: 'guest-2', order_id: orderId },
      ] as OrderGuest[];

      mockOrderGuestsRepository.find.mockResolvedValue(mockGuests);

      const result = await service.getOrderGuests(orderId);

      expect(result).toEqual(mockGuests);
      expect(mockOrderGuestsRepository.find).toHaveBeenCalledWith({
        where: { order_id: orderId },
        relations: ['guest_user'],
        order: { joined_at: 'ASC' },
      });
    });
  });

  describe('leaveOrder', () => {
    const orderId = 'order-123';
    const userId = 'guest-user-123';

    it('should allow guest to leave order', async () => {
      const mockGuest = {
        id: 'guest-123',
        order_id: orderId,
        guest_user_id: userId,
        is_host: false,
        status: OrderGuestStatus.JOINED,
      } as OrderGuest;

      mockOrderGuestsRepository.findOne.mockResolvedValue(mockGuest);
      mockOrderGuestsRepository.save.mockResolvedValue({
        ...mockGuest,
        status: OrderGuestStatus.LEFT,
      });

      await service.leaveOrder(orderId, userId);

      expect(mockOrderGuestsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: OrderGuestStatus.LEFT,
        }),
      );
    });

    it('should throw NotFoundException if guest not found', async () => {
      mockOrderGuestsRepository.findOne.mockResolvedValue(null);

      await expect(service.leaveOrder(orderId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if host tries to leave', async () => {
      const mockGuest = {
        id: 'guest-123',
        order_id: orderId,
        guest_user_id: userId,
        is_host: true,
      } as OrderGuest;

      mockOrderGuestsRepository.findOne.mockResolvedValue(mockGuest);

      await expect(service.leaveOrder(orderId, userId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getOrdersAsGuest', () => {
    it('should return paginated orders where user is a guest', async () => {
      const userId = 'user-123';
      const mockGuests = [
        { id: 'guest-1', guest_user_id: userId },
        { id: 'guest-2', guest_user_id: userId },
      ] as OrderGuest[];

      mockOrderGuestsRepository.findAndCount.mockResolvedValue([mockGuests, 2]);

      const result = await service.getOrdersAsGuest(userId);

      expect(result.data).toEqual(mockGuests);
      expect(result.meta.total).toBe(2);
      expect(mockOrderGuestsRepository.findAndCount).toHaveBeenCalledWith({
        where: { guest_user_id: userId },
        relations: ['order', 'order.restaurant', 'order.items'],
        order: { joined_at: 'DESC' },
        take: 10,
        skip: 0,
      });
    });
  });

  describe('updateGuestPayment', () => {
    const orderId = 'order-123';
    const guestId = 'guest-123';
    const amountPaid = 50;

    it('should allow host to update guest payment', async () => {
      const hostUserId = 'host-123';
      const mockOrder = {
        id: orderId,
        user_id: hostUserId,
      } as Order;

      const mockGuest = {
        id: guestId,
        order_id: orderId,
        guest_user_id: 'guest-user-456',
        amount_due: 100,
        amount_paid: 0,
      } as OrderGuest;

      mockOrdersRepository.findOne.mockResolvedValue(mockOrder);
      mockOrderGuestsRepository.findOne.mockResolvedValue(mockGuest);
      mockOrderGuestsRepository.save.mockResolvedValue({
        ...mockGuest,
        amount_paid: amountPaid,
        status: OrderGuestStatus.PAYMENT_PENDING,
      });

      const result = await service.updateGuestPayment(
        orderId,
        guestId,
        amountPaid,
        hostUserId,
      );

      expect(result.amount_paid).toBe(amountPaid);
    });

    it('should allow guest to update their own payment', async () => {
      const guestUserId = 'guest-user-456';
      const mockOrder = {
        id: orderId,
        user_id: 'different-host',
      } as Order;

      const mockGuest = {
        id: guestId,
        order_id: orderId,
        guest_user_id: guestUserId,
        amount_due: 50,
        amount_paid: 0,
      } as OrderGuest;

      mockOrdersRepository.findOne.mockResolvedValue(mockOrder);
      mockOrderGuestsRepository.findOne.mockResolvedValue(mockGuest);
      mockOrderGuestsRepository.save.mockResolvedValue({
        ...mockGuest,
        amount_paid: 50,
        payment_completed: true,
        status: OrderGuestStatus.PAYMENT_COMPLETED,
      });

      const result = await service.updateGuestPayment(
        orderId,
        guestId,
        50,
        guestUserId,
      );

      expect(result.payment_completed).toBe(true);
    });

    it('should throw ForbiddenException if user is not host or guest', async () => {
      const randomUserId = 'random-user';
      const mockOrder = {
        id: orderId,
        user_id: 'host-123',
      } as Order;

      const mockGuest = {
        id: guestId,
        order_id: orderId,
        guest_user_id: 'guest-user-456',
      } as OrderGuest;

      mockOrdersRepository.findOne.mockResolvedValue(mockOrder);
      mockOrderGuestsRepository.findOne.mockResolvedValue(mockGuest);

      await expect(
        service.updateGuestPayment(orderId, guestId, amountPaid, randomUserId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if order not found', async () => {
      mockOrdersRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateGuestPayment(orderId, guestId, amountPaid, 'user-123'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if guest not found', async () => {
      const mockOrder = {
        id: orderId,
        user_id: 'host-123',
      } as Order;

      mockOrdersRepository.findOne.mockResolvedValue(mockOrder);
      mockOrderGuestsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateGuestPayment(orderId, guestId, amountPaid, 'host-123'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});

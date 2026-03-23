import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentSplitService } from './payment-split.service';
import { PaymentSplit, PaymentSplitMode, PaymentSplitStatus } from './entities/payment-split.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { OrderGuest } from '../orders/entities/order-guest.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PaymentsService } from './payments.service';

describe('PaymentSplitService', () => {
  let service: PaymentSplitService;
  let paymentSplitRepository: Repository<PaymentSplit>;
  let ordersRepository: Repository<Order>;

  const mockOrder = {
    id: 'order-1',
    user_id: 'host-1',
    subtotal: 100,
    items: [
      { id: 'item-1', total_price: 50, ordered_by: 'host-1', quantity: 1, menu_item: { name: 'Pizza' } },
      { id: 'item-2', total_price: 50, ordered_by: 'guest-1', quantity: 1, menu_item: { name: 'Pasta' } },
    ],
    guests: [
      { guest_user_id: 'guest-1', guest_name: 'Guest 1' },
    ],
  };

  const mockSplit = {
    id: 'split-1',
    order_id: 'order-1',
    guest_user_id: 'guest-1',
    split_mode: PaymentSplitMode.INDIVIDUAL,
    amount_due: 55,
    amount_paid: 0,
    service_charge: 5,
    tip_amount: 0,
    status: PaymentSplitStatus.PENDING,
  };

  const mockPaymentSplitRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockOrdersRepository = {
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockOrderItemsRepository = {
    find: jest.fn(),
  };

  const mockOrderGuestsRepository = {
    update: jest.fn(),
  };

  const mockPaymentsService = {
    processPayment: jest.fn().mockResolvedValue({
      transaction_id: 'tx-123',
      status: 'completed',
    }),
    refundPayment: jest.fn(),
    getPaymentStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentSplitService,
        { provide: getRepositoryToken(PaymentSplit), useValue: mockPaymentSplitRepository },
        { provide: getRepositoryToken(Order), useValue: mockOrdersRepository },
        { provide: getRepositoryToken(OrderItem), useValue: mockOrderItemsRepository },
        { provide: getRepositoryToken(OrderGuest), useValue: mockOrderGuestsRepository },
        { provide: PaymentsService, useValue: mockPaymentsService },
      ],
    }).compile();

    service = module.get<PaymentSplitService>(PaymentSplitService);
    paymentSplitRepository = module.get(getRepositoryToken(PaymentSplit));
    ordersRepository = module.get(getRepositoryToken(Order));

    jest.clearAllMocks();
  });

  describe('calculateSplit', () => {
    it('should calculate individual split', async () => {
      mockOrdersRepository.findOne.mockResolvedValue(mockOrder);

      const result = await service.calculateSplit({
        order_id: 'order-1',
        split_mode: PaymentSplitMode.INDIVIDUAL,
      } as any);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should calculate equal split', async () => {
      mockOrdersRepository.findOne.mockResolvedValue(mockOrder);

      const result = await service.calculateSplit({
        order_id: 'order-1',
        split_mode: PaymentSplitMode.SPLIT_EQUAL,
      } as any);

      expect(result).toBeDefined();
      expect(result.length).toBe(2); // host + 1 guest
    });

    it('should calculate selective split', async () => {
      mockOrdersRepository.findOne.mockResolvedValue(mockOrder);

      const result = await service.calculateSplit({
        order_id: 'order-1',
        split_mode: PaymentSplitMode.SPLIT_SELECTIVE,
        selected_items: ['item-1'],
      } as any);

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
    });

    it('should throw NotFoundException if order not found', async () => {
      mockOrdersRepository.findOne.mockResolvedValue(null);

      await expect(
        service.calculateSplit({
          order_id: 'order-1',
          split_mode: PaymentSplitMode.INDIVIDUAL,
        } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for selective mode without items', async () => {
      mockOrdersRepository.findOne.mockResolvedValue(mockOrder);

      await expect(
        service.calculateSplit({
          order_id: 'order-1',
          split_mode: PaymentSplitMode.SPLIT_SELECTIVE,
        } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('createPaymentSplits', () => {
    it('should create payment splits for order', async () => {
      mockOrdersRepository.findOne.mockResolvedValue(mockOrder);
      mockPaymentSplitRepository.create.mockReturnValue(mockSplit);
      mockPaymentSplitRepository.save.mockResolvedValue(mockSplit);
      mockOrdersRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.createPaymentSplits('order-1', PaymentSplitMode.INDIVIDUAL);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(mockOrdersRepository.update).toHaveBeenCalled();
    });
  });

  describe('createPaymentSplit', () => {
    it('should create a single payment split', async () => {
      mockOrdersRepository.findOne.mockResolvedValue(mockOrder);
      mockPaymentSplitRepository.create.mockReturnValue(mockSplit);
      mockPaymentSplitRepository.save.mockResolvedValue(mockSplit);

      const result = await service.createPaymentSplit({
        order_id: 'order-1',
        guest_user_id: 'guest-1',
        split_mode: PaymentSplitMode.INDIVIDUAL,
        amount_due: 55,
      } as any);

      expect(result).toBeDefined();
      expect(mockPaymentSplitRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if order not found', async () => {
      mockOrdersRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createPaymentSplit({
          order_id: 'order-1',
          guest_user_id: 'guest-1',
        } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getOrderSplits', () => {
    it('should return splits for an order', async () => {
      mockPaymentSplitRepository.find.mockResolvedValue([mockSplit]);

      const result = await service.getOrderSplits('order-1');

      expect(result).toEqual([mockSplit]);
    });
  });

  describe('getGuestSplits', () => {
    it('should return splits for a guest', async () => {
      mockPaymentSplitRepository.find.mockResolvedValue([mockSplit]);

      const result = await service.getGuestSplits('guest-1');

      expect(result).toEqual([mockSplit]);
    });
  });

  describe('processSplitPayment', () => {
    it('should process full payment for split', async () => {
      const splitWithOrder = { ...mockSplit, order: mockOrder };
      mockPaymentSplitRepository.findOne.mockResolvedValue(splitWithOrder);
      mockPaymentSplitRepository.save.mockResolvedValue({
        ...splitWithOrder,
        status: PaymentSplitStatus.PAID,
        amount_paid: 55,
      });
      mockOrderGuestsRepository.update.mockResolvedValue({ affected: 1 });
      mockPaymentSplitRepository.find.mockResolvedValue([
        { ...mockSplit, status: PaymentSplitStatus.PAID },
      ]);
      mockOrdersRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.processSplitPayment({
        split_id: 'split-1',
        amount: 55,
      } as any);

      expect(result.status).toBe(PaymentSplitStatus.PAID);
      expect(mockOrderGuestsRepository.update).toHaveBeenCalled();
    });

    it('should process partial payment for split', async () => {
      const splitWithOrder = { ...mockSplit, order: mockOrder };
      mockPaymentSplitRepository.findOne.mockResolvedValue(splitWithOrder);
      mockPaymentSplitRepository.save.mockResolvedValue({
        ...splitWithOrder,
        status: PaymentSplitStatus.PARTIALLY_PAID,
        amount_paid: 25,
      });
      mockOrderGuestsRepository.update.mockResolvedValue({ affected: 1 });
      mockPaymentSplitRepository.find.mockResolvedValue([mockSplit]);

      const result = await service.processSplitPayment({
        split_id: 'split-1',
        amount: 25,
      } as any);

      expect(result.status).toBe(PaymentSplitStatus.PARTIALLY_PAID);
    });

    it('should throw NotFoundException if split not found', async () => {
      mockPaymentSplitRepository.findOne.mockResolvedValue(null);

      await expect(
        service.processSplitPayment({
          split_id: 'split-1',
          amount: 55,
        } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if already paid', async () => {
      mockPaymentSplitRepository.findOne.mockResolvedValue({
        ...mockSplit,
        status: PaymentSplitStatus.PAID,
        order: mockOrder,
      });

      await expect(
        service.processSplitPayment({
          split_id: 'split-1',
          amount: 55,
        } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getPaymentStatus', () => {
    it('should return payment status for order', async () => {
      mockPaymentSplitRepository.find.mockResolvedValue([mockSplit]);
      mockOrdersRepository.findOne.mockResolvedValue(mockOrder);

      const result = await service.getPaymentStatus('order-1');

      expect(result).toBeDefined();
      expect(result.order_id).toBe('order-1');
      expect(result.total_due).toBeDefined();
      expect(result.total_paid).toBeDefined();
      expect(result.splits).toBeDefined();
    });

    it('should throw NotFoundException if order not found', async () => {
      mockPaymentSplitRepository.find.mockResolvedValue([]);
      mockOrdersRepository.findOne.mockResolvedValue(null);

      await expect(service.getPaymentStatus('order-1')).rejects.toThrow(NotFoundException);
    });
  });
});

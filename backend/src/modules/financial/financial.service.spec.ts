import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinancialService } from './financial.service';
import {
  FinancialTransaction,
  TransactionType,
  TransactionCategory,
} from './entities/financial-transaction.entity';
import { EventsGateway } from '@/modules/events/events.gateway';
import { NotFoundException } from '@nestjs/common';

describe('FinancialService', () => {
  let service: FinancialService;
  let transactionRepository: Repository<FinancialTransaction>;
  let eventsGateway: EventsGateway;

  const mockTransaction = {
    id: 'transaction-1',
    restaurant_id: 'restaurant-1',
    type: TransactionType.SALE,
    category: TransactionCategory.FOOD_SALES,
    amount: 100,
    description: 'Sale from order',
    reference_id: 'order-1',
    reference_type: 'order',
    transaction_date: new Date(),
    metadata: {},
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getManyAndCount: jest.fn(),
  };

  const mockTransactionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  };

  const mockEventsGateway = {
    notifyRestaurant: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinancialService,
        {
          provide: getRepositoryToken(FinancialTransaction),
          useValue: mockTransactionRepository,
        },
        {
          provide: EventsGateway,
          useValue: mockEventsGateway,
        },
      ],
    }).compile();

    service = module.get<FinancialService>(FinancialService);
    transactionRepository = module.get(getRepositoryToken(FinancialTransaction));
    eventsGateway = module.get(EventsGateway);

    jest.clearAllMocks();
  });

  describe('createTransaction', () => {
    it('should create a transaction and notify restaurant', async () => {
      const createDto = {
        restaurant_id: 'restaurant-1',
        type: TransactionType.SALE,
        category: TransactionCategory.FOOD_SALES,
        amount: 100,
        description: 'Test sale',
        metadata: {},
      };

      mockTransactionRepository.create.mockReturnValue(mockTransaction);
      mockTransactionRepository.save.mockResolvedValue(mockTransaction);

      const result = await service.createTransaction(createDto as any);

      expect(result).toBeDefined();
      expect(mockTransactionRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockTransactionRepository.save).toHaveBeenCalled();
      expect(mockEventsGateway.notifyRestaurant).toHaveBeenCalledWith(
        'restaurant-1',
        expect.objectContaining({
          type: 'financial:transaction_created',
          transaction_id: mockTransaction.id,
        }),
      );
    });
  });

  describe('recordSale', () => {
    it('should record a sale transaction', async () => {
      mockTransactionRepository.create.mockReturnValue(mockTransaction);
      mockTransactionRepository.save.mockResolvedValue(mockTransaction);

      const result = await service.recordSale('restaurant-1', 'order-1', 100);

      expect(result).toBeDefined();
      expect(mockTransactionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          restaurant_id: 'restaurant-1',
          type: TransactionType.SALE,
          amount: 100,
          reference_id: 'order-1',
        }),
      );
    });

    it('should use custom category if provided', async () => {
      mockTransactionRepository.create.mockReturnValue(mockTransaction);
      mockTransactionRepository.save.mockResolvedValue(mockTransaction);

      await service.recordSale(
        'restaurant-1',
        'order-1',
        100,
        TransactionCategory.BEVERAGE_SALES,
      );

      expect(mockTransactionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          category: TransactionCategory.BEVERAGE_SALES,
        }),
      );
    });
  });

  describe('recordTip', () => {
    it('should record a tip transaction', async () => {
      mockTransactionRepository.create.mockReturnValue(mockTransaction);
      mockTransactionRepository.save.mockResolvedValue(mockTransaction);

      const result = await service.recordTip('restaurant-1', 'tip-1', 50);

      expect(result).toBeDefined();
      expect(mockTransactionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: TransactionType.TIP,
          category: TransactionCategory.TIP_INCOME,
          amount: 50,
        }),
      );
    });
  });

  describe('recordExpense', () => {
    it('should record an expense transaction', async () => {
      mockTransactionRepository.create.mockReturnValue(mockTransaction);
      mockTransactionRepository.save.mockResolvedValue(mockTransaction);

      const result = await service.recordExpense(
        'restaurant-1',
        TransactionCategory.SUPPLIES,
        200,
        'Food supplies',
        { vendor: 'Supplier Inc' },
      );

      expect(result).toBeDefined();
      expect(mockTransactionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: TransactionType.EXPENSE,
          category: TransactionCategory.SUPPLIES,
          amount: 200,
          description: 'Food supplies',
        }),
      );
    });
  });

  describe('getSummary', () => {
    it('should return financial summary', async () => {
      const transactions = [
        { ...mockTransaction, type: TransactionType.SALE, amount: 100 },
        { ...mockTransaction, type: TransactionType.TIP, amount: 20 },
        { ...mockTransaction, type: TransactionType.EXPENSE, amount: 50 },
        { ...mockTransaction, type: TransactionType.REFUND, amount: 10 },
      ];

      mockQueryBuilder.getMany.mockResolvedValue(transactions);

      const queryDto = {
        start_date: '2024-01-01',
        end_date: '2024-12-31',
      };

      const result = await service.getSummary('restaurant-1', queryDto as any);

      expect(result.summary.sales).toBe(100);
      expect(result.summary.tips).toBe(20);
      expect(result.summary.expenses).toBe(50);
      expect(result.summary.refunds).toBe(10);
      expect(result.summary.total_revenue).toBe(120);
      expect(result.summary.total_costs).toBe(60);
      expect(result.summary.net_profit).toBe(60);
      expect(result.summary.profit_margin).toBeCloseTo(50, 1); // 60/120 * 100 = 50%
    });

    it('should filter by type', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([mockTransaction]);

      const queryDto = {
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        type: TransactionType.SALE,
      };

      await service.getSummary('restaurant-1', queryDto as any);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('transaction.type = :type', {
        type: TransactionType.SALE,
      });
    });

    it('should filter by category', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([mockTransaction]);

      const queryDto = {
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        category: TransactionCategory.FOOD_SALES,
      };

      await service.getSummary('restaurant-1', queryDto as any);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'transaction.category = :category',
        { category: TransactionCategory.FOOD_SALES },
      );
    });
  });

  describe('getTransactions', () => {
    it('should return paginated transactions', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockTransaction], 1]);

      const queryDto = {
        start_date: '2024-01-01',
        end_date: '2024-12-31',
      };

      const result = await service.getTransactions('restaurant-1', queryDto as any, 50, 0);

      expect(result.transactions).toEqual([mockTransaction]);
      expect(result.total).toBe(1);
      expect(result.limit).toBe(50);
      expect(result.offset).toBe(0);
    });
  });

  describe('getDailySummary', () => {
    it('should return daily summary', async () => {
      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-01-02');

      const transactions = [
        { ...mockTransaction, transaction_date: date1, type: TransactionType.SALE, amount: 100 },
        { ...mockTransaction, transaction_date: date1, type: TransactionType.EXPENSE, amount: 30 },
        { ...mockTransaction, transaction_date: date2, type: TransactionType.SALE, amount: 200 },
      ];

      mockTransactionRepository.find.mockResolvedValue(transactions);

      const result = await service.getDailySummary(
        'restaurant-1',
        new Date('2024-01-01'),
        new Date('2024-01-31'),
      );

      expect(result).toHaveLength(2);
      expect(result[0].total_sales).toBe(100);
      expect(result[0].total_expenses).toBe(30);
      expect(result[0].net_profit).toBe(70);
      expect(result[1].total_sales).toBe(200);
      expect(result[1].net_profit).toBe(200);
    });
  });

  describe('getRevenueByCategory', () => {
    it('should return revenue grouped by category', async () => {
      const transactions = [
        { ...mockTransaction, category: TransactionCategory.FOOD_SALES, amount: 100 },
        { ...mockTransaction, category: TransactionCategory.FOOD_SALES, amount: 50 },
        { ...mockTransaction, category: TransactionCategory.BEVERAGE_SALES, amount: 30 },
      ];

      mockTransactionRepository.find.mockResolvedValue(transactions);

      const result = await service.getRevenueByCategory(
        'restaurant-1',
        new Date('2024-01-01'),
        new Date('2024-12-31'),
      );

      expect(result).toHaveLength(2);
      const foodSales = result.find(r => r.category === TransactionCategory.FOOD_SALES);
      expect(foodSales?.total).toBe(150);
      expect(foodSales?.count).toBe(2);
    });
  });

  describe('getExpensesByCategory', () => {
    it('should return expenses grouped by category', async () => {
      const transactions = [
        { ...mockTransaction, type: TransactionType.EXPENSE, category: TransactionCategory.SUPPLIES, amount: 100 },
        { ...mockTransaction, type: TransactionType.EXPENSE, category: TransactionCategory.SUPPLIES, amount: 50 },
        { ...mockTransaction, type: TransactionType.EXPENSE, category: TransactionCategory.UTILITIES, amount: 30 },
      ];

      mockTransactionRepository.find.mockResolvedValue(transactions);

      const result = await service.getExpensesByCategory(
        'restaurant-1',
        new Date('2024-01-01'),
        new Date('2024-12-31'),
      );

      expect(result).toHaveLength(2);
      const supplies = result.find(r => r.category === TransactionCategory.SUPPLIES);
      expect(supplies?.total).toBe(150);
      expect(supplies?.count).toBe(2);
    });
  });

  describe('getProfitLossStatement', () => {
    it('should return profit and loss statement', async () => {
      const revenue = [
        { category: TransactionCategory.FOOD_SALES, total: 500, count: 10 },
        { category: TransactionCategory.BEVERAGE_SALES, total: 200, count: 5 },
      ];

      const expenses = [
        { category: TransactionCategory.SUPPLIES, total: 300, count: 5 },
        { category: TransactionCategory.UTILITIES, total: 100, count: 2 },
      ];

      jest.spyOn(service, 'getRevenueByCategory').mockResolvedValue(revenue);
      jest.spyOn(service, 'getExpensesByCategory').mockResolvedValue(expenses);

      const result = await service.getProfitLossStatement(
        'restaurant-1',
        new Date('2024-01-01'),
        new Date('2024-12-31'),
      );

      expect(result.revenue.total).toBe(700);
      expect(result.expenses.total).toBe(400);
      expect(result.net_profit).toBe(300);
      expect(result.profit_margin).toBeCloseTo(42.86, 1); // 300/700 * 100
    });
  });

  describe('getCashFlow', () => {
    it('should return cash flow report', async () => {
      const transactions = [
        { ...mockTransaction, type: TransactionType.SALE, amount: 100, transaction_date: new Date('2024-01-01') },
        { ...mockTransaction, type: TransactionType.EXPENSE, amount: 30, transaction_date: new Date('2024-01-02') },
        { ...mockTransaction, type: TransactionType.TIP, amount: 20, transaction_date: new Date('2024-01-03') },
        { ...mockTransaction, type: TransactionType.REFUND, amount: 10, transaction_date: new Date('2024-01-04') },
      ];

      mockTransactionRepository.find.mockResolvedValue(transactions);

      const result = await service.getCashFlow(
        'restaurant-1',
        new Date('2024-01-01'),
        new Date('2024-12-31'),
      );

      expect(result.summary.total_inflow).toBe(120);
      expect(result.summary.total_outflow).toBe(40);
      expect(result.summary.net_cash_flow).toBe(80);
      expect(result.summary.ending_balance).toBe(80);
      expect(result.items).toHaveLength(4);
      expect(result.items[0].running_balance).toBe(100);
      expect(result.items[1].running_balance).toBe(70);
      expect(result.items[2].running_balance).toBe(90);
      expect(result.items[3].running_balance).toBe(80);
    });
  });

  describe('updateTransaction', () => {
    it('should update transaction description', async () => {
      mockTransactionRepository.findOne.mockResolvedValue(mockTransaction);
      mockTransactionRepository.save.mockResolvedValue({
        ...mockTransaction,
        description: 'Updated description',
      });

      const result = await service.updateTransaction('transaction-1', {
        description: 'Updated description',
      } as any);

      expect(result.description).toBe('Updated description');
    });

    it('should update reference_id', async () => {
      mockTransactionRepository.findOne.mockResolvedValue(mockTransaction);
      mockTransactionRepository.save.mockResolvedValue({
        ...mockTransaction,
        reference_id: 'new-ref-id',
      });

      const result = await service.updateTransaction('transaction-1', {
        reference_id: 'new-ref-id',
      } as any);

      expect(result.reference_id).toBe('new-ref-id');
    });

    it('should store status in metadata', async () => {
      mockTransactionRepository.findOne.mockResolvedValue(mockTransaction);
      mockTransactionRepository.save.mockResolvedValue({
        ...mockTransaction,
        metadata: { status: 'pending' },
      });

      const result = await service.updateTransaction('transaction-1', {
        status: 'pending',
      } as any);

      expect(result.metadata).toEqual({ status: 'pending' });
    });

    it('should store notes in metadata', async () => {
      mockTransactionRepository.findOne.mockResolvedValue(mockTransaction);
      mockTransactionRepository.save.mockResolvedValue({
        ...mockTransaction,
        metadata: { notes: 'Test note' },
      });

      const result = await service.updateTransaction('transaction-1', {
        notes: 'Test note',
      } as any);

      expect(result.metadata).toEqual({ notes: 'Test note' });
    });

    it('should throw NotFoundException if transaction not found', async () => {
      mockTransactionRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateTransaction('transaction-1', { description: 'Test' } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });
});

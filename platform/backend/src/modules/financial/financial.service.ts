import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import {
  FinancialTransaction,
  TransactionType,
  TransactionCategory,
  ReferenceType,
} from './entities/financial-transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { FinancialReportQueryDto } from './dto/financial-report-query.dto';
import { EventsGateway } from '@/modules/events/events.gateway';

export interface DailySummary {
  date: string;
  total_sales: number;
  total_expenses: number;
  net_profit: number;
  transaction_count: number;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  count: number;
}

@Injectable()
export class FinancialService {
  private readonly logger = new Logger(FinancialService.name);

  constructor(
    @InjectRepository(FinancialTransaction)
    private transactionRepository: Repository<FinancialTransaction>,
    private eventsGateway: EventsGateway,
  ) {}

  /**
   * Create a financial transaction
   */
  async createTransaction(createTransactionDto: CreateTransactionDto) {
    const transaction = this.transactionRepository.create(createTransactionDto);
    const savedTransaction =
      await this.transactionRepository.save(transaction);

    // Notify restaurant about financial activity
    this.eventsGateway.notifyRestaurant(
      createTransactionDto.restaurant_id,
      {
        type: 'financial:transaction_created',
        transaction_id: savedTransaction.id,
        transaction_type: savedTransaction.type,
        amount: savedTransaction.amount,
        category: savedTransaction.category,
      },
    );

    return savedTransaction;
  }

  /**
   * Record sale transaction from order (called by Orders/Payments module)
   */
  async recordSale(
    restaurantId: string,
    orderId: string,
    amount: number,
    category: TransactionCategory = TransactionCategory.FOOD_SALES,
  ) {
    return this.createTransaction({
      restaurant_id: restaurantId,
      type: TransactionType.SALE,
      category: category,
      amount: amount,
      description: `Sale from order`,
      reference_id: orderId,
      reference_type: ReferenceType.ORDER,
      metadata: {},
    });
  }

  /**
   * Record tip transaction
   */
  async recordTip(restaurantId: string, tipId: string, amount: number) {
    return this.createTransaction({
      restaurant_id: restaurantId,
      type: TransactionType.TIP,
      category: TransactionCategory.TIP_INCOME,
      amount: amount,
      description: `Tip received`,
      reference_id: tipId,
      reference_type: ReferenceType.TIP,
      metadata: {},
    });
  }

  /**
   * Record expense transaction
   */
  async recordExpense(
    restaurantId: string,
    category: TransactionCategory,
    amount: number,
    description: string,
    metadata?: Record<string, any>,
  ) {
    return this.createTransaction({
      restaurant_id: restaurantId,
      type: TransactionType.EXPENSE,
      category: category,
      amount: amount,
      description: description,
      metadata: metadata,
    });
  }

  /**
   * Get financial summary for a date range
   */
  async getSummary(
    restaurantId: string,
    queryDto: FinancialReportQueryDto,
  ) {
    try {
      // Validate date inputs
      const startDate = new Date(queryDto.start_date);
      const endDate = new Date(queryDto.end_date);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new BadRequestException('Invalid date format');
      }

      if (startDate > endDate) {
        throw new BadRequestException('Start date cannot be after end date');
      }

      // Limit date range to prevent performance issues (max 1 year)
      const maxRangeMs = 365 * 24 * 60 * 60 * 1000;
      if (endDate.getTime() - startDate.getTime() > maxRangeMs) {
        throw new BadRequestException('Date range cannot exceed 1 year');
      }

      const queryBuilder = this.transactionRepository
        .createQueryBuilder('transaction')
        .where('transaction.restaurant_id = :restaurantId', { restaurantId })
        .andWhere('transaction.transaction_date BETWEEN :startDate AND :endDate', {
          startDate,
          endDate,
        });

      if (queryDto.type) {
        queryBuilder.andWhere('transaction.type = :type', { type: queryDto.type });
      }

      if (queryDto.category) {
        queryBuilder.andWhere('transaction.category = :category', {
          category: queryDto.category,
        });
      }

      const transactions = await queryBuilder.getMany();

      // Calculate totals by type
      const salesTotal = transactions
        .filter((t) => t.type === TransactionType.SALE)
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const tipsTotal = transactions
        .filter((t) => t.type === TransactionType.TIP)
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const expensesTotal = transactions
        .filter((t) => t.type === TransactionType.EXPENSE)
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const refundsTotal = transactions
        .filter((t) => t.type === TransactionType.REFUND)
        .reduce((sum, t) => sum + Number(t.amount), 0);

      // Calculate net profit
      const totalRevenue = salesTotal + tipsTotal;
      const totalCosts = expensesTotal + refundsTotal;
      const netProfit = totalRevenue - totalCosts;

      // Category breakdown
      const categoryBreakdown = this.calculateCategoryBreakdown(transactions);

      return {
        period: {
          start_date: startDate,
          end_date: endDate,
        },
        summary: {
          total_revenue: totalRevenue,
          sales: salesTotal,
          tips: tipsTotal,
          total_costs: totalCosts,
          expenses: expensesTotal,
          refunds: refundsTotal,
          net_profit: netProfit,
          profit_margin:
            totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0,
          transaction_count: transactions.length,
        },
        category_breakdown: categoryBreakdown,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      const err = error as Error;
      this.logger.error(`Failed to get financial summary: ${err.message}`, err.stack);
      throw new InternalServerErrorException('Failed to retrieve financial summary');
    }
  }

  /**
   * Get detailed transactions list
   */
  async getTransactions(
    restaurantId: string,
    queryDto: FinancialReportQueryDto,
    limit: number = 50,
    offset: number = 0,
  ) {
    const startDate = new Date(queryDto.start_date);
    const endDate = new Date(queryDto.end_date);

    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.restaurant_id = :restaurantId', { restaurantId })
      .andWhere('transaction.transaction_date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });

    if (queryDto.type) {
      queryBuilder.andWhere('transaction.type = :type', { type: queryDto.type });
    }

    if (queryDto.category) {
      queryBuilder.andWhere('transaction.category = :category', {
        category: queryDto.category,
      });
    }

    const [transactions, total] = await queryBuilder
      .orderBy('transaction.transaction_date', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return {
      transactions,
      total,
      limit,
      offset,
    };
  }

  /**
   * Get daily summary for a date range
   */
  async getDailySummary(
    restaurantId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<DailySummary[]> {
    const transactions = await this.transactionRepository.find({
      where: {
        restaurant_id: restaurantId,
        transaction_date: Between(startDate, endDate),
      },
      order: { transaction_date: 'ASC' },
    });

    // Group by date
    const dailyMap = new Map<string, DailySummary>();

    for (const transaction of transactions) {
      const dateKey = transaction.transaction_date.toISOString().split('T')[0];

      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, {
          date: dateKey,
          total_sales: 0,
          total_expenses: 0,
          net_profit: 0,
          transaction_count: 0,
        });
      }

      const daily = dailyMap.get(dateKey)!;
      daily.transaction_count++;

      const amount = Number(transaction.amount);

      if (
        transaction.type === TransactionType.SALE ||
        transaction.type === TransactionType.TIP
      ) {
        daily.total_sales += amount;
        daily.net_profit += amount;
      } else if (
        transaction.type === TransactionType.EXPENSE ||
        transaction.type === TransactionType.REFUND
      ) {
        daily.total_expenses += amount;
        daily.net_profit -= amount;
      }
    }

    return Array.from(dailyMap.values());
  }

  /**
   * Get revenue by category
   */
  async getRevenueByCategory(
    restaurantId: string,
    startDate: Date,
    endDate: Date,
  ) {
    const transactions = await this.transactionRepository.find({
      where: {
        restaurant_id: restaurantId,
        transaction_date: Between(startDate, endDate),
        type: In([TransactionType.SALE, TransactionType.TIP]),
      },
    });

    const categoryTotals = transactions.reduce(
      (acc, transaction) => {
        const category = transaction.category;
        if (!acc[category]) {
          acc[category] = {
            category: category,
            total: 0,
            count: 0,
          };
        }
        acc[category].total += Number(transaction.amount);
        acc[category].count += 1;
        return acc;
      },
      {} as Record<string, any>,
    );

    return Object.values(categoryTotals);
  }

  /**
   * Get expenses by category
   */
  async getExpensesByCategory(
    restaurantId: string,
    startDate: Date,
    endDate: Date,
  ) {
    const transactions = await this.transactionRepository.find({
      where: {
        restaurant_id: restaurantId,
        transaction_date: Between(startDate, endDate),
        type: TransactionType.EXPENSE,
      },
    });

    const categoryTotals = transactions.reduce(
      (acc, transaction) => {
        const category = transaction.category;
        if (!acc[category]) {
          acc[category] = {
            category: category,
            total: 0,
            count: 0,
          };
        }
        acc[category].total += Number(transaction.amount);
        acc[category].count += 1;
        return acc;
      },
      {} as Record<string, any>,
    );

    return Object.values(categoryTotals);
  }

  /**
   * Get profit/loss statement
   */
  async getProfitLossStatement(
    restaurantId: string,
    startDate: Date,
    endDate: Date,
  ) {
    const revenue = await this.getRevenueByCategory(
      restaurantId,
      startDate,
      endDate,
    );
    const expenses = await this.getExpensesByCategory(
      restaurantId,
      startDate,
      endDate,
    );

    const totalRevenue = revenue.reduce((sum, r) => sum + r.total, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.total, 0);
    const netProfit = totalRevenue - totalExpenses;

    return {
      period: {
        start_date: startDate,
        end_date: endDate,
      },
      revenue: {
        by_category: revenue,
        total: totalRevenue,
      },
      expenses: {
        by_category: expenses,
        total: totalExpenses,
      },
      net_profit: netProfit,
      profit_margin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0,
    };
  }

  /**
   * Get cash flow report
   */
  async getCashFlow(restaurantId: string, startDate: Date, endDate: Date) {
    const transactions = await this.transactionRepository.find({
      where: {
        restaurant_id: restaurantId,
        transaction_date: Between(startDate, endDate),
      },
      order: { transaction_date: 'ASC' },
    });

    let runningBalance = 0;
    const cashFlowItems = transactions.map((transaction) => {
      const amount = Number(transaction.amount);
      const isInflow =
        transaction.type === TransactionType.SALE ||
        transaction.type === TransactionType.TIP;

      runningBalance += isInflow ? amount : -amount;

      return {
        date: transaction.transaction_date,
        type: transaction.type,
        category: transaction.category,
        amount: amount,
        is_inflow: isInflow,
        running_balance: runningBalance,
        description: transaction.description,
      };
    });

    const totalInflow = transactions
      .filter(
        (t) =>
          t.type === TransactionType.SALE || t.type === TransactionType.TIP,
      )
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalOutflow = transactions
      .filter(
        (t) =>
          t.type === TransactionType.EXPENSE ||
          t.type === TransactionType.REFUND,
      )
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      period: {
        start_date: startDate,
        end_date: endDate,
      },
      summary: {
        total_inflow: totalInflow,
        total_outflow: totalOutflow,
        net_cash_flow: totalInflow - totalOutflow,
        ending_balance: runningBalance,
      },
      items: cashFlowItems,
    };
  }

  /**
   * Export financial report in various formats.
   * Generates report data suitable for CSV, Excel, or PDF export.
   * 
   * @param restaurantId - Restaurant identifier
   * @param startDate - Report start date
   * @param endDate - Report end date
   * @param format - Export format (pdf, csv, excel)
   * @param reportType - Type of report (summary, detailed, transactions)
   * @returns Formatted report data or download URL
   */
  async exportReport(
    restaurantId: string,
    startDate: Date,
    endDate: Date,
    format: 'pdf' | 'csv' | 'excel',
    reportType: 'summary' | 'detailed' | 'transactions',
  ) {
    // Get base data based on report type
    let reportData: any;

    switch (reportType) {
      case 'summary':
        reportData = await this.getSummary(restaurantId, {
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        });
        break;
      case 'detailed':
        const profitLoss = await this.getProfitLossStatement(restaurantId, startDate, endDate);
        const cashFlow = await this.getCashFlow(restaurantId, startDate, endDate);
        reportData = { profit_loss: profitLoss, cash_flow: cashFlow };
        break;
      case 'transactions':
        const transactionsData = await this.getTransactions(
          restaurantId,
          { start_date: startDate.toISOString(), end_date: endDate.toISOString() },
          1000, // Max transactions for export
          0,
        );
        reportData = transactionsData;
        break;
    }

    // Format data based on export format
    if (format === 'csv') {
      return this.formatAsCSV(reportData, reportType);
    } else if (format === 'excel') {
      return this.formatAsExcel(reportData, reportType);
    } else {
      // PDF format - return structured data for PDF generation
      return {
        format: 'pdf',
        report_type: reportType,
        generated_at: new Date().toISOString(),
        period: { start_date: startDate, end_date: endDate },
        data: reportData,
      };
    }
  }

  /**
   * Format report data as CSV string.
   */
  private formatAsCSV(data: any, reportType: string): string {
    if (reportType === 'transactions' && data.transactions) {
      const headers = ['Date', 'Type', 'Category', 'Amount', 'Description'];
      const rows = data.transactions.map((t: any) => [
        new Date(t.transaction_date).toISOString().split('T')[0],
        t.type,
        t.category,
        t.amount,
        t.description || '',
      ]);
      return [headers.join(','), ...rows.map((r: string[]) => r.join(','))].join('\n');
    }

    // Summary format
    if (data.summary) {
      return Object.entries(data.summary)
        .map(([key, value]) => `${key},${value}`)
        .join('\n');
    }

    return JSON.stringify(data);
  }

  /**
   * Format report data for Excel export.
   * Returns structured data that can be processed by Excel libraries.
   */
  private formatAsExcel(data: any, reportType: string): any {
    return {
      format: 'excel',
      sheets: [
        {
          name: reportType === 'transactions' ? 'Transactions' : 'Summary',
          data: reportType === 'transactions' ? data.transactions : [data.summary],
        },
      ],
    };
  }

  /**
   * Update financial transaction.
   * Note: Transaction amounts are immutable, only status, description, and metadata can be updated.
   */
  async updateTransaction(id: string, updateTransactionDto: UpdateTransactionDto) {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (updateTransactionDto.description !== undefined) {
      transaction.description = updateTransactionDto.description;
    }

    if (updateTransactionDto.reference_id !== undefined) {
      transaction.reference_id = updateTransactionDto.reference_id;
    }

    // Store status and notes in metadata since FinancialTransaction entity may not have these fields
    if (updateTransactionDto.status !== undefined || updateTransactionDto.notes !== undefined) {
      transaction.metadata = {
        ...transaction.metadata,
        ...(updateTransactionDto.status && { status: updateTransactionDto.status }),
        ...(updateTransactionDto.notes && { notes: updateTransactionDto.notes }),
      };
    }

    return this.transactionRepository.save(transaction);
  }

  // ========== Private Helper Methods ==========

  /**
   * Calculate category breakdown
   */
  private calculateCategoryBreakdown(
    transactions: FinancialTransaction[],
  ): CategoryBreakdown[] {
    const total = transactions.reduce(
      (sum, t) => sum + Number(t.amount),
      0,
    );

    const categoryMap = transactions.reduce(
      (acc, transaction) => {
        const category = transaction.category;
        if (!acc[category]) {
          acc[category] = {
            category: category,
            amount: 0,
            percentage: 0,
            count: 0,
          };
        }
        acc[category].amount += Number(transaction.amount);
        acc[category].count += 1;
        return acc;
      },
      {} as Record<string, CategoryBreakdown>,
    );

    // Calculate percentages
    Object.values(categoryMap).forEach((item) => {
      item.percentage = total > 0 ? (item.amount / total) * 100 : 0;
    });

    return Object.values(categoryMap).sort((a, b) => b.amount - a.amount);
  }
}

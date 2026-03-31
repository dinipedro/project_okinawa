import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, Between } from 'typeorm';
import { Bill, BillCategory } from '../entities/bill.entity';
import { CreateBillDto } from '../dto/create-bill.dto';
import { UpdateBillDto } from '../dto/update-bill.dto';

@Injectable()
export class AccountsPayableService {
  constructor(
    @InjectRepository(Bill)
    private readonly billRepo: Repository<Bill>,
  ) {}

  // ────────── CRUD ──────────

  async create(dto: CreateBillDto): Promise<Bill> {
    const bill = this.billRepo.create({
      ...dto,
      due_date: new Date(dto.due_date),
    } as any);
    const saved = await this.billRepo.save(bill);
    return saved as unknown as Bill;
  }

  async findAll(
    restaurantId: string,
    status?: string,
    category?: string,
  ): Promise<Bill[]> {
    const where: Record<string, any> = { restaurant_id: restaurantId };
    if (status) where.status = status;
    if (category) where.category = category;

    return this.billRepo.find({
      where,
      order: { due_date: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Bill> {
    const bill = await this.billRepo.findOne({ where: { id } });
    if (!bill) throw new NotFoundException(`Bill ${id} not found`);
    return bill;
  }

  async update(id: string, dto: UpdateBillDto): Promise<Bill> {
    const bill = await this.findOne(id);
    const updateData: Partial<Bill> = { ...dto } as any;
    if (dto.due_date) updateData.due_date = new Date(dto.due_date);
    Object.assign(bill, updateData);
    return this.billRepo.save(bill);
  }

  async remove(id: string): Promise<void> {
    const bill = await this.findOne(id);
    await this.billRepo.remove(bill);
  }

  // ────────── Mark as Paid ──────────

  async markPaid(id: string): Promise<Bill> {
    const bill = await this.findOne(id);
    bill.status = 'paid';
    bill.paid_date = new Date();
    return this.billRepo.save(bill);
  }

  // ────────── Queries for Forecast ──────────

  /**
   * Returns all overdue bills (due_date < today and status = pending).
   */
  async getOverdue(restaurantId: string): Promise<Bill[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.billRepo.find({
      where: {
        restaurant_id: restaurantId,
        status: 'pending',
        due_date: LessThanOrEqual(today),
      },
      order: { due_date: 'ASC' },
    });
  }

  /**
   * Returns upcoming bills within next N days (pending status).
   */
  async getUpcoming(restaurantId: string, days: number = 30): Promise<Bill[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + days);

    return this.billRepo.find({
      where: {
        restaurant_id: restaurantId,
        status: 'pending',
        due_date: Between(today, futureDate),
      },
      order: { due_date: 'ASC' },
    });
  }

  /**
   * Returns total amount grouped by category for a given period.
   */
  async getTotalByCategory(
    restaurantId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Array<{ category: BillCategory; total: number }>> {
    const result = await this.billRepo
      .createQueryBuilder('bill')
      .select('bill.category', 'category')
      .addSelect('SUM(bill.amount)', 'total')
      .where('bill.restaurant_id = :restaurantId', { restaurantId })
      .andWhere('bill.due_date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .andWhere('bill.status != :cancelled', { cancelled: 'cancelled' })
      .groupBy('bill.category')
      .getRawMany();

    return result.map((r) => ({
      category: r.category as BillCategory,
      total: parseFloat(r.total),
    }));
  }

  /**
   * Returns all recurring pending bills for a restaurant.
   * Used by the forecast service to project recurring expenses.
   */
  async getRecurring(restaurantId: string): Promise<Bill[]> {
    return this.billRepo.find({
      where: {
        restaurant_id: restaurantId,
        is_recurring: true,
        status: 'pending',
      },
      order: { due_date: 'ASC' },
    });
  }
}

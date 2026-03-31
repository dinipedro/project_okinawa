import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  Logger,
  Inject,
  Optional,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CashRegisterSession } from '../entities/cash-register-session.entity';
import { CashRegisterMovement, MovementType } from '../entities/cash-register-movement.entity';
import { PaginationDto, PaginatedResponseDto, toPaginationDto } from '@/common/dto/pagination.dto';
import { TipsService } from '@/modules/tips/tips.service';

@Injectable()
export class CashRegisterService {
  private readonly logger = new Logger(CashRegisterService.name);

  constructor(
    @InjectRepository(CashRegisterSession)
    private readonly sessionRepo: Repository<CashRegisterSession>,

    @InjectRepository(CashRegisterMovement)
    private readonly movementRepo: Repository<CashRegisterMovement>,

    @Optional()
    @Inject(forwardRef(() => TipsService))
    private readonly tipsService?: TipsService,
  ) {}

  /**
   * Open a new cash register session.
   * Only one session can be open per restaurant at a time.
   */
  async openRegister(
    restaurantId: string,
    openedBy: string,
    openingBalance: number,
  ): Promise<CashRegisterSession> {
    // Check for existing open session
    const existing = await this.sessionRepo.findOne({
      where: { restaurant_id: restaurantId, status: 'open' },
    });

    if (existing) {
      throw new ConflictException(
        'There is already an open cash register session for this restaurant',
      );
    }

    const session = this.sessionRepo.create({
      restaurant_id: restaurantId,
      opened_by: openedBy,
      opening_balance: openingBalance,
      status: 'open',
    });

    return this.sessionRepo.save(session);
  }

  /**
   * Get the current open session for a restaurant.
   */
  async getCurrentSession(restaurantId: string): Promise<CashRegisterSession | null> {
    const session = await this.sessionRepo.findOne({
      where: { restaurant_id: restaurantId, status: 'open' },
      relations: ['movements'],
      order: { opened_at: 'DESC' },
    });

    return session || null;
  }

  /**
   * Add a movement to an open cash register session.
   */
  async addMovement(
    sessionId: string,
    type: MovementType,
    amount: number,
    isCash: boolean,
    createdBy: string,
    orderId?: string,
    description?: string,
  ): Promise<CashRegisterMovement> {
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Cash register session not found');
    }

    if (session.status !== 'open') {
      throw new BadRequestException('Cannot add movements to a closed session');
    }

    const movement = this.movementRepo.create({
      session_id: sessionId,
      type,
      amount,
      is_cash: isCash,
      order_id: orderId || undefined,
      created_by: createdBy,
      description: description || undefined,
    } as any);

    const saved = await this.movementRepo.save(movement);
    return saved as unknown as CashRegisterMovement;
  }

  /**
   * Close a cash register session.
   * Calculates expected balance from opening + SUM(is_cash movements).
   * Records difference between actual and expected.
   */
  async closeRegister(
    sessionId: string,
    closedBy: string,
    actualBalance: number,
    notes?: string,
  ): Promise<CashRegisterSession> {
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId },
      relations: ['movements'],
    });

    if (!session) {
      throw new NotFoundException('Cash register session not found');
    }

    if (session.status !== 'open') {
      throw new BadRequestException('This session is already closed');
    }

    // Calculate expected balance: opening + SUM(cash movements)
    const cashMovementsTotal = session.movements
      .filter((m) => m.is_cash)
      .reduce((sum, m) => sum + Number(m.amount), 0);

    const expectedBalance = Number(session.opening_balance) + cashMovementsTotal;
    const difference = actualBalance - expectedBalance;

    session.closed_by = closedBy;
    session.expected_balance = expectedBalance;
    session.actual_balance = actualBalance;
    session.difference = difference;
    session.status = 'closed';
    session.closed_at = new Date();
    session.closing_notes = (notes || undefined) as any;

    const savedSession = await this.sessionRepo.save(session);

    // GAP-3: Auto-distribute pending tips on register close
    if (this.tipsService) {
      try {
        await this.tipsService.autoDistributeOnClose(
          session.restaurant_id,
          session.opened_at,
          session.closed_at,
        );
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Unknown error';
        this.logger.warn(
          `Tip auto-distribution failed for session ${sessionId}: ${error}`,
        );
      }
    }

    return savedSession;
  }

  /**
   * Get history of past sessions for a restaurant (paginated).
   */
  async getHistory(
    restaurantId: string,
    pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<CashRegisterSession>> {
    const dto = toPaginationDto(pagination);

    const [items, total] = await this.sessionRepo.findAndCount({
      where: { restaurant_id: restaurantId },
      order: { opened_at: 'DESC' },
      skip: dto.offset,
      take: dto.limit,
    });

    return new PaginatedResponseDto(items, total, dto.page!, dto.limit!);
  }

  /**
   * Get a detailed report for a specific session.
   * Includes breakdown by payment method.
   */
  async getSessionReport(sessionId: string): Promise<{
    session: CashRegisterSession;
    breakdown: Record<string, { count: number; total: number }>;
    totals: {
      cash_in: number;
      cash_out: number;
      non_cash: number;
      total_sales: number;
    };
  }> {
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId },
      relations: ['movements'],
    });

    if (!session) {
      throw new NotFoundException('Cash register session not found');
    }

    // Build breakdown by movement type
    const breakdown: Record<string, { count: number; total: number }> = {};
    let cashIn = 0;
    let cashOut = 0;
    let nonCash = 0;
    let totalSales = 0;

    for (const movement of session.movements) {
      const type = movement.type;
      if (!breakdown[type]) {
        breakdown[type] = { count: 0, total: 0 };
      }
      breakdown[type].count += 1;
      breakdown[type].total += Number(movement.amount);

      const amount = Number(movement.amount);

      if (movement.is_cash) {
        if (amount >= 0) {
          cashIn += amount;
        } else {
          cashOut += Math.abs(amount);
        }
      } else {
        nonCash += amount;
      }

      // Count sales (positive amounts for sale_ types)
      if (type.startsWith('sale_') && amount > 0) {
        totalSales += amount;
      }
    }

    return {
      session,
      breakdown,
      totals: {
        cash_in: cashIn,
        cash_out: cashOut,
        non_cash: nonCash,
        total_sales: totalSales,
      },
    };
  }
}

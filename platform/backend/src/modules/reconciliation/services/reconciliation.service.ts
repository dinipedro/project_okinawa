import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { DeliverySettlement } from '../entities/delivery-settlement.entity';

/**
 * ReconciliationService -- manages delivery platform settlement reconciliation.
 *
 * Tracks expected vs actual settlements from delivery platforms (iFood, Rappi, UberEats).
 * Flags discrepancies when received amounts differ from expected amounts.
 *
 * Commission rates (configurable per platform):
 * - iFood:    23% default
 * - Rappi:    20% default
 * - UberEats: 25% default
 */

interface CreateSettlementInput {
  restaurantId: string;
  platform: string;
  settlementDate: Date;
  grossAmount: number;
  commissionRate: number;
  orderCount: number;
}

interface ReconcileInput {
  settlementId: string;
  actualReceived: number;
}

interface OverviewResult {
  platform: string;
  totalGross: number;
  totalExpectedNet: number;
  totalReceived: number;
  totalDifference: number;
  pendingCount: number;
  reconciledCount: number;
  discrepancyCount: number;
}

/** Threshold for flagging discrepancies (R$ 0.50) */
const DISCREPANCY_THRESHOLD = 0.5;

/** Default commission rates by platform */
const DEFAULT_COMMISSION_RATES: Record<string, number> = {
  ifood: 0.23,
  rappi: 0.20,
  uber_eats: 0.25,
};

@Injectable()
export class ReconciliationService {
  private readonly logger = new Logger(ReconciliationService.name);

  constructor(
    @InjectRepository(DeliverySettlement)
    private readonly settlementRepo: Repository<DeliverySettlement>,
  ) {}

  /**
   * Create a new settlement record (called on delivery order payment).
   */
  async createSettlement(input: CreateSettlementInput): Promise<DeliverySettlement> {
    const commissionRate =
      input.commissionRate || DEFAULT_COMMISSION_RATES[input.platform] || 0.20;
    const commissionAmount = Number((input.grossAmount * commissionRate).toFixed(2));
    const expectedNet = Number((input.grossAmount - commissionAmount).toFixed(2));

    const settlement = this.settlementRepo.create({
      restaurant_id: input.restaurantId,
      platform: input.platform,
      settlement_date: input.settlementDate,
      gross_amount: input.grossAmount,
      commission_amount: commissionAmount,
      expected_net: expectedNet,
      status: 'pending',
      order_count: input.orderCount,
    });

    const saved = await this.settlementRepo.save(settlement);
    this.logger.log(
      `Settlement created | Restaurant: ${input.restaurantId} | ` +
        `Platform: ${input.platform} | Gross: R$ ${input.grossAmount} | ` +
        `Expected Net: R$ ${expectedNet}`,
    );

    return saved;
  }

  /**
   * Reconcile a settlement: compare expected vs actual received amount.
   */
  async reconcile(input: ReconcileInput): Promise<DeliverySettlement> {
    const settlement = await this.settlementRepo.findOne({
      where: { id: input.settlementId },
    });
    if (!settlement) {
      throw new NotFoundException('Settlement not found');
    }

    settlement.actual_received = input.actualReceived;
    settlement.difference = Number(
      (input.actualReceived - Number(settlement.expected_net)).toFixed(2),
    );

    if (Math.abs(settlement.difference) <= DISCREPANCY_THRESHOLD) {
      settlement.status = 'reconciled';
    } else {
      settlement.status = 'discrepancy';
    }

    const saved = await this.settlementRepo.save(settlement);
    this.logger.log(
      `Settlement reconciled | ID: ${settlement.id} | ` +
        `Expected: R$ ${settlement.expected_net} | Actual: R$ ${input.actualReceived} | ` +
        `Difference: R$ ${settlement.difference} | Status: ${settlement.status}`,
    );

    return saved;
  }

  /**
   * Get reconciliation overview per platform for a restaurant.
   */
  async getOverview(
    restaurantId: string,
    periodDays: number = 30,
  ): Promise<OverviewResult[]> {
    const since = new Date();
    since.setDate(since.getDate() - periodDays);

    const settlements = await this.settlementRepo.find({
      where: {
        restaurant_id: restaurantId,
        settlement_date: MoreThanOrEqual(since),
      },
      order: { settlement_date: 'DESC' },
    });

    // Group by platform
    const grouped = new Map<string, DeliverySettlement[]>();
    for (const s of settlements) {
      const list = grouped.get(s.platform) || [];
      list.push(s);
      grouped.set(s.platform, list);
    }

    const results: OverviewResult[] = [];
    for (const [platform, items] of grouped) {
      results.push({
        platform,
        totalGross: items.reduce((sum, s) => sum + Number(s.gross_amount), 0),
        totalExpectedNet: items.reduce(
          (sum, s) => sum + Number(s.expected_net),
          0,
        ),
        totalReceived: items.reduce(
          (sum, s) => sum + Number(s.actual_received || 0),
          0,
        ),
        totalDifference: items.reduce(
          (sum, s) => sum + Number(s.difference || 0),
          0,
        ),
        pendingCount: items.filter((s) => s.status === 'pending').length,
        reconciledCount: items.filter((s) => s.status === 'reconciled').length,
        discrepancyCount: items.filter((s) => s.status === 'discrepancy').length,
      });
    }

    return results;
  }

  /**
   * List all settlements for a restaurant, optionally filtered by platform.
   */
  async listSettlements(
    restaurantId: string,
    platform?: string,
    periodDays: number = 30,
  ): Promise<DeliverySettlement[]> {
    const since = new Date();
    since.setDate(since.getDate() - periodDays);

    const where: any = {
      restaurant_id: restaurantId,
      settlement_date: MoreThanOrEqual(since),
    };
    if (platform) {
      where.platform = platform;
    }

    return this.settlementRepo.find({
      where,
      order: { settlement_date: 'DESC' },
    });
  }
}

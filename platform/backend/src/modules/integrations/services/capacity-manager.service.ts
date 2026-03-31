import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Order } from '@/modules/orders/entities/order.entity';
import { PlatformConnection } from '../entities/platform-connection.entity';
import { OrderStatus } from '@/common/enums';

export interface CapacityEvaluation {
  action: 'accept' | 'accept_with_delay' | 'reject';
  delay_minutes?: number;
  reason?: string;
}

/**
 * CapacityManagerService
 *
 * Evaluates the current order load for a restaurant to determine whether
 * incoming delivery platform orders should be accepted, delayed, or rejected.
 *
 * Thresholds are configured per-restaurant via PlatformConnection:
 * - active < high_load_threshold: ACCEPT immediately
 * - active >= high_load_threshold AND < max_concurrent: ACCEPT WITH DELAY (10 min)
 * - active >= max_concurrent: REJECT
 */
@Injectable()
export class CapacityManagerService {
  private readonly logger = new Logger(CapacityManagerService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(PlatformConnection)
    private readonly connectionRepository: Repository<PlatformConnection>,
  ) {}

  /**
   * Evaluates current capacity for a restaurant.
   *
   * @param restaurantId - The restaurant UUID
   * @returns CapacityEvaluation with action, optional delay, and reason
   */
  async evaluateCapacity(restaurantId: string): Promise<CapacityEvaluation> {
    // Count active orders (CONFIRMED + PREPARING) for this restaurant
    const activeOrderCount = await this.orderRepository.count({
      where: {
        restaurant_id: restaurantId,
        status: In([OrderStatus.CONFIRMED, OrderStatus.PREPARING]),
      },
    });

    // Load the connection to get capacity thresholds.
    // Use the first active connection's thresholds (they should be consistent).
    const connection = await this.connectionRepository.findOne({
      where: { restaurant_id: restaurantId, is_active: true },
    });

    // Default thresholds if no connection found
    const maxConcurrent = connection?.max_concurrent_orders ?? 30;
    const highLoadThreshold = connection?.high_load_threshold ?? 20;

    this.logger.log(
      `Capacity evaluation for restaurant=${restaurantId}: ` +
        `active=${activeOrderCount}, threshold=${highLoadThreshold}, max=${maxConcurrent}`,
    );

    if (activeOrderCount >= maxConcurrent) {
      return {
        action: 'reject',
        reason: `Restaurant at maximum capacity (${activeOrderCount}/${maxConcurrent} active orders)`,
      };
    }

    if (activeOrderCount >= highLoadThreshold) {
      return {
        action: 'accept_with_delay',
        delay_minutes: 10,
        reason: `High load — ${activeOrderCount}/${maxConcurrent} active orders, adding 10-minute delay`,
      };
    }

    return {
      action: 'accept',
    };
  }
}

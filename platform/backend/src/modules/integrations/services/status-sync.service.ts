import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '@/modules/orders/entities/order.entity';
import { PlatformConnection } from '../entities/platform-connection.entity';
import { PlatformAdapter, PlatformName } from '../interfaces/platform-adapter.interface';
import { IFoodAdapter } from '../platforms/ifood/ifood.adapter';
import { RappiAdapter } from '../platforms/rappi/rappi.adapter';
import { UberEatsAdapter } from '../platforms/ubereats/ubereats.adapter';
import { INTEGRATION_MESSAGES } from '../i18n/integrations.i18n';

/**
 * StatusSyncService
 *
 * Syncs internal order status changes back to the originating delivery platform.
 * Only fires for orders where source != 'noowe' (i.e., external platform orders).
 *
 * Implements retry logic with exponential backoff (3 attempts).
 * Called from OrdersService when an order status changes.
 */
@Injectable()
export class StatusSyncService {
  private readonly logger = new Logger(StatusSyncService.name);
  private readonly adapters: Map<PlatformName, PlatformAdapter>;

  private static readonly MAX_RETRIES = 3;
  private static readonly BASE_DELAY_MS = 1000; // 1 second

  constructor(
    @InjectRepository(PlatformConnection)
    private readonly connectionRepository: Repository<PlatformConnection>,
    private readonly ifoodAdapter: IFoodAdapter,
    private readonly rappiAdapter: RappiAdapter,
    private readonly uberEatsAdapter: UberEatsAdapter,
  ) {
    this.adapters = new Map<PlatformName, PlatformAdapter>([
      ['ifood', this.ifoodAdapter],
      ['rappi', this.rappiAdapter],
      ['ubereats', this.uberEatsAdapter],
    ]);
  }

  /**
   * Syncs the order status back to the originating platform.
   * Only processes orders that came from an external platform (source != 'noowe').
   *
   * @param order - The order with the updated status
   */
  async syncOrderStatus(order: Order): Promise<void> {
    // Only sync external platform orders
    if (!order.source || order.source === 'noowe') {
      return;
    }

    const platform = order.source as PlatformName;
    const adapter = this.adapters.get(platform);
    if (!adapter) {
      this.logger.warn(
        `${INTEGRATION_MESSAGES.PLATFORM_NOT_FOUND}: No adapter for platform "${platform}" ` +
          `| order=${order.id}`,
      );
      return;
    }

    // Find the platform connection for this restaurant
    const connection = await this.connectionRepository.findOne({
      where: {
        restaurant_id: order.restaurant_id,
        platform,
        is_active: true,
      },
    });

    if (!connection) {
      this.logger.warn(
        `${INTEGRATION_MESSAGES.CONNECTION_NOT_FOUND}: No active connection for ` +
          `platform="${platform}" restaurant=${order.restaurant_id} | order=${order.id}`,
      );
      return;
    }

    // Retry with exponential backoff
    for (let attempt = 1; attempt <= StatusSyncService.MAX_RETRIES; attempt++) {
      try {
        await adapter.syncStatus(connection, order.source_order_id, order.status);

        this.logger.log(
          `Status synced to ${platform}: order=${order.id} ` +
            `externalId=${order.source_order_id} status=${order.status} ` +
            `| attempt=${attempt}`,
        );
        return;
      } catch (error) {
        const err = error as Error;
        this.logger.error(
          `${INTEGRATION_MESSAGES.SYNC_FAILED}: Failed to sync status to ${platform} ` +
            `| order=${order.id} | attempt=${attempt}/${StatusSyncService.MAX_RETRIES} ` +
            `| error=${err.message}`,
          err.stack,
        );

        if (attempt < StatusSyncService.MAX_RETRIES) {
          const delay = StatusSyncService.BASE_DELAY_MS * Math.pow(2, attempt - 1);
          await this.sleep(delay);
        }
      }
    }

    this.logger.error(
      `${INTEGRATION_MESSAGES.SYNC_FAILED}: All ${StatusSyncService.MAX_RETRIES} attempts failed ` +
        `for ${platform} | order=${order.id} | externalId=${order.source_order_id} ` +
        `| status=${order.status}`,
    );
  }

  /**
   * Helper to sleep for a given number of milliseconds.
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

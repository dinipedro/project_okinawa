import {
  Controller,
  Post,
  Param,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Public } from '@/common/decorators/public.decorator';
import { PlatformAdapter, PlatformName } from '../interfaces/platform-adapter.interface';
import { PlatformConnection } from '../entities/platform-connection.entity';
import { OrderNormalizerService } from '../services/order-normalizer.service';
import { CapacityManagerService } from '../services/capacity-manager.service';
import { IFoodAdapter } from '../platforms/ifood/ifood.adapter';
import { RappiAdapter } from '../platforms/rappi/rappi.adapter';
import { UberEatsAdapter } from '../platforms/ubereats/ubereats.adapter';
import { INTEGRATION_MESSAGES } from '../i18n/integrations.i18n';

/**
 * Webhook Controller for Delivery Platform Integrations
 *
 * Receives order and status webhooks from iFood, Rappi, and UberEats.
 * Endpoints are @Public() — no JWT required. Validation is done via
 * platform-specific webhook signature verification.
 */
@ApiTags('integrations')
@Controller('integrations/webhooks')
export class IntegrationWebhookController {
  private readonly logger = new Logger(IntegrationWebhookController.name);
  private readonly adapters: Map<PlatformName, PlatformAdapter>;

  constructor(
    @InjectRepository(PlatformConnection)
    private readonly connectionRepository: Repository<PlatformConnection>,
    private readonly orderNormalizerService: OrderNormalizerService,
    private readonly capacityManagerService: CapacityManagerService,
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
   * POST /integrations/webhooks/:platform/orders
   *
   * Receives a new order webhook from a delivery platform.
   * Flow:
   * 1. Identify adapter by platform param
   * 2. Validate webhook signature via adapter
   * 3. Find PlatformConnection for the restaurant
   * 4. Find menu mappings
   * 5. Normalize order via adapter
   * 6. Check capacity via CapacityManagerService
   * 7. Accept or reject based on capacity
   * 8. Confirm/reject on platform via adapter
   */
  @Post(':platform/orders')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Receive order webhook from delivery platform' })
  @ApiParam({ name: 'platform', enum: ['ifood', 'rappi', 'ubereats'] })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid webhook or platform' })
  async handleOrderWebhook(
    @Param('platform') platform: string,
    @Headers() headers: Record<string, string>,
    @Body() body: any,
  ): Promise<{ status: string; order_id?: string; message?: string }> {
    // 1. Identify adapter by platform param
    const adapter = this.adapters.get(platform as PlatformName);
    if (!adapter) {
      this.logger.warn(`${INTEGRATION_MESSAGES.PLATFORM_NOT_FOUND}: ${platform}`);
      throw new BadRequestException(INTEGRATION_MESSAGES.PLATFORM_NOT_FOUND);
    }

    // 2. Validate webhook signature via adapter
    if (!adapter.validateWebhook(headers, body)) {
      this.logger.warn(
        `${INTEGRATION_MESSAGES.WEBHOOK_INVALID}: Invalid webhook signature for ${platform}`,
      );
      throw new BadRequestException(INTEGRATION_MESSAGES.WEBHOOK_INVALID);
    }

    // 3. Find PlatformConnection for the restaurant
    // The restaurant identifier comes from the platform-specific payload
    const normalizedOrder = adapter.normalizeOrder(body, []);
    const externalRestaurantId = normalizedOrder.restaurant_id;

    const connection = await this.connectionRepository.findOne({
      where: {
        platform,
        is_active: true,
      },
    });

    if (!connection) {
      this.logger.warn(
        `${INTEGRATION_MESSAGES.CONNECTION_NOT_FOUND}: No active connection for ` +
          `platform=${platform} externalRestaurantId=${externalRestaurantId}`,
      );
      throw new NotFoundException(INTEGRATION_MESSAGES.CONNECTION_NOT_FOUND);
    }

    const restaurantId = connection.restaurant_id;

    // 4. Find menu mappings and re-normalize with mappings
    const mappings = await this.orderNormalizerService.getMappings(
      restaurantId,
      platform,
    );
    const fullNormalizedOrder = adapter.normalizeOrder(body, mappings);

    this.logger.log(
      `Received ${platform} order webhook: externalOrderId=${fullNormalizedOrder.source_order_id} ` +
        `| restaurant=${restaurantId} | items=${fullNormalizedOrder.items.length}`,
    );

    // 6. Check capacity via CapacityManagerService
    const capacityResult =
      await this.capacityManagerService.evaluateCapacity(restaurantId);

    // 7. Handle based on capacity evaluation
    if (capacityResult.action === 'reject') {
      // Reject on platform
      this.logger.warn(
        `${INTEGRATION_MESSAGES.CAPACITY_EXCEEDED}: Rejecting ${platform} order ` +
          `${fullNormalizedOrder.source_order_id} | ${capacityResult.reason}`,
      );

      try {
        await adapter.rejectOrder(
          connection,
          fullNormalizedOrder.source_order_id,
          capacityResult.reason || INTEGRATION_MESSAGES.CAPACITY_EXCEEDED,
        );
      } catch (error) {
        const err = error as Error;
        this.logger.error(
          `Failed to reject order on ${platform}: ${err.message}`,
          err.stack,
        );
      }

      return {
        status: 'rejected',
        message: INTEGRATION_MESSAGES.ORDER_REJECTED,
      };
    }

    // 8. Accept: create internal order
    try {
      const order = await this.orderNormalizerService.createOrderFromNormalized(
        fullNormalizedOrder,
        restaurantId,
      );

      // If high load, set extended preparation time
      if (
        capacityResult.action === 'accept_with_delay' &&
        capacityResult.delay_minutes
      ) {
        try {
          await adapter.setPreparationTime(
            connection,
            fullNormalizedOrder.source_order_id,
            capacityResult.delay_minutes,
          );
        } catch (error) {
          const err = error as Error;
          this.logger.warn(
            `Failed to set preparation time on ${platform}: ${err.message}`,
          );
        }
      }

      // Confirm order on platform
      try {
        await adapter.confirmOrder(
          connection,
          fullNormalizedOrder.source_order_id,
        );
      } catch (error) {
        const err = error as Error;
        this.logger.error(
          `Failed to confirm order on ${platform}: ${err.message}`,
          err.stack,
        );
      }

      this.logger.log(
        `${INTEGRATION_MESSAGES.ORDER_ACCEPTED}: ${platform} order ` +
          `${fullNormalizedOrder.source_order_id} → internal order ${order.id} ` +
          `| action=${capacityResult.action}`,
      );

      return {
        status: 'accepted',
        order_id: order.id,
        message: INTEGRATION_MESSAGES.ORDER_ACCEPTED,
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Failed to create internal order from ${platform}: ${err.message}`,
        err.stack,
      );

      // Try to reject on platform since we failed internally
      try {
        await adapter.rejectOrder(
          connection,
          fullNormalizedOrder.source_order_id,
          'Internal error processing order',
        );
      } catch (rejectError) {
        const rErr = rejectError as Error;
        this.logger.error(
          `Failed to reject order on ${platform} after internal error: ${rErr.message}`,
        );
      }

      return {
        status: 'error',
        message: 'Failed to process order',
      };
    }
  }

  /**
   * POST /integrations/webhooks/:platform/status
   *
   * Receives status update webhooks from delivery platforms.
   * Useful for tracking rider ETA, delivery completion, etc.
   */
  @Post(':platform/status')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Receive status webhook from delivery platform' })
  @ApiParam({ name: 'platform', enum: ['ifood', 'rappi', 'ubereats'] })
  @ApiResponse({ status: 200, description: 'Status webhook processed' })
  @ApiResponse({ status: 400, description: 'Invalid webhook or platform' })
  async handleStatusWebhook(
    @Param('platform') platform: string,
    @Headers() headers: Record<string, string>,
    @Body() body: any,
  ): Promise<{ status: string }> {
    const adapter = this.adapters.get(platform as PlatformName);
    if (!adapter) {
      this.logger.warn(`${INTEGRATION_MESSAGES.PLATFORM_NOT_FOUND}: ${platform}`);
      throw new BadRequestException(INTEGRATION_MESSAGES.PLATFORM_NOT_FOUND);
    }

    if (!adapter.validateWebhook(headers, body)) {
      this.logger.warn(
        `${INTEGRATION_MESSAGES.WEBHOOK_INVALID}: Invalid status webhook signature for ${platform}`,
      );
      throw new BadRequestException(INTEGRATION_MESSAGES.WEBHOOK_INVALID);
    }

    this.logger.log(
      `Received ${platform} status webhook: ${JSON.stringify(body).substring(0, 200)}...`,
    );

    // TODO: Process platform status updates (rider ETA, delivery confirmed, etc.)
    // This would update the order's delivery_rider_eta, metadata, etc.

    return { status: 'ok' };
  }
}

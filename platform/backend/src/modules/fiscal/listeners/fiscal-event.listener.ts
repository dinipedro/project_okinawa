import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FiscalEmissionService } from '../services/fiscal-emission.service';
import { FiscalConfig } from '../entities/fiscal-config.entity';

/**
 * FiscalEventListener — Connects payment events to automatic NFC-e emission.
 *
 * Listens for 'order.payment.confirmed' and emits NFC-e if the restaurant
 * has fiscal config active with auto_emit=true.
 *
 * Non-blocking: if emission fails, the payment is already confirmed.
 * The FiscalEmissionService.emitForOrder() already has all the logic.
 */
@Injectable()
export class FiscalEventListener {
  private readonly logger = new Logger(FiscalEventListener.name);

  constructor(
    private readonly fiscalEmissionService: FiscalEmissionService,
    @InjectRepository(FiscalConfig)
    private readonly fiscalConfigRepo: Repository<FiscalConfig>,
  ) {}

  @OnEvent('order.payment.confirmed', { async: true })
  async handlePaymentConfirmed(payload: {
    orderId: string;
    restaurantId: string;
  }): Promise<void> {
    try {
      // Check if restaurant has fiscal config with auto_emit enabled
      const config = await this.fiscalConfigRepo.findOne({
        where: { restaurant_id: payload.restaurantId },
      });

      if (!config) {
        this.logger.debug(
          `No fiscal config for restaurant ${payload.restaurantId} — skipping NFC-e`,
        );
        return;
      }

      if (!config.is_active || !config.auto_emit) {
        this.logger.debug(
          `Fiscal disabled or auto_emit=false for restaurant ${payload.restaurantId}`,
        );
        return;
      }

      if (config.fiscal_provider === 'none') {
        this.logger.debug(
          `Fiscal provider is 'none' for restaurant ${payload.restaurantId}`,
        );
        return;
      }

      // Emit NFC-e using existing service (has all the logic)
      const result = await this.fiscalEmissionService.emitForOrder(payload.orderId);

      this.logger.log(
        `NFC-e emitted for order ${payload.orderId.slice(0, 8)}: ` +
          `status=${result?.status || 'unknown'}`,
      );
    } catch (err) {
      const error = err as Error;
      this.logger.error(
        `NFC-e emission failed for order ${payload.orderId}: ${error.message}`,
        error.stack,
      );
      // Emit failure event for monitoring/alerting
    }
  }
}

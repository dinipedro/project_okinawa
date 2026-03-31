import { Injectable, Logger } from '@nestjs/common';
import { FinancialTransactionService } from '../financial-transaction.service';
import { TransactionCategory } from '../entities/financial-transaction.entity';
import { CashRegisterService } from '@/modules/cash-register/services/cash-register.service';
import { MovementType } from '@/modules/cash-register/entities/cash-register-movement.entity';

/**
 * FinancialEventListenerService — bridges domain events to financial actions.
 *
 * Since @nestjs/event-emitter is not yet installed, this service is called
 * directly by other services (brain-router, payment-webhook) instead of
 * reacting to emitted events. When EventEmitter2 is added, each method
 * becomes an @OnEvent handler.
 */
@Injectable()
export class FinancialEventListenerService {
  private readonly logger = new Logger(FinancialEventListenerService.name);

  constructor(
    private readonly financialTransactionService: FinancialTransactionService,
    private readonly cashRegisterService: CashRegisterService,
  ) {}

  /**
   * When payment is confirmed → create FinancialTransaction(SALE) + CashRegisterMovement.
   */
  async onPaymentConfirmed(
    orderId: string,
    amount: number,
    paymentMethod: string,
    restaurantId: string,
  ): Promise<void> {
    try {
      // 1. Record financial transaction (SALE)
      await this.financialTransactionService.recordSale(
        restaurantId,
        orderId,
        amount,
        TransactionCategory.FOOD_SALES,
      );

      // 2. Add cash register movement if there is an open session
      const session = await this.cashRegisterService.getCurrentSession(restaurantId);
      if (session) {
        const movementType = this.mapPaymentMethodToMovementType(paymentMethod);
        const isCash = paymentMethod === 'cash';

        await this.cashRegisterService.addMovement(
          session.id,
          movementType,
          amount,
          isCash,
          'system', // created_by (system-triggered)
          orderId,
          `Payment confirmed for order ${orderId.slice(0, 8)}`,
        );
      }

      this.logger.log(
        `Payment confirmed processed | orderId=${orderId} | amount=${amount} | method=${paymentMethod}`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to process payment confirmed event | orderId=${orderId}: ${message}`,
      );
    }
  }

  /**
   * When order item is marked ready (from KDS Brain bump) → record COGS.
   */
  async onItemReady(
    orderItemId: string,
    restaurantId: string,
  ): Promise<void> {
    try {
      // Log for COGS tracking — actual COGS calculation happens in CostControlModule
      this.logger.log(
        `Item ready event received | orderItemId=${orderItemId} | restaurantId=${restaurantId}`,
      );

      // Record as metadata in financial transaction for cost tracking
      await this.financialTransactionService.recordExpense(
        restaurantId,
        TransactionCategory.SUPPLIES,
        0, // Actual COGS to be calculated by CostControlModule
        `COGS trigger for item ${orderItemId.slice(0, 8)}`,
        { type: 'cogs_trigger', order_item_id: orderItemId, status: 'pending_calculation' },
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to process item ready event | orderItemId=${orderItemId}: ${message}`,
      );
    }
  }

  /**
   * When menu item marked unavailable (86) → log for forecast adjustment.
   */
  async onItemUnavailable(
    menuItemId: string,
    restaurantId: string,
  ): Promise<void> {
    try {
      this.logger.log(
        `Item 86 event received | menuItemId=${menuItemId} | restaurantId=${restaurantId}`,
      );

      // Log the unavailability event as metadata for forecast adjustment
      await this.financialTransactionService.recordExpense(
        restaurantId,
        TransactionCategory.OTHER,
        0,
        `Item 86 — menu item ${menuItemId.slice(0, 8)} marked unavailable`,
        {
          type: 'item_86',
          menu_item_id: menuItemId,
          unavailable_at: new Date().toISOString(),
        },
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to process item unavailable event | menuItemId=${menuItemId}: ${message}`,
      );
    }
  }

  // ─── Private helpers ────────────────────────────────────────

  private mapPaymentMethodToMovementType(paymentMethod: string): MovementType {
    const map: Record<string, MovementType> = {
      cash: 'sale_cash',
      credit_card: 'sale_card',
      debit_card: 'sale_card',
      pix: 'sale_pix',
      tap_to_pay: 'sale_tap',
      wallet: 'sale_wallet',
    };
    return map[paymentMethod] || 'sale_card';
  }
}

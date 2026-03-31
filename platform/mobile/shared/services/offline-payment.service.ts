/**
 * GAP Sprint 3: Offline Payment Service
 * Queues cash payments when offline and syncs them when back online.
 * Uses idempotency keys to prevent duplicate payments.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { offlineStorage } from '../utils/offline-storage';

const OFFLINE_PAYMENTS_KEY = '@okinawa_offline_payments';

interface OfflineCashPayment {
  id: string;
  orderId: string;
  amount: number;
  restaurantId: string;
  idempotency_key: string;
  offline_payment: boolean;
  timestamp: number;
  synced: boolean;
}

class OfflinePaymentService {
  /**
   * Queue a cash payment when offline.
   * Stores in AsyncStorage with an idempotency key.
   */
  async queueCashPayment(order: {
    orderId: string;
    amount: number;
    restaurantId: string;
  }): Promise<string> {
    const payments = await this.getQueuedPayments();

    const idempotencyKey = `cash_${order.orderId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const payment: OfflineCashPayment = {
      id: `offpay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      orderId: order.orderId,
      amount: order.amount,
      restaurantId: order.restaurantId,
      idempotency_key: idempotencyKey,
      offline_payment: true,
      timestamp: Date.now(),
      synced: false,
    };

    payments.push(payment);
    await this.savePayments(payments);

    // Also queue order metadata update via sync queue
    await offlineStorage.addToSyncQueue({
      type: 'UPDATE',
      endpoint: `/orders/${order.orderId}/metadata`,
      method: 'PATCH',
      payload: {
        offline_payment: true,
        offline_payment_id: payment.id,
        idempotency_key: idempotencyKey,
        contingency: true,
      },
    });

    return payment.id;
  }

  /**
   * Process queued payments when back online.
   * Calls the payment API for each pending payment.
   * Uses idempotency_key to prevent duplicates.
   */
  async syncQueuedPayments(): Promise<{
    synced: number;
    failed: number;
    errors: string[];
  }> {
    const payments = await this.getQueuedPayments();
    const pending = payments.filter((p) => !p.synced);

    if (pending.length === 0) {
      return { synced: 0, failed: 0, errors: [] };
    }

    let synced = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const payment of pending) {
      try {
        // Dynamic import to avoid circular dependency
        const api = require('./api').default;

        await api.request({
          method: 'POST',
          url: '/payments/process',
          data: {
            order_id: payment.orderId,
            amount: payment.amount,
            payment_method: 'cash',
            idempotency_key: payment.idempotency_key,
            metadata: {
              offline_payment: true,
              original_timestamp: payment.timestamp,
              contingency: true,
            },
          },
          headers: {
            'Idempotency-Key': payment.idempotency_key,
          },
        });

        payment.synced = true;
        synced++;
      } catch (error: any) {
        // If 409 conflict (duplicate), consider synced
        if (error?.response?.status === 409) {
          payment.synced = true;
          synced++;
        } else {
          failed++;
          errors.push(
            `Payment ${payment.id}: ${error?.message || 'Unknown error'}`,
          );
        }
      }
    }

    await this.savePayments(payments);

    // Clean up synced payments older than 24h
    await this.cleanupSyncedPayments();

    return { synced, failed, errors };
  }

  /**
   * Get count of pending offline payments
   */
  async getPendingCount(): Promise<number> {
    const payments = await this.getQueuedPayments();
    return payments.filter((p) => !p.synced).length;
  }

  /**
   * Get all queued payments
   */
  async getQueuedPayments(): Promise<OfflineCashPayment[]> {
    try {
      const raw = await AsyncStorage.getItem(OFFLINE_PAYMENTS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  /**
   * Save payments to storage
   */
  private async savePayments(
    payments: OfflineCashPayment[],
  ): Promise<void> {
    try {
      await AsyncStorage.setItem(
        OFFLINE_PAYMENTS_KEY,
        JSON.stringify(payments),
      );
    } catch (error) {
      console.error('[OfflinePayment] Failed to save payments:', error);
    }
  }

  /**
   * Remove synced payments older than 24h
   */
  private async cleanupSyncedPayments(): Promise<void> {
    const payments = await this.getQueuedPayments();
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    const filtered = payments.filter(
      (p) => !p.synced || p.timestamp > cutoff,
    );

    if (filtered.length !== payments.length) {
      await this.savePayments(filtered);
    }
  }
}

// Singleton
export const offlinePaymentService = new OfflinePaymentService();

// Export types
export type { OfflineCashPayment };

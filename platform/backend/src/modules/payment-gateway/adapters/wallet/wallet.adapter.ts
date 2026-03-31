import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  GatewayAdapter,
  ProcessPaymentParams,
  PaymentResult,
  RefundResult,
  PaymentStatus,
} from '../../interfaces/gateway-adapter.interface';
import { GatewayTransaction } from '../../entities/gateway-transaction.entity';
import { Wallet } from '@/modules/payments/entities/wallet.entity';
import { WalletTransaction } from '@/modules/payments/entities/wallet-transaction.entity';
import { TransactionType, WalletType } from '@common/enums';

/**
 * Wallet Adapter — wraps existing wallet logic in payments.service.ts.
 *
 * Provides a GatewayAdapter-compliant interface for wallet payments.
 * Deducts balance from the user's wallet and creates a WalletTransaction,
 * while also logging a GatewayTransaction for unified audit trail.
 *
 * No external API calls — this is an internal adapter.
 */
@Injectable()
export class WalletAdapter implements GatewayAdapter {
  readonly provider = 'wallet' as const;
  private readonly logger = new Logger(WalletAdapter.name);

  constructor(
    @InjectRepository(GatewayTransaction)
    private readonly gatewayTxRepository: Repository<GatewayTransaction>,
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(WalletTransaction)
    private readonly walletTxRepository: Repository<WalletTransaction>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Process wallet payment.
   * Deducts from user wallet and creates both WalletTransaction and GatewayTransaction.
   */
  async processPayment(params: ProcessPaymentParams): Promise<PaymentResult> {
    // Check idempotency
    const existingTx = await this.gatewayTxRepository.findOne({
      where: { idempotency_key: params.idempotency_key },
    });
    if (existingTx) {
      this.logger.warn(
        `Duplicate wallet payment detected: idempotency_key=${params.idempotency_key}`,
      );
      return {
        success: existingTx.status === 'completed',
        transaction_id: existingTx.id,
        external_id: existingTx.external_id || '',
        status: existingTx.status as 'completed' | 'pending' | 'failed',
      };
    }

    const correlationId = `wallet_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

    // Create GatewayTransaction record
    const gatewayTx = this.gatewayTxRepository.create({
      restaurant_id: params.restaurant_id,
      order_id: params.order_id,
      provider: 'wallet',
      payment_method: 'wallet',
      amount_cents: params.amount,
      status: 'pending',
      idempotency_key: params.idempotency_key,
      correlation_id: correlationId,
      metadata: params.metadata || {},
    });
    await this.gatewayTxRepository.save(gatewayTx);

    // Amount in reais for wallet operations (wallet uses DECIMAL)
    const amountReais = params.amount / 100;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find user wallet
      if (!params.customer_id) {
        throw new Error('customer_id is required for wallet payments');
      }

      const wallet = await this.walletRepository.findOne({
        where: {
          user_id: params.customer_id,
          wallet_type: WalletType.CLIENT,
          is_active: true,
        },
      });

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      const balanceBefore = Number(wallet.balance);
      if (balanceBefore < amountReais) {
        throw new Error(
          `Insufficient wallet balance. Required: R$ ${amountReais.toFixed(2)}, ` +
            `Available: R$ ${balanceBefore.toFixed(2)}`,
        );
      }

      // Deduct from wallet
      const balanceAfter = balanceBefore - amountReais;
      wallet.balance = balanceAfter;
      await queryRunner.manager.save(wallet);

      // Create WalletTransaction for existing flow compatibility
      const walletTx = this.walletTxRepository.create({
        wallet_id: wallet.id,
        transaction_type: TransactionType.PAYMENT,
        amount: amountReais,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        description: `Payment for order #${params.order_id.substring(0, 8)}`,
        order_id: params.order_id,
      });
      await queryRunner.manager.save(walletTx);

      await queryRunner.commitTransaction();

      // Update GatewayTransaction
      gatewayTx.external_id = walletTx.id;
      gatewayTx.status = 'completed';
      gatewayTx.metadata = {
        ...gatewayTx.metadata,
        wallet_id: wallet.id,
        wallet_tx_id: walletTx.id,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
      };
      await this.gatewayTxRepository.save(gatewayTx);

      this.logger.log(
        `Wallet payment completed | ` +
          `transactionId=${gatewayTx.id} | ` +
          `walletTxId=${walletTx.id} | ` +
          `amount_cents=${params.amount} | ` +
          `balanceAfter=${balanceAfter.toFixed(2)}`,
      );

      return {
        success: true,
        transaction_id: gatewayTx.id,
        external_id: walletTx.id,
        status: 'completed',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      const err = error as Error;

      gatewayTx.status = 'failed';
      gatewayTx.error_code = 'WALLET_ERROR';
      gatewayTx.error_message = err.message;
      await this.gatewayTxRepository.save(gatewayTx);

      this.logger.error(
        `Wallet payment failed | ` +
          `transactionId=${gatewayTx.id} | ` +
          `error=${err.message}`,
      );

      return {
        success: false,
        transaction_id: gatewayTx.id,
        external_id: '',
        status: 'failed',
        error_code: 'WALLET_ERROR',
        error_message: err.message,
      };
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Refund a wallet payment — adds funds back to the user wallet.
   */
  async refundPayment(
    transactionId: string,
    amount?: number,
  ): Promise<RefundResult> {
    const gatewayTx = await this.gatewayTxRepository.findOne({
      where: { id: transactionId },
    });

    if (!gatewayTx) {
      return {
        success: false,
        refund_id: '',
        refunded_amount: 0,
        status: 'failed',
        error_code: 'TRANSACTION_NOT_FOUND',
        error_message: `Transaction ${transactionId} not found`,
      };
    }

    const refundAmount = amount || gatewayTx.amount_cents;
    if (gatewayTx.refunded_amount_cents + refundAmount > gatewayTx.amount_cents) {
      return {
        success: false,
        refund_id: '',
        refunded_amount: 0,
        status: 'failed',
        error_code: 'REFUND_EXCEEDS_AMOUNT',
        error_message: 'Refund amount exceeds original payment',
      };
    }

    const walletId = gatewayTx.metadata?.wallet_id;
    if (!walletId) {
      return {
        success: false,
        refund_id: '',
        refunded_amount: 0,
        status: 'failed',
        error_code: 'WALLET_NOT_FOUND',
        error_message: 'Original wallet not found in transaction metadata',
      };
    }

    const refundAmountReais = refundAmount / 100;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const wallet = await this.walletRepository.findOne({
        where: { id: walletId },
      });

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      const balanceBefore = Number(wallet.balance);
      const balanceAfter = balanceBefore + refundAmountReais;
      wallet.balance = balanceAfter;
      await queryRunner.manager.save(wallet);

      const walletTx = this.walletTxRepository.create({
        wallet_id: wallet.id,
        transaction_type: TransactionType.REFUND,
        amount: refundAmountReais,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        description: `Refund for order #${gatewayTx.order_id?.substring(0, 8)}`,
        order_id: gatewayTx.order_id,
      });
      await queryRunner.manager.save(walletTx);

      await queryRunner.commitTransaction();

      gatewayTx.refunded_amount_cents += refundAmount;
      gatewayTx.status =
        gatewayTx.refunded_amount_cents >= gatewayTx.amount_cents
          ? 'refunded'
          : 'partially_refunded';
      await this.gatewayTxRepository.save(gatewayTx);

      this.logger.log(
        `Wallet refund completed | ` +
          `refundAmount_cents=${refundAmount} | ` +
          `walletTxId=${walletTx.id} | ` +
          `status=${gatewayTx.status}`,
      );

      return {
        success: true,
        refund_id: walletTx.id,
        refunded_amount: refundAmount,
        status: gatewayTx.status as 'refunded' | 'partially_refunded',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      const err = error as Error;

      return {
        success: false,
        refund_id: '',
        refunded_amount: 0,
        status: 'failed',
        error_code: 'WALLET_REFUND_ERROR',
        error_message: err.message,
      };
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get wallet payment status.
   * Since wallet payments are synchronous, this just reads the stored status.
   */
  async getPaymentStatus(transactionId: string): Promise<PaymentStatus> {
    const gatewayTx = await this.gatewayTxRepository.findOne({
      where: { id: transactionId },
    });

    if (!gatewayTx) {
      throw new Error(`Transaction ${transactionId} not found`);
    }

    return {
      transaction_id: gatewayTx.id,
      external_id: gatewayTx.external_id || '',
      status: gatewayTx.status as any,
      amount: gatewayTx.amount_cents,
      refunded_amount: gatewayTx.refunded_amount_cents,
      payment_method: 'wallet',
      updated_at: gatewayTx.updated_at,
    };
  }
}

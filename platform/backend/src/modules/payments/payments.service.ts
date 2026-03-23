import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { WalletTransaction } from './entities/wallet-transaction.entity';
import { PaymentMethod } from './entities/payment-method.entity';
import { RechargeWalletDto } from './dto/recharge-wallet.dto';
import { WithdrawWalletDto } from './dto/withdraw-wallet.dto';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { WalletType, TransactionType } from '@common/enums';
import { Order } from '@/modules/orders/entities/order.entity';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(WalletTransaction)
    private transactionRepository: Repository<WalletTransaction>,
    @InjectRepository(PaymentMethod)
    private paymentMethodRepository: Repository<PaymentMethod>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private dataSource: DataSource,
  ) {}

  async getWallet(userId: string, walletType: WalletType = WalletType.CLIENT) {
    let wallet = await this.walletRepository.findOne({
      where: { user_id: userId, wallet_type: walletType },
    });

    if (!wallet) {
      wallet = this.walletRepository.create({
        user_id: userId,
        wallet_type: walletType,
        balance: 0,
      });
      await this.walletRepository.save(wallet);
    }

    return wallet;
  }

  async rechargeWallet(userId: string, rechargeDto: RechargeWalletDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const wallet = await this.getWallet(userId);
      const balanceBefore = Number(wallet.balance);
      const balanceAfter = balanceBefore + rechargeDto.amount;

      wallet.balance = balanceAfter;
      await queryRunner.manager.save(wallet);

      const transaction = this.transactionRepository.create({
        wallet_id: wallet.id,
        transaction_type: TransactionType.RECHARGE,
        amount: rechargeDto.amount,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        description: rechargeDto.description || 'Wallet recharge',
        payment_method_id: rechargeDto.payment_method_id,
      });

      await queryRunner.manager.save(transaction);
      await queryRunner.commitTransaction();

      return { wallet, transaction };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async withdrawWallet(userId: string, withdrawDto: WithdrawWalletDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const wallet = await this.getWallet(userId);
      const balanceBefore = Number(wallet.balance);

      if (balanceBefore < withdrawDto.amount) {
        throw new BadRequestException('Insufficient balance');
      }

      const balanceAfter = balanceBefore - withdrawDto.amount;

      wallet.balance = balanceAfter;
      await queryRunner.manager.save(wallet);

      const transaction = this.transactionRepository.create({
        wallet_id: wallet.id,
        transaction_type: TransactionType.WITHDRAWAL,
        amount: withdrawDto.amount,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        description: withdrawDto.description || 'Wallet withdrawal',
      });

      await queryRunner.manager.save(transaction);
      await queryRunner.commitTransaction();

      return { wallet, transaction };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getTransactions(userId: string) {
    const wallet = await this.getWallet(userId);
    return this.transactionRepository.find({
      where: { wallet_id: wallet.id },
      order: { created_at: 'DESC' },
    });
  }

  async getPaymentMethods(userId: string) {
    return this.paymentMethodRepository.find({
      where: { user_id: userId, is_active: true },
      order: { is_default: 'DESC', created_at: 'DESC' },
    });
  }

  async createPaymentMethod(userId: string, createDto: CreatePaymentMethodDto) {
    const paymentMethod = this.paymentMethodRepository.create({
      ...createDto,
      user_id: userId,
    });

    return this.paymentMethodRepository.save(paymentMethod);
  }

  async deletePaymentMethod(userId: string, paymentMethodId: string) {
    const paymentMethod = await this.paymentMethodRepository.findOne({
      where: { id: paymentMethodId, user_id: userId },
    });

    if (!paymentMethod) {
      throw new NotFoundException('Payment method not found');
    }

    paymentMethod.is_active = false;
    return this.paymentMethodRepository.save(paymentMethod);
  }

  /**
   * Update payment method
   */
  async updatePaymentMethod(
    userId: string,
    paymentMethodId: string,
    updatePaymentMethodDto: UpdatePaymentMethodDto,
  ) {
    const paymentMethod = await this.paymentMethodRepository.findOne({
      where: { id: paymentMethodId, user_id: userId },
    });

    if (!paymentMethod) {
      throw new NotFoundException('Payment method not found');
    }

    // If setting this as default, unset other defaults
    if (updatePaymentMethodDto.is_default === true) {
      await this.paymentMethodRepository.update(
        { user_id: userId, is_default: true },
        { is_default: false },
      );
    }

    Object.assign(paymentMethod, updatePaymentMethodDto);

    return this.paymentMethodRepository.save(paymentMethod);
  }

  async processPayment(userId: string, processDto: ProcessPaymentDto) {
    const startTime = Date.now();
    const paymentCorrelationId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.logger.log({
      message: 'Payment processing initiated',
      correlationId: paymentCorrelationId,
      userId,
      orderId: processDto.order_id,
      amount: processDto.amount,
      paymentMethod: processDto.payment_method,
    });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verify order exists and belongs to user
      const order = await this.orderRepository.findOne({
        where: { id: processDto.order_id, user_id: userId },
      });

      if (!order) {
        this.logger.warn({
          message: 'Payment failed - order not found',
          correlationId: paymentCorrelationId,
          userId,
          orderId: processDto.order_id,
          duration: Date.now() - startTime,
        });
        throw new NotFoundException('Order not found');
      }

      // Verify amount matches order total using precision-safe comparison
      // Round both values to 2 decimal places to avoid floating-point precision issues
      const paymentAmount = Math.round(processDto.amount * 100) / 100;
      const orderTotal = Math.round(Number(order.total_amount) * 100) / 100;
      if (paymentAmount !== orderTotal) {
        this.logger.warn({
          message: 'Payment failed - amount mismatch',
          correlationId: paymentCorrelationId,
          userId,
          orderId: processDto.order_id,
          paymentAmount,
          orderTotal,
          duration: Date.now() - startTime,
        });
        throw new BadRequestException('Payment amount does not match order total');
      }

      let paymentStatus = 'completed';
      let transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Process based on payment method
      switch (processDto.payment_method) {
        case 'wallet':
          // Deduct from wallet
          const wallet = await this.getWallet(userId);
          if (Number(wallet.balance) < processDto.amount) {
            this.logger.warn({
              message: 'Payment failed - insufficient wallet balance',
              correlationId: paymentCorrelationId,
              userId,
              orderId: processDto.order_id,
              walletBalance: Number(wallet.balance),
              requiredAmount: processDto.amount,
              duration: Date.now() - startTime,
            });
            throw new BadRequestException('Insufficient wallet balance');
          }

          wallet.balance = Number(wallet.balance) - processDto.amount;
          await queryRunner.manager.save(wallet);

          // Create transaction record
          const transaction = this.transactionRepository.create({
            wallet_id: wallet.id,
            transaction_type: TransactionType.PAYMENT,
            amount: processDto.amount,
            balance_before: Number(wallet.balance) + processDto.amount,
            balance_after: Number(wallet.balance),
            description: `Payment for order #${order.id.substring(0, 8)}`,
            order_id: order.id,
          });
          await queryRunner.manager.save(transaction);
          break;

        case 'credit_card':
        case 'debit_card':
          // In production, integrate with payment gateway (Stripe, etc)
          // For now, simulate successful payment using tokenized card
          this.logger.log(`Processing ${processDto.payment_method} payment: ${processDto.amount}`);
          if (processDto.tokenized_card) {
            this.logger.log(`Card ending in: ${processDto.tokenized_card.last_four || 'XXXX'}`);
            this.logger.log(`Payment token: ${processDto.tokenized_card.payment_token.substring(0, 8)}...`);
          } else if (processDto.saved_payment_method) {
            this.logger.log(`Using saved payment method: ${processDto.saved_payment_method.payment_method_id}`);
          }
          break;

        case 'pix':
          // In production, generate PIX QR code and await payment
          // For now, simulate successful payment
          this.logger.log(`Processing PIX payment: ${processDto.amount}`);
          if (processDto.pix_key) {
            this.logger.log(`PIX key: ${processDto.pix_key}`);
          }
          break;

        case 'cash':
          // Cash payment - mark as pending until confirmed
          paymentStatus = 'pending';
          break;

        default:
          throw new BadRequestException('Invalid payment method');
      }

      // Payment processed successfully
      // Note: Order entity doesn't have payment fields
      // Payment tracking is done through transactions

      await queryRunner.commitTransaction();

      const duration = Date.now() - startTime;
      this.logger.log({
        message: 'Payment processed successfully',
        correlationId: paymentCorrelationId,
        userId,
        orderId: order.id,
        transactionId,
        paymentMethod: processDto.payment_method,
        amount: processDto.amount,
        status: paymentStatus,
        duration,
      });

      return {
        success: true,
        transaction_id: transactionId,
        payment_status: paymentStatus,
        order_id: order.id,
        amount: processDto.amount,
        payment_method: processDto.payment_method,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      const err = error as Error;
      const duration = Date.now() - startTime;
      this.logger.error({
        message: 'Payment processing failed',
        correlationId: paymentCorrelationId,
        userId,
        orderId: processDto.order_id,
        paymentMethod: processDto.payment_method,
        amount: processDto.amount,
        error: err.message,
        duration,
      });
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}

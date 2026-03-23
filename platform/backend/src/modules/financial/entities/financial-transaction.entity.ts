import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';

export enum TransactionType {
  SALE = 'sale',
  TIP = 'tip',
  REFUND = 'refund',
  EXPENSE = 'expense',
  ADJUSTMENT = 'adjustment',
}

export enum TransactionCategory {
  FOOD_SALES = 'food_sales',
  BEVERAGE_SALES = 'beverage_sales',
  TIP_INCOME = 'tip_income',
  STAFF_WAGES = 'staff_wages',
  SUPPLIES = 'supplies',
  RENT = 'rent',
  UTILITIES = 'utilities',
  MARKETING = 'marketing',
  MAINTENANCE = 'maintenance',
  OTHER = 'other',
}

export enum ReferenceType {
  ORDER = 'order',
  PAYMENT = 'payment',
  TIP = 'tip',
  REFUND = 'refund',
  MANUAL = 'manual',
}

@Entity('financial_transactions')
@Index('idx_financial_transaction_restaurant', ['restaurant_id'])
@Index('idx_financial_transaction_type', ['type'])
@Index('idx_financial_transaction_date', ['transaction_date'])
@Index('idx_financial_transaction_restaurant_date', ['restaurant_id', 'transaction_date'])
export class FinancialTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  restaurant_id: string;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ type: 'enum', enum: TransactionCategory })
  category: TransactionCategory;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'uuid', nullable: true })
  reference_id: string; // order_id, payment_id, etc

  @Column({ type: 'enum', enum: ReferenceType, nullable: true })
  reference_type: ReferenceType;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  transaction_date: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Restaurant)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;
}

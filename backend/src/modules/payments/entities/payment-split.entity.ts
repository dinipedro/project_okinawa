import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
  Check,
} from 'typeorm';
import { Order } from '@/modules/orders/entities/order.entity';
import { Profile } from '@/modules/users/entities/profile.entity';

export enum PaymentSplitMode {
  INDIVIDUAL = 'individual', // Cada um paga seus próprios itens
  SPLIT_EQUAL = 'split_equal', // Divide igualmente entre todos
  SPLIT_SELECTIVE = 'split_selective', // Seleciona itens específicos ou valor fixo
}

export enum PaymentSplitStatus {
  PENDING = 'pending',
  PARTIALLY_PAID = 'partially_paid',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

@Entity('payment_splits')
@Index('idx_payment_split_order', ['order_id'])
@Index('idx_payment_split_user', ['guest_user_id'])
@Index('idx_payment_split_status', ['status'])
@Unique('UQ_payment_split_order_user', ['order_id', 'guest_user_id'])
@Check('CHK_payment_split_amount_due', 'amount_due >= 0')
@Check('CHK_payment_split_amount_paid', 'amount_paid >= 0 AND amount_paid <= amount_due')
export class PaymentSplit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  order_id: string;

  @Column('uuid')
  guest_user_id: string;

  @Column({
    type: 'enum',
    enum: PaymentSplitMode,
  })
  split_mode: PaymentSplitMode;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount_due: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amount_paid: number;

  @Column({
    type: 'enum',
    enum: PaymentSplitStatus,
    default: PaymentSplitStatus.PENDING,
  })
  status: PaymentSplitStatus;

  @Column('uuid', { nullable: true })
  payment_id: string;

  @Column({ nullable: true })
  payment_transaction_id: string;

  @Column({ type: 'jsonb', nullable: true })
  selected_items: any; // Array de IDs dos itens selecionados

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  custom_amount: number; // Valor fixo definido pelo usuário

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  service_charge: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tip_amount: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  paid_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Profile)
  @JoinColumn({ name: 'guest_user_id' })
  guest_user: Profile;
}

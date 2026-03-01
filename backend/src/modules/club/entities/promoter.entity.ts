import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';

/**
 * Promoter entity for managing club promoters and their commissions
 * Tracks individual promoters, their commission rates, and performance metrics
 */
@Entity('promoters')
export class Promoter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'restaurant_id' })
  restaurantId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  nickname?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ name: 'photo_url', nullable: true })
  photoUrl?: string;

  @Column({ name: 'promoter_code', unique: true })
  promoterCode: string;

  @Column({ 
    name: 'commission_type', 
    type: 'enum', 
    enum: ['percentage', 'fixed_per_entry', 'fixed_per_table', 'tiered'],
    default: 'percentage'
  })
  commissionType: 'percentage' | 'fixed_per_entry' | 'fixed_per_table' | 'tiered';

  @Column({ 
    name: 'commission_rate', 
    type: 'decimal', 
    precision: 5, 
    scale: 2, 
    default: 10.00 
  })
  commissionRate: number;

  @Column({ 
    name: 'fixed_commission_amount', 
    type: 'decimal', 
    precision: 10, 
    scale: 2, 
    nullable: true 
  })
  fixedCommissionAmount?: number;

  @Column({ name: 'tiered_rates', type: 'jsonb', nullable: true })
  tieredRates?: {
    tier: number;
    minEntries: number;
    maxEntries?: number;
    rate: number;
  }[];

  @Column({ 
    name: 'status', 
    type: 'enum', 
    enum: ['active', 'inactive', 'suspended', 'pending_approval'],
    default: 'pending_approval'
  })
  status: 'active' | 'inactive' | 'suspended' | 'pending_approval';

  @Column({ name: 'total_entries_sold', default: 0 })
  totalEntriesSold: number;

  @Column({ name: 'total_tables_sold', default: 0 })
  totalTablesSold: number;

  @Column({ 
    name: 'total_revenue_generated', 
    type: 'decimal', 
    precision: 12, 
    scale: 2, 
    default: 0 
  })
  totalRevenueGenerated: number;

  @Column({ 
    name: 'total_commission_earned', 
    type: 'decimal', 
    precision: 12, 
    scale: 2, 
    default: 0 
  })
  totalCommissionEarned: number;

  @Column({ 
    name: 'pending_commission', 
    type: 'decimal', 
    precision: 12, 
    scale: 2, 
    default: 0 
  })
  pendingCommission: number;

  @Column({ name: 'pix_key', nullable: true })
  pixKey?: string;

  @Column({ name: 'bank_account', type: 'jsonb', nullable: true })
  bankAccount?: {
    bank: string;
    agency: string;
    account: string;
    accountType: 'checking' | 'savings';
    holderName: string;
    holderDocument: string;
  };

  @Column({ name: 'notes', nullable: true })
  notes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

/**
 * PromoterSale entity for tracking individual sales made by promoters
 */
@Entity('promoter_sales')
export class PromoterSale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'promoter_id' })
  promoterId: string;

  @Column({ name: 'restaurant_id' })
  restaurantId: string;

  @Column({ name: 'event_date', type: 'date' })
  eventDate: Date;

  @Column({ 
    name: 'sale_type', 
    type: 'enum', 
    enum: ['entry', 'vip_table', 'guest_list'],
    default: 'entry'
  })
  saleType: 'entry' | 'vip_table' | 'guest_list';

  @Column({ name: 'reference_id' })
  referenceId: string; // ID of the entry, table reservation, or guest list

  @Column({ name: 'customer_name', nullable: true })
  customerName?: string;

  @Column({ name: 'customer_phone', nullable: true })
  customerPhone?: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ 
    name: 'sale_amount', 
    type: 'decimal', 
    precision: 10, 
    scale: 2 
  })
  saleAmount: number;

  @Column({ 
    name: 'commission_amount', 
    type: 'decimal', 
    precision: 10, 
    scale: 2 
  })
  commissionAmount: number;

  @Column({ 
    name: 'commission_status', 
    type: 'enum', 
    enum: ['pending', 'approved', 'paid', 'cancelled'],
    default: 'pending'
  })
  commissionStatus: 'pending' | 'approved' | 'paid' | 'cancelled';

  @Column({ name: 'paid_at', nullable: true })
  paidAt?: Date;

  @Column({ name: 'payment_reference', nullable: true })
  paymentReference?: string;

  @Column({ name: 'notes', nullable: true })
  notes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

/**
 * PromoterPayment entity for tracking commission payments to promoters
 */
@Entity('promoter_payments')
export class PromoterPayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'promoter_id' })
  promoterId: string;

  @Column({ name: 'restaurant_id' })
  restaurantId: string;

  @Column({ 
    type: 'decimal', 
    precision: 10, 
    scale: 2 
  })
  amount: number;

  @Column({ 
    name: 'payment_method', 
    type: 'enum', 
    enum: ['pix', 'bank_transfer', 'cash'],
    default: 'pix'
  })
  paymentMethod: 'pix' | 'bank_transfer' | 'cash';

  @Column({ 
    name: 'status', 
    type: 'enum', 
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  })
  status: 'pending' | 'processing' | 'completed' | 'failed';

  @Column({ name: 'period_start', type: 'date' })
  periodStart: Date;

  @Column({ name: 'period_end', type: 'date' })
  periodEnd: Date;

  @Column({ name: 'sales_count', type: 'int' })
  salesCount: number;

  @Column({ name: 'sale_ids', type: 'jsonb' })
  saleIds: string[];

  @Column({ name: 'payment_proof_url', nullable: true })
  paymentProofUrl?: string;

  @Column({ name: 'transaction_id', nullable: true })
  transactionId?: string;

  @Column({ name: 'processed_by', nullable: true })
  processedBy?: string;

  @Column({ name: 'processed_at', nullable: true })
  processedAt?: Date;

  @Column({ name: 'notes', nullable: true })
  notes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

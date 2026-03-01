import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PaymentMethodType } from '../../../common/enums';
import { Profile } from '../../users/entities/profile.entity';

@Entity('payment_methods')
export class PaymentMethod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @Column({
    type: 'enum',
    enum: PaymentMethodType,
  })
  method_type: PaymentMethodType;

  @Column({ nullable: true })
  card_last_four: string;

  @Column({ nullable: true })
  card_brand: string;

  @Column({ nullable: true })
  card_exp_month: string;

  @Column({ nullable: true })
  card_exp_year: string;

  @Column({ nullable: true })
  pix_key: string;

  @Column({ nullable: true })
  external_payment_method_id: string;

  @Column({ default: false })
  is_default: boolean;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Profile;
}

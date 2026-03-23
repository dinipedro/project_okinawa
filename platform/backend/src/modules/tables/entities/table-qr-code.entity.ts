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
} from 'typeorm';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';
import { RestaurantTable } from './restaurant-table.entity';
import { Profile } from '../../users/entities/profile.entity';

export enum QRCodeStyle {
  MINIMAL = 'minimal',
  PREMIUM = 'premium',
  BOLD = 'bold',
  ELEGANT = 'elegant',
}

@Entity('table_qr_codes')
@Index('idx_qr_codes_restaurant', ['restaurant_id'])
@Index('idx_qr_codes_table', ['table_id'])
@Index('idx_qr_codes_active', ['is_active'], { where: 'is_active = true' })
@Unique(['table_id', 'version'])
export class TableQrCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  restaurant_id: string;

  @Column('uuid')
  table_id: string;

  @Column({ type: 'text' })
  qr_code_data: string;

  @Column({ type: 'text', nullable: true })
  qr_code_image: string;

  @Column({ length: 64 })
  signature: string;

  @Column({
    type: 'enum',
    enum: QRCodeStyle,
    default: QRCodeStyle.MINIMAL,
  })
  style: QRCodeStyle;

  @Column({ length: 7, default: '#000000' })
  color_primary: string;

  @Column({ length: 7, nullable: true })
  color_secondary: string;

  @Column({ default: false })
  logo_included: boolean;

  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  expires_at: Date;

  @Column('uuid', { nullable: true })
  generated_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Restaurant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;

  @ManyToOne(() => RestaurantTable, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'table_id' })
  table: RestaurantTable;

  @ManyToOne(() => Profile, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'generated_by' })
  generator: Profile;
}

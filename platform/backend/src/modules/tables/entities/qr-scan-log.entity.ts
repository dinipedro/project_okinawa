import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';
import { RestaurantTable } from './restaurant-table.entity';
import { TableQrCode } from './table-qr-code.entity';
import { TableSession } from './table-session.entity';
import { Profile } from '../../users/entities/profile.entity';

export enum ScanResult {
  SUCCESS = 'success',
  INVALID = 'invalid',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
}

@Entity('qr_scan_logs')
@Index('idx_scan_logs_qr', ['qr_code_id'])
@Index('idx_scan_logs_time', ['scanned_at'])
@Index('idx_scan_logs_restaurant', ['restaurant_id'])
export class QrScanLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  qr_code_id: string;

  @Column('uuid')
  restaurant_id: string;

  @Column('uuid')
  table_id: string;

  @Column('uuid', { nullable: true })
  scanned_by: string;

  @Column({ type: 'jsonb', nullable: true })
  device_info: Record<string, any>;

  @Column({ type: 'inet', nullable: true })
  ip_address: string;

  @Column({
    type: 'enum',
    enum: ScanResult,
  })
  scan_result: ScanResult;

  @Column('uuid', { nullable: true })
  session_id: string;

  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  scanned_at: Date;

  // Relations
  @ManyToOne(() => TableQrCode, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'qr_code_id' })
  qr_code: TableQrCode;

  @ManyToOne(() => Restaurant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;

  @ManyToOne(() => RestaurantTable, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'table_id' })
  table: RestaurantTable;

  @ManyToOne(() => Profile, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'scanned_by' })
  scanner: Profile;

  @ManyToOne(() => TableSession, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'session_id' })
  session: TableSession;
}

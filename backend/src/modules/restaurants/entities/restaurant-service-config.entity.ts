import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ServiceType } from '../../../common/enums';
import { Restaurant } from './restaurant.entity';

@Entity('restaurant_service_configs')
export class RestaurantServiceConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  restaurant_id: string;

  @Column({
    type: 'enum',
    enum: ServiceType,
  })
  service_type: ServiceType;

  @Column({ default: true })
  is_active: boolean;

  // Fine Dining
  @Column({ nullable: true })
  sommelier_available: boolean;

  @Column({ nullable: true })
  dress_code: string;

  @Column({ nullable: true })
  reservation_required: boolean;

  @Column({ type: 'int', nullable: true })
  average_meal_duration: number;

  // Quick Service
  @Column({ nullable: true })
  skip_the_line_enabled: boolean;

  @Column({ type: 'simple-array', nullable: true })
  pickup_zones: string[];

  @Column({ type: 'int', nullable: true })
  avg_preparation_time: number;

  // Fast Casual
  @Column({ nullable: true })
  build_your_own_enabled: boolean;

  @Column({ type: 'jsonb', nullable: true })
  customization_options: Record<string, any>;

  // Coffee Shop
  @Column({ nullable: true })
  work_friendly: boolean;

  @Column({ nullable: true })
  wifi_available: boolean;

  @Column({ nullable: true })
  power_outlets_available: boolean;

  @Column({ nullable: true })
  noise_level: string;

  // Buffet
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price_per_kg: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  fixed_price: number;

  @Column({ nullable: true })
  payment_mode: string;

  @Column({ nullable: true })
  smart_scales_enabled: boolean;

  // Drive-Thru
  @Column({ type: 'int', nullable: true })
  drive_thru_lanes: number;

  @Column({ nullable: true })
  geofencing_enabled: boolean;

  @Column({ type: 'int', nullable: true })
  geofencing_radius: number;

  @Column({ nullable: true })
  license_plate_recognition: boolean;

  // Food Truck
  @Column({ type: 'jsonb', nullable: true })
  current_location: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  schedule: Record<string, any>;

  @Column({ nullable: true })
  offline_mode_enabled: boolean;

  // Chef's Table
  @Column({ type: 'int', nullable: true })
  seats_available: number;

  @Column({ type: 'int', nullable: true })
  experience_duration: number;

  @Column({ nullable: true })
  pre_booking_required: boolean;

  @Column({ nullable: true })
  tasting_menu_only: boolean;

  // Casual Dining - Reservations & Entry
  @Column({ nullable: true })
  reservations_optional: boolean;

  @Column({ type: 'int', nullable: true })
  reservation_grace_period: number;

  @Column({ nullable: true })
  waitlist_enabled: boolean;

  @Column({ nullable: true })
  waitlist_advance_drinks: boolean;

  @Column({ nullable: true })
  estimated_wait_display: boolean;

  // Casual Dining - Table Service
  @Column({ nullable: true })
  table_service: boolean;

  @Column({ nullable: true })
  order_at_table: boolean;

  @Column({ nullable: true })
  call_waiter_button: boolean;

  @Column({ nullable: true })
  partial_order_enabled: boolean;

  // Casual Dining - Groups
  @Column({ nullable: true })
  group_friendly: boolean;

  @Column({ type: 'int', nullable: true })
  max_group_size: number;

  @Column({ type: 'int', nullable: true })
  group_reservation_required: number;

  // Casual Dining - Payment
  @Column({ type: 'int', nullable: true })
  suggested_tip_percentage: number;

  @Column({ nullable: true })
  service_charge_included: boolean;

  @Column({ nullable: true })
  split_bill_promoted: boolean;

  // Casual Dining - Operational
  @Column({ type: 'int', nullable: true })
  table_turnover_target: number;

  // Common
  @Column({ type: 'text', nullable: true })
  special_instructions: string;

  @Column({ type: 'simple-array', nullable: true })
  experience_highlights: string[];

  @Column({ type: 'jsonb', nullable: true })
  config_metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.service_configs)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  Index,
} from 'typeorm';

@Entity('platform_connections')
@Unique(['restaurant_id', 'platform'])
@Index(['restaurant_id'])
export class PlatformConnection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  restaurant_id: string;

  @Column({ type: 'varchar', length: 20 })
  platform: string;

  @Column({ type: 'jsonb', default: {} })
  credentials: Record<string, any>;

  @Column({ type: 'varchar', length: 255, nullable: true })
  webhook_secret: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'boolean', default: true })
  auto_accept: boolean;

  @Column({ type: 'int', default: 30 })
  max_concurrent_orders: number;

  @Column({ type: 'int', default: 20 })
  high_load_threshold: number;

  @Column({ type: 'timestamp', nullable: true })
  last_sync_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

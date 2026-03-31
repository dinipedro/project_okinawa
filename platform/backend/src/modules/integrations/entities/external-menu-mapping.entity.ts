import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  Index,
} from 'typeorm';

@Entity('external_menu_mappings')
@Unique(['restaurant_id', 'platform', 'external_item_id'])
@Index(['restaurant_id', 'platform'])
@Index(['internal_menu_item_id'])
export class ExternalMenuMapping {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  restaurant_id: string;

  @Column({ type: 'varchar', length: 20 })
  platform: string;

  @Column({ type: 'varchar', length: 255 })
  external_item_id: string;

  @Column({ type: 'varchar', length: 255 })
  external_item_name: string;

  @Column('uuid')
  internal_menu_item_id: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

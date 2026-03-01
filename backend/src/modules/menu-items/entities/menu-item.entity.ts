import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';
import { MenuCategory } from './menu-category.entity';

@Entity('menu_items')
@Index('idx_menu_item_restaurant', ['restaurant_id'])
@Index('idx_menu_item_category', ['category_id'])
@Index('idx_menu_item_available', ['is_available'])
@Index('idx_menu_item_display_order', ['display_order'])
export class MenuItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  restaurant_id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column('uuid', { nullable: true })
  category_id: string;

  @Column({ nullable: true })
  image_url: string;

  @Column({ default: true })
  is_available: boolean;

  @Column({ type: 'int', nullable: true })
  preparation_time: number;

  @Column({ type: 'int', nullable: true })
  calories: number;

  @Column({ type: 'jsonb', nullable: true })
  allergens: string[];

  @Column({ type: 'jsonb', nullable: true })
  dietary_info: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  customizations: Record<string, any>;

  @Column({ type: 'int', default: 0 })
  display_order: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.menu_items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;

  @ManyToOne(() => MenuCategory, (category) => category.menu_items, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'category_id' })
  category: MenuCategory;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.menu_item, { cascade: true })
  order_items: OrderItem[];
}

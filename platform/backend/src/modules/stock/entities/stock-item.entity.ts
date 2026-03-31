import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';
import { Ingredient } from '../../cost-control/entities/ingredient.entity';

@Entity('stock_items')
@Unique(['ingredient_id', 'restaurant_id'])
@Index('idx_stock_restaurant', ['restaurant_id'])
@Index('idx_stock_ingredient', ['ingredient_id'])
export class StockItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  ingredient_id: string;

  @Column({ type: 'uuid' })
  restaurant_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0 })
  current_quantity: number;

  @Column({ type: 'varchar', length: 20 })
  unit: string;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  min_quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  last_purchase_price: number;

  @Column({ type: 'date', nullable: true })
  last_purchase_date: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Restaurant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;

  @ManyToOne(() => Ingredient, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ingredient_id' })
  ingredient: Ingredient;
}

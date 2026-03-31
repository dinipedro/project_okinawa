import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Ingredient } from './ingredient.entity';

@Entity('ingredient_prices')
@Index('idx_ingredient_price_ingredient', ['ingredient_id'])
@Index('idx_ingredient_price_effective_date', ['effective_date'])
export class IngredientPrice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  ingredient_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  price_per_unit: number;

  @Column({ type: 'varchar', length: 200, nullable: true })
  supplier: string;

  @Column({ type: 'date' })
  effective_date: Date;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Ingredient, (ingredient) => ingredient.prices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ingredient_id' })
  ingredient: Ingredient;
}

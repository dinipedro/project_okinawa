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
import { IngredientPrice } from './ingredient-price.entity';
import { RecipeIngredient } from './recipe-ingredient.entity';

@Entity('ingredients')
@Index('idx_ingredient_restaurant', ['restaurant_id'])
@Index('idx_ingredient_active', ['is_active'])
export class Ingredient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  restaurant_id: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 20 })
  unit: string; // 'kg', 'l', 'un', 'g', 'ml'

  @Column({ type: 'varchar', length: 50, nullable: true })
  category: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Restaurant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;

  @OneToMany(() => IngredientPrice, (price) => price.ingredient, { cascade: true })
  prices: IngredientPrice[];

  @OneToMany(() => RecipeIngredient, (ri) => ri.ingredient)
  recipe_ingredients: RecipeIngredient[];
}

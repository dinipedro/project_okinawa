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
import { MenuItem } from '../../menu-items/entities/menu-item.entity';
import { RecipeIngredient } from './recipe-ingredient.entity';

@Entity('recipes')
@Index('idx_recipe_restaurant', ['restaurant_id'])
@Index('idx_recipe_menu_item', ['menu_item_id'])
export class Recipe {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  menu_item_id: string;

  @Column({ type: 'uuid' })
  restaurant_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  calculated_cost: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  calculated_margin_pct: number;

  @Column({ type: 'timestamp', nullable: true })
  last_calculated_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Restaurant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;

  @ManyToOne(() => MenuItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'menu_item_id' })
  menu_item: MenuItem;

  @OneToMany(() => RecipeIngredient, (ri) => ri.recipe, { cascade: true })
  ingredients: RecipeIngredient[];
}

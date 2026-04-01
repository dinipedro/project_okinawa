import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { Ingredient } from './ingredient.entity';
import { Supplier } from './supplier.entity';

@Entity('ingredient_suppliers')
@Unique(['ingredient_id', 'supplier_id'])
@Index('idx_ingredient_suppliers_ingredient', ['ingredient_id'])
@Index('idx_ingredient_suppliers_supplier', ['supplier_id'])
export class IngredientSupplier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  ingredient_id: string;

  @Column({ type: 'uuid' })
  supplier_id: string;

  @Column({ type: 'boolean', default: false })
  is_preferred: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  last_price: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Ingredient, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ingredient_id' })
  ingredient: Ingredient;

  @ManyToOne(() => Supplier, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;
}

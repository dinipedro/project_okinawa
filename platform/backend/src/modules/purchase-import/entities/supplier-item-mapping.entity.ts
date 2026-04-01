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
import { Ingredient } from '../../cost-control/entities/ingredient.entity';

/**
 * SupplierItemMapping — Remembers how supplier items map to NOOWE ingredients.
 *
 * When an owner confirms a match between a NF-e line item and a NOOWE ingredient,
 * the mapping is saved. Next time the same supplier sends a NF-e with the same
 * item description, the match is automatic.
 */
@Entity('supplier_item_mappings')
@Unique(['restaurant_id', 'supplier_cnpj', 'external_item_description'])
@Index('idx_supplier_mappings_restaurant', ['restaurant_id'])
@Index('idx_supplier_mappings_cnpj', ['supplier_cnpj'])
export class SupplierItemMapping {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  restaurant_id: string;

  @Column({ type: 'varchar', length: 14 })
  supplier_cnpj: string;

  @Column({ type: 'varchar', length: 255 })
  external_item_description: string;

  @Column({ type: 'varchar', length: 8, nullable: true })
  external_ncm: string;

  @Column({ type: 'uuid' })
  ingredient_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  conversion_factor: number;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Ingredient, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ingredient_id' })
  ingredient: Ingredient;
}

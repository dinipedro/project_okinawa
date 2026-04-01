import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateStockMovements1765700000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add max_quantity column to stock_items
    await queryRunner.query(`
      ALTER TABLE stock_items
      ADD COLUMN IF NOT EXISTS max_quantity DECIMAL(10,4);
    `);

    // Create stock_movements table
    await queryRunner.query(`
      CREATE TABLE stock_movements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        stock_item_id UUID NOT NULL REFERENCES stock_items(id) ON DELETE CASCADE,
        restaurant_id UUID NOT NULL,
        ingredient_id UUID NOT NULL,
        type VARCHAR(30) NOT NULL,
        quantity DECIMAL(10,4) NOT NULL,
        quantity_before DECIMAL(10,4) NOT NULL,
        quantity_after DECIMAL(10,4) NOT NULL,
        unit_cost DECIMAL(10,4),
        reference_id UUID,
        reference_type VARCHAR(30),
        created_by UUID,
        notes TEXT,
        created_at TIMESTAMP DEFAULT now()
      );
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX idx_stock_movements_item
      ON stock_movements(stock_item_id, created_at DESC);
    `);

    await queryRunner.query(`
      CREATE INDEX idx_stock_movements_restaurant
      ON stock_movements(restaurant_id, created_at DESC);
    `);

    await queryRunner.query(`
      CREATE INDEX idx_stock_movements_type
      ON stock_movements(restaurant_id, type);
    `);

    await queryRunner.query(`
      CREATE INDEX idx_stock_movements_reference
      ON stock_movements(reference_id, reference_type);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS stock_movements;`);
    await queryRunner.query(`
      ALTER TABLE stock_items DROP COLUMN IF EXISTS max_quantity;
    `);
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSupplierItemMappings1765700000003 implements MigrationInterface {
  name = 'CreateSupplierItemMappings1765700000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE supplier_item_mappings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        restaurant_id UUID NOT NULL,
        supplier_cnpj VARCHAR(14) NOT NULL,
        external_item_description VARCHAR(255) NOT NULL,
        external_ncm VARCHAR(8),
        ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
        conversion_factor DECIMAL(10,4),
        created_at TIMESTAMP DEFAULT now(),
        UNIQUE(restaurant_id, supplier_cnpj, external_item_description)
      );
    `);

    await queryRunner.query(`
      CREATE INDEX idx_supplier_mappings_restaurant ON supplier_item_mappings(restaurant_id);
    `);

    await queryRunner.query(`
      CREATE INDEX idx_supplier_mappings_cnpj ON supplier_item_mappings(supplier_cnpj);
    `);

    // Add access_key column to purchase_records for NF-e tracking
    await queryRunner.query(`
      ALTER TABLE purchase_records ADD COLUMN IF NOT EXISTS access_key VARCHAR(44);
    `);

    await queryRunner.query(`
      ALTER TABLE purchase_records ADD COLUMN IF NOT EXISTS xml_content TEXT;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE purchase_records DROP COLUMN IF EXISTS xml_content;`);
    await queryRunner.query(`ALTER TABLE purchase_records DROP COLUMN IF EXISTS access_key;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_supplier_mappings_cnpj;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_supplier_mappings_restaurant;`);
    await queryRunner.query(`DROP TABLE IF EXISTS supplier_item_mappings;`);
  }
}

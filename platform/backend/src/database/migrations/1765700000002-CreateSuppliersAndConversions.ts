import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSuppliersAndConversions1765700000002 implements MigrationInterface {
  name = 'CreateSuppliersAndConversions1765700000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ────────── SUPPLIERS TABLE ──────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "suppliers" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "restaurant_id" uuid NOT NULL,
        "name" varchar(200) NOT NULL,
        "cnpj" varchar(14),
        "contact_name" varchar(200),
        "phone" varchar(20),
        "email" varchar(200),
        "address" text,
        "notes" text,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_suppliers" PRIMARY KEY ("id"),
        CONSTRAINT "FK_suppliers_restaurant" FOREIGN KEY ("restaurant_id")
          REFERENCES "restaurants"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_suppliers_restaurant" ON "suppliers" ("restaurant_id")
    `);

    // ────────── INGREDIENT SUPPLIERS TABLE (N:N) ──────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "ingredient_suppliers" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "ingredient_id" uuid NOT NULL,
        "supplier_id" uuid NOT NULL,
        "is_preferred" boolean NOT NULL DEFAULT false,
        "last_price" decimal(10,4),
        "notes" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_ingredient_suppliers" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_ingredient_supplier" UNIQUE ("ingredient_id", "supplier_id"),
        CONSTRAINT "FK_ingredient_suppliers_ingredient" FOREIGN KEY ("ingredient_id")
          REFERENCES "ingredients"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_ingredient_suppliers_supplier" FOREIGN KEY ("supplier_id")
          REFERENCES "suppliers"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_ingredient_suppliers_ingredient" ON "ingredient_suppliers" ("ingredient_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_ingredient_suppliers_supplier" ON "ingredient_suppliers" ("supplier_id")
    `);

    // ────────── UNIT CONVERSIONS TABLE ──────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "unit_conversions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "restaurant_id" uuid,
        "ingredient_id" uuid,
        "from_unit" varchar(20) NOT NULL,
        "to_unit" varchar(20) NOT NULL,
        "factor" decimal(10,4) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_unit_conversions" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_unit_conversions_restaurant" ON "unit_conversions" ("restaurant_id")
    `);

    // ────────── ADD supplier_id TO ingredient_prices ──────────
    await queryRunner.query(`
      ALTER TABLE "ingredient_prices"
        ADD COLUMN IF NOT EXISTS "supplier_id" uuid
        REFERENCES "suppliers"("id") ON DELETE SET NULL
    `);

    // ────────── ADD supplier_id TO purchase_records ──────────
    await queryRunner.query(`
      ALTER TABLE "purchase_records"
        ADD COLUMN IF NOT EXISTS "supplier_id" uuid
        REFERENCES "suppliers"("id") ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove supplier_id columns
    await queryRunner.query(`
      ALTER TABLE "purchase_records" DROP COLUMN IF EXISTS "supplier_id"
    `);
    await queryRunner.query(`
      ALTER TABLE "ingredient_prices" DROP COLUMN IF EXISTS "supplier_id"
    `);

    // Drop tables in reverse dependency order
    await queryRunner.query(`DROP TABLE IF EXISTS "unit_conversions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ingredient_suppliers"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "suppliers"`);
  }
}

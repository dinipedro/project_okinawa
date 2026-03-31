import { MigrationInterface, QueryRunner } from 'typeorm';

export class GapSprint2StockCRM1765600000002 implements MigrationInterface {
  name = 'GapSprint2StockCRM1765600000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ────────── STOCK ITEMS TABLE ──────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "stock_items" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "ingredient_id" uuid NOT NULL,
        "restaurant_id" uuid NOT NULL,
        "current_quantity" decimal(10,4) NOT NULL DEFAULT 0,
        "unit" varchar(20) NOT NULL,
        "min_quantity" decimal(10,4),
        "last_purchase_price" decimal(10,4),
        "last_purchase_date" date,
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_stock_items" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_stock_ingredient_restaurant" UNIQUE ("ingredient_id", "restaurant_id"),
        CONSTRAINT "FK_stock_ingredient" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_stock_restaurant" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_stock_restaurant" ON "stock_items" ("restaurant_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_stock_ingredient" ON "stock_items" ("ingredient_id")
    `);

    // ────────── PURCHASE RECORDS TABLE ──────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "purchase_records" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "restaurant_id" uuid NOT NULL,
        "supplier_name" varchar(200) NOT NULL,
        "invoice_number" varchar(100),
        "invoice_date" date NOT NULL,
        "total_amount" decimal(10,2) NOT NULL DEFAULT 0,
        "items" jsonb NOT NULL DEFAULT '[]',
        "import_method" varchar(20) NOT NULL DEFAULT 'manual',
        "status" varchar(20) NOT NULL DEFAULT 'pending_match',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "created_by" uuid,
        CONSTRAINT "PK_purchase_records" PRIMARY KEY ("id"),
        CONSTRAINT "FK_purchase_restaurant" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_purchase_restaurant" ON "purchase_records" ("restaurant_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_purchase_status" ON "purchase_records" ("status")
    `);

    // ────────── CUSTOMER PROFILES TABLE (CRM) ──────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "customer_profiles" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "restaurant_id" uuid NOT NULL,
        "total_visits" int NOT NULL DEFAULT 0,
        "total_spent" decimal(10,2) NOT NULL DEFAULT 0,
        "avg_ticket" decimal(10,2) NOT NULL DEFAULT 0,
        "last_visit_at" timestamptz,
        "favorite_items" jsonb NOT NULL DEFAULT '[]',
        "dietary_preferences" jsonb NOT NULL DEFAULT '[]',
        "segment" varchar(20) NOT NULL DEFAULT 'new',
        "birthday" date,
        "notes" text,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_customer_profiles" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_customer_user_restaurant" UNIQUE ("user_id", "restaurant_id"),
        CONSTRAINT "FK_customer_user" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_customer_restaurant" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_customer_profile_restaurant" ON "customer_profiles" ("restaurant_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_customer_profile_segment" ON "customer_profiles" ("segment")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_customer_profile_user" ON "customer_profiles" ("user_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "customer_profiles"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "purchase_records"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "stock_items"`);
  }
}

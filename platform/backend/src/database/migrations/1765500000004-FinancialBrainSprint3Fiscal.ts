import { MigrationInterface, QueryRunner } from 'typeorm';

export class FinancialBrainSprint3Fiscal1765500000004 implements MigrationInterface {
  name = 'FinancialBrainSprint3Fiscal1765500000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ─── Create fiscal_documents table ─────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "fiscal_documents" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "restaurant_id" uuid NOT NULL,
        "order_id" uuid NOT NULL,
        "type" varchar(20) NOT NULL,
        "status" varchar(20) NOT NULL,
        "provider" varchar(20) NOT NULL,
        "access_key" varchar(44),
        "number" int,
        "series" int,
        "xml" text,
        "qr_code_url" text,
        "danfe_url" text,
        "protocol" text,
        "total_amount" decimal(10,2) NOT NULL,
        "items_snapshot" jsonb,
        "external_ref" varchar(255),
        "error_message" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_fiscal_documents" PRIMARY KEY ("id"),
        CONSTRAINT "FK_fiscal_documents_restaurant" FOREIGN KEY ("restaurant_id")
          REFERENCES "restaurants"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_fiscal_documents_order" FOREIGN KEY ("order_id")
          REFERENCES "orders"("id") ON DELETE CASCADE
      )
    `);

    // ─── Create fiscal_configs table ───────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "fiscal_configs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "restaurant_id" uuid NOT NULL,
        "cnpj" varchar(14) NOT NULL,
        "ie" varchar(15),
        "razao_social" varchar(200) NOT NULL,
        "nome_fantasia" varchar(200),
        "state_code" varchar(2) NOT NULL,
        "endereco" jsonb NOT NULL,
        "regime_tributario" varchar(30) NOT NULL,
        "tax_defaults" jsonb NOT NULL,
        "csc_id" varchar(10),
        "csc_token" varchar(255),
        "current_series" int NOT NULL DEFAULT 1,
        "next_number" int NOT NULL DEFAULT 1,
        "fiscal_provider" varchar(20) NOT NULL DEFAULT 'focus_nfe',
        "focus_nfe_token" varchar(255),
        "certificate_uploaded" boolean NOT NULL DEFAULT false,
        "certificate_base64" text,
        "certificate_password" varchar(255),
        "auto_emit" boolean NOT NULL DEFAULT true,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_fiscal_configs" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_fiscal_configs_restaurant" UNIQUE ("restaurant_id"),
        CONSTRAINT "FK_fiscal_configs_restaurant" FOREIGN KEY ("restaurant_id")
          REFERENCES "restaurants"("id") ON DELETE CASCADE
      )
    `);

    // ─── Create delivery_settlements table ─────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "delivery_settlements" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "restaurant_id" uuid NOT NULL,
        "platform" varchar(20) NOT NULL,
        "settlement_date" date NOT NULL,
        "gross_amount" decimal(10,2) NOT NULL,
        "commission_amount" decimal(10,2) NOT NULL,
        "expected_net" decimal(10,2) NOT NULL,
        "actual_received" decimal(10,2),
        "difference" decimal(10,2),
        "status" varchar(20) NOT NULL DEFAULT 'pending',
        "order_count" int NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_delivery_settlements" PRIMARY KEY ("id"),
        CONSTRAINT "FK_delivery_settlements_restaurant" FOREIGN KEY ("restaurant_id")
          REFERENCES "restaurants"("id") ON DELETE CASCADE
      )
    `);

    // ─── Alter menu_items: add ncm and cfop columns ────────────────────────
    await queryRunner.query(`
      ALTER TABLE "menu_items" ADD COLUMN "ncm" varchar(8) DEFAULT '00000000'
    `);
    await queryRunner.query(`
      ALTER TABLE "menu_items" ADD COLUMN "cfop" varchar(4) DEFAULT '5102'
    `);

    // ─── Indexes ───────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE INDEX "idx_fiscal_docs_order" ON "fiscal_documents" ("order_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_fiscal_docs_restaurant" ON "fiscal_documents" ("restaurant_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_fiscal_docs_access_key" ON "fiscal_documents" ("access_key")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_fiscal_configs_restaurant" ON "fiscal_configs" ("restaurant_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_delivery_settlements_restaurant" ON "delivery_settlements" ("restaurant_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_delivery_settlements_platform" ON "delivery_settlements" ("platform")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_delivery_settlements_status" ON "delivery_settlements" ("status")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_delivery_settlements_date" ON "delivery_settlements" ("settlement_date")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_delivery_settlements_date"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_delivery_settlements_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_delivery_settlements_platform"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_delivery_settlements_restaurant"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_fiscal_configs_restaurant"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_fiscal_docs_access_key"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_fiscal_docs_restaurant"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_fiscal_docs_order"`);

    // Remove ncm and cfop from menu_items
    await queryRunner.query(`ALTER TABLE "menu_items" DROP COLUMN IF EXISTS "cfop"`);
    await queryRunner.query(`ALTER TABLE "menu_items" DROP COLUMN IF EXISTS "ncm"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE IF EXISTS "delivery_settlements"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "fiscal_configs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "fiscal_documents"`);
  }
}

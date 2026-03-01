import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableQRCodeAndSessionTables1704000000001 implements MigrationInterface {
  name = 'CreateTableQRCodeAndSessionTables1704000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "qr_code_style_enum" AS ENUM ('minimal', 'premium', 'bold', 'elegant');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "session_status_enum" AS ENUM ('active', 'completed', 'abandoned');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "scan_result_enum" AS ENUM ('success', 'invalid', 'expired', 'revoked');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create table_qr_codes table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "table_qr_codes" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "restaurant_id" uuid NOT NULL,
        "table_id" uuid NOT NULL,
        "qr_code_data" text NOT NULL,
        "qr_code_image" text,
        "signature" varchar(64) NOT NULL,
        "style" qr_code_style_enum DEFAULT 'minimal',
        "color_primary" varchar(7) DEFAULT '#000000',
        "color_secondary" varchar(7),
        "logo_included" boolean DEFAULT false,
        "version" int DEFAULT 1,
        "is_active" boolean DEFAULT true,
        "expires_at" timestamptz,
        "generated_by" uuid,
        "created_at" timestamptz DEFAULT NOW(),
        "updated_at" timestamptz DEFAULT NOW(),
        CONSTRAINT "fk_qr_codes_restaurant" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_qr_codes_table" FOREIGN KEY ("table_id") REFERENCES "tables"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_qr_codes_generator" FOREIGN KEY ("generated_by") REFERENCES "profiles"("id") ON DELETE SET NULL,
        CONSTRAINT "uq_qr_codes_table_version" UNIQUE ("table_id", "version")
      )
    `);

    // Create table_sessions table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "table_sessions" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "restaurant_id" uuid NOT NULL,
        "table_id" uuid NOT NULL,
        "qr_code_id" uuid,
        "customer_id" uuid,
        "guest_name" varchar(100),
        "guest_count" int DEFAULT 1,
        "status" session_status_enum DEFAULT 'active',
        "started_at" timestamptz DEFAULT NOW(),
        "last_activity" timestamptz DEFAULT NOW(),
        "ended_at" timestamptz,
        "total_orders" int DEFAULT 0,
        "total_spent" decimal(10,2) DEFAULT 0,
        "created_at" timestamptz DEFAULT NOW(),
        "updated_at" timestamptz DEFAULT NOW(),
        CONSTRAINT "fk_sessions_restaurant" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_sessions_table" FOREIGN KEY ("table_id") REFERENCES "tables"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_sessions_qr_code" FOREIGN KEY ("qr_code_id") REFERENCES "table_qr_codes"("id") ON DELETE SET NULL,
        CONSTRAINT "fk_sessions_customer" FOREIGN KEY ("customer_id") REFERENCES "profiles"("id") ON DELETE SET NULL
      )
    `);

    // Create qr_scan_logs table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "qr_scan_logs" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "qr_code_id" uuid NOT NULL,
        "restaurant_id" uuid NOT NULL,
        "table_id" uuid NOT NULL,
        "scanned_by" uuid,
        "device_info" jsonb,
        "ip_address" inet,
        "scan_result" scan_result_enum NOT NULL,
        "session_id" uuid,
        "scanned_at" timestamptz DEFAULT NOW(),
        CONSTRAINT "fk_scan_logs_qr_code" FOREIGN KEY ("qr_code_id") REFERENCES "table_qr_codes"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_scan_logs_restaurant" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_scan_logs_table" FOREIGN KEY ("table_id") REFERENCES "tables"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_scan_logs_scanner" FOREIGN KEY ("scanned_by") REFERENCES "profiles"("id") ON DELETE SET NULL,
        CONSTRAINT "fk_scan_logs_session" FOREIGN KEY ("session_id") REFERENCES "table_sessions"("id") ON DELETE SET NULL
      )
    `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_qr_codes_restaurant" ON "table_qr_codes" ("restaurant_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_qr_codes_table" ON "table_qr_codes" ("table_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_qr_codes_active" ON "table_qr_codes" ("is_active") WHERE is_active = true`);
    
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_sessions_restaurant" ON "table_sessions" ("restaurant_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_sessions_table" ON "table_sessions" ("table_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_sessions_customer" ON "table_sessions" ("customer_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_sessions_active" ON "table_sessions" ("status") WHERE status = 'active'`);
    
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_scan_logs_qr" ON "qr_scan_logs" ("qr_code_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_scan_logs_time" ON "qr_scan_logs" ("scanned_at" DESC)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_scan_logs_restaurant" ON "qr_scan_logs" ("restaurant_id")`);

    // Add qr_code_id column to tables if not exists
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "tables" ADD COLUMN "qr_code_id" uuid REFERENCES "table_qr_codes"("id") ON DELETE SET NULL;
      EXCEPTION
        WHEN duplicate_column THEN null;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove qr_code_id from tables
    await queryRunner.query(`ALTER TABLE "tables" DROP COLUMN IF EXISTS "qr_code_id"`);

    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_scan_logs_restaurant"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_scan_logs_time"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_scan_logs_qr"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_sessions_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_sessions_customer"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_sessions_table"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_sessions_restaurant"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_qr_codes_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_qr_codes_table"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_qr_codes_restaurant"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE IF EXISTS "qr_scan_logs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "table_sessions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "table_qr_codes"`);

    // Drop enum types
    await queryRunner.query(`DROP TYPE IF EXISTS "scan_result_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "session_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "qr_code_style_enum"`);
  }
}

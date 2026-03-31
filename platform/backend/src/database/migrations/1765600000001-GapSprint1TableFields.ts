import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * GAP Sprint 1 — Schema changes:
 *
 * GAP-1: Add occupied_since to tables (for auto-status tracking)
 * GAP-4: Add shape, width, height to tables (for floor plan rendering)
 * GAP-5: Add table_id to receipts (for table-specific queries)
 */
export class GapSprint1TableFields1765600000001 implements MigrationInterface {
  name = 'GapSprint1TableFields1765600000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // GAP-1: occupied_since for auto-status tracking
    await queryRunner.query(`
      ALTER TABLE "tables"
      ADD COLUMN IF NOT EXISTS "occupied_since" TIMESTAMPTZ
    `);

    // GAP-4: shape, width, height for floor plan rendering
    await queryRunner.query(`
      ALTER TABLE "tables"
      ADD COLUMN IF NOT EXISTS "shape" VARCHAR(20) NOT NULL DEFAULT 'square'
    `);

    await queryRunner.query(`
      ALTER TABLE "tables"
      ADD COLUMN IF NOT EXISTS "width" INT NOT NULL DEFAULT 1
    `);

    await queryRunner.query(`
      ALTER TABLE "tables"
      ADD COLUMN IF NOT EXISTS "height" INT NOT NULL DEFAULT 1
    `);

    // GAP-5: table_id on receipts for fast table-specific queries
    await queryRunner.query(`
      ALTER TABLE "receipts"
      ADD COLUMN IF NOT EXISTS "table_id" UUID
    `);

    // Index for table_id on receipts
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_receipts_table" ON "receipts" ("table_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_receipts_table"`);
    await queryRunner.query(`ALTER TABLE "receipts" DROP COLUMN IF EXISTS "table_id"`);
    await queryRunner.query(`ALTER TABLE "tables" DROP COLUMN IF EXISTS "height"`);
    await queryRunner.query(`ALTER TABLE "tables" DROP COLUMN IF EXISTS "width"`);
    await queryRunner.query(`ALTER TABLE "tables" DROP COLUMN IF EXISTS "shape"`);
    await queryRunner.query(`ALTER TABLE "tables" DROP COLUMN IF EXISTS "occupied_since"`);
  }
}

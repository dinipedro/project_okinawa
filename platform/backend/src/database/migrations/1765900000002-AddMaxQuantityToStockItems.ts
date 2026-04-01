import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMaxQuantityToStockItems1765900000002
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Idempotent: max_quantity may already exist from an earlier migration.
    await queryRunner.query(`
      ALTER TABLE "stock_items"
        ADD COLUMN IF NOT EXISTS "max_quantity" DECIMAL(10,2) NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "stock_items"
        DROP COLUMN IF EXISTS "max_quantity";
    `);
  }
}

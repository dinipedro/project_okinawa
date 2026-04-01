import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWalletTransactionIdempotencyKey1765800000003
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "wallet_transactions"
        ADD COLUMN "idempotency_key" varchar(255) NULL;
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_wallet_tx_idempotency"
        ON "wallet_transactions" ("idempotency_key")
        WHERE "idempotency_key" IS NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "UQ_wallet_tx_idempotency";
    `);

    await queryRunner.query(`
      ALTER TABLE "wallet_transactions"
        DROP COLUMN IF EXISTS "idempotency_key";
    `);
  }
}

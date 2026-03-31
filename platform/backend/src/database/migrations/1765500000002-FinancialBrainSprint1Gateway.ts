import { MigrationInterface, QueryRunner } from 'typeorm';

export class FinancialBrainSprint1Gateway1765500000002
  implements MigrationInterface
{
  name = 'FinancialBrainSprint1Gateway1765500000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ─── gateway_configs ──────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "gateway_configs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "restaurant_id" uuid NOT NULL,
        "provider" varchar(20) NOT NULL,
        "credentials" jsonb NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "settings" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_gateway_configs" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_gateway_configs_restaurant_provider"
          UNIQUE ("restaurant_id", "provider"),
        CONSTRAINT "FK_gateway_configs_restaurant" FOREIGN KEY ("restaurant_id")
          REFERENCES "restaurants"("id") ON DELETE CASCADE
      )
    `);

    // ─── gateway_transactions ─────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "gateway_transactions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "restaurant_id" uuid NOT NULL,
        "order_id" uuid,
        "provider" varchar(20) NOT NULL,
        "external_id" varchar(255),
        "payment_method" varchar(20) NOT NULL,
        "amount_cents" int NOT NULL,
        "status" varchar(30) NOT NULL DEFAULT 'pending',
        "idempotency_key" varchar(255) NOT NULL,
        "correlation_id" varchar(255),
        "metadata" jsonb,
        "error_code" varchar(50),
        "error_message" text,
        "refunded_amount_cents" int NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_gateway_transactions" PRIMARY KEY ("id"),
        CONSTRAINT "FK_gateway_transactions_order" FOREIGN KEY ("order_id")
          REFERENCES "orders"("id") ON DELETE SET NULL
      )
    `);

    // ─── Indexes for gateway_transactions ─────────────────────────────────────
    await queryRunner.query(`
      CREATE INDEX "idx_gateway_tx_order" ON "gateway_transactions" ("order_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_gateway_tx_external" ON "gateway_transactions" ("external_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_gateway_tx_idempotency" ON "gateway_transactions" ("idempotency_key")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_gateway_tx_restaurant" ON "gateway_transactions" ("restaurant_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "idx_gateway_tx_restaurant"`);
    await queryRunner.query(`DROP INDEX "idx_gateway_tx_idempotency"`);
    await queryRunner.query(`DROP INDEX "idx_gateway_tx_external"`);
    await queryRunner.query(`DROP INDEX "idx_gateway_tx_order"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "gateway_transactions"`);
    await queryRunner.query(`DROP TABLE "gateway_configs"`);
  }
}

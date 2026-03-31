import { MigrationInterface, QueryRunner } from 'typeorm';

export class FinancialBrainSprint4Forecast1765500000005 implements MigrationInterface {
  name = 'FinancialBrainSprint4Forecast1765500000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ─── Create bills table (accounts payable) ─────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "bills" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "restaurant_id" uuid NOT NULL,
        "description" varchar(200) NOT NULL,
        "supplier" varchar(200),
        "category" varchar(50) NOT NULL,
        "amount" decimal(10,2) NOT NULL,
        "due_date" date NOT NULL,
        "paid_date" date,
        "status" varchar(20) NOT NULL DEFAULT 'pending',
        "is_recurring" boolean NOT NULL DEFAULT false,
        "recurrence" varchar(20),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_bills" PRIMARY KEY ("id"),
        CONSTRAINT "FK_bills_restaurant" FOREIGN KEY ("restaurant_id")
          REFERENCES "restaurants"("id") ON DELETE CASCADE
      )
    `);

    // ─── Indexes ───────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE INDEX "idx_bills_restaurant" ON "bills" ("restaurant_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_bills_status" ON "bills" ("status")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_bills_due_date" ON "bills" ("due_date")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_bills_restaurant_status" ON "bills" ("restaurant_id", "status")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_bills_restaurant_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_bills_due_date"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_bills_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_bills_restaurant"`);

    // Drop table
    await queryRunner.query(`DROP TABLE IF EXISTS "bills"`);
  }
}

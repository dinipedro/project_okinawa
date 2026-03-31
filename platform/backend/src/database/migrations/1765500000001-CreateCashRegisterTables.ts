import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCashRegisterTables1765500000001 implements MigrationInterface {
  name = 'CreateCashRegisterTables1765500000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create cash_register_sessions table
    await queryRunner.query(`
      CREATE TABLE "cash_register_sessions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "restaurant_id" uuid NOT NULL,
        "opened_by" uuid NOT NULL,
        "closed_by" uuid,
        "opening_balance" decimal(10,2) NOT NULL,
        "expected_balance" decimal(10,2),
        "actual_balance" decimal(10,2),
        "difference" decimal(10,2),
        "status" varchar(20) NOT NULL DEFAULT 'open',
        "opened_at" TIMESTAMP NOT NULL DEFAULT now(),
        "closed_at" TIMESTAMP,
        "closing_notes" text,
        CONSTRAINT "PK_cash_register_sessions" PRIMARY KEY ("id")
      )
    `);

    // Create cash_register_movements table
    await queryRunner.query(`
      CREATE TABLE "cash_register_movements" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "session_id" uuid NOT NULL,
        "type" varchar(20) NOT NULL,
        "amount" decimal(10,2) NOT NULL,
        "is_cash" boolean NOT NULL,
        "order_id" uuid,
        "created_by" uuid NOT NULL,
        "description" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_cash_register_movements" PRIMARY KEY ("id"),
        CONSTRAINT "FK_cash_register_movements_session" FOREIGN KEY ("session_id")
          REFERENCES "cash_register_sessions"("id") ON DELETE CASCADE
      )
    `);

    // Indexes for sessions
    await queryRunner.query(`
      CREATE INDEX "idx_cash_register_sessions_restaurant" ON "cash_register_sessions" ("restaurant_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_cash_register_sessions_status" ON "cash_register_sessions" ("status")
    `);

    // Indexes for movements
    await queryRunner.query(`
      CREATE INDEX "idx_cash_register_movements_session" ON "cash_register_movements" ("session_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_cash_register_movements_type" ON "cash_register_movements" ("type")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_cash_register_movements_type"`);
    await queryRunner.query(`DROP INDEX "idx_cash_register_movements_session"`);
    await queryRunner.query(`DROP INDEX "idx_cash_register_sessions_status"`);
    await queryRunner.query(`DROP INDEX "idx_cash_register_sessions_restaurant"`);
    await queryRunner.query(`DROP TABLE "cash_register_movements"`);
    await queryRunner.query(`DROP TABLE "cash_register_sessions"`);
  }
}

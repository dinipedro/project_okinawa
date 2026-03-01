import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to add missing indexes on foreign keys
 * HI_054: Missing indexes em FKs (webhook_deliveries, etc.)
 */
export class AddMissingForeignKeyIndexes1733593400000 implements MigrationInterface {
  name = 'AddMissingForeignKeyIndexes1733593400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Webhook deliveries - FK indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_webhook_deliveries_subscription_id"
      ON "webhook_deliveries" ("subscription_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_webhook_deliveries_status"
      ON "webhook_deliveries" ("status")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_webhook_deliveries_created_at"
      ON "webhook_deliveries" ("created_at" DESC)
    `);

    // Webhook subscriptions - FK and status indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_webhook_subscriptions_restaurant_id"
      ON "webhook_subscriptions" ("restaurant_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_webhook_subscriptions_active"
      ON "webhook_subscriptions" ("is_active")
    `);

    // Order guests - FK indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_order_guests_order_id"
      ON "order_guests" ("order_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_order_guests_user_id"
      ON "order_guests" ("guest_user_id")
    `);

    // Reservation guests - FK indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_reservation_guests_reservation_id"
      ON "reservation_guests" ("reservation_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_reservation_guests_user_id"
      ON "reservation_guests" ("guest_user_id")
    `);

    // Payment splits - FK indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_payment_splits_order_id"
      ON "payment_splits" ("order_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_payment_splits_user_id"
      ON "payment_splits" ("guest_user_id")
    `);

    // Token blacklist - indexes for fast lookup
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_token_blacklist_user_id"
      ON "token_blacklist" ("user_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_token_blacklist_expires_at"
      ON "token_blacklist" ("expires_at")
    `);

    // Password reset tokens - indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_password_reset_tokens_user_id"
      ON "password_reset_tokens" ("user_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_password_reset_tokens_expires_at"
      ON "password_reset_tokens" ("expires_at")
    `);

    // Wallet transactions - FK indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_wallet_transactions_wallet_id"
      ON "wallet_transactions" ("wallet_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_wallet_transactions_created_at"
      ON "wallet_transactions" ("created_at" DESC)
    `);

    // Leave requests - FK indexes (HR)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_leave_requests_employee_id"
      ON "leave_requests" ("employee_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_leave_requests_restaurant_id"
      ON "leave_requests" ("restaurant_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_leave_requests_status"
      ON "leave_requests" ("status")
    `);

    // Shifts - FK indexes (HR)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_shifts_employee_id"
      ON "shifts" ("employee_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_shifts_restaurant_id"
      ON "shifts" ("restaurant_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop all indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_webhook_deliveries_subscription_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_webhook_deliveries_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_webhook_deliveries_created_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_webhook_subscriptions_restaurant_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_webhook_subscriptions_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_order_guests_order_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_order_guests_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_reservation_guests_reservation_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_reservation_guests_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_payment_splits_order_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_payment_splits_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_token_blacklist_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_token_blacklist_expires_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_password_reset_tokens_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_password_reset_tokens_expires_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_wallet_transactions_wallet_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_wallet_transactions_created_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_leave_requests_employee_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_leave_requests_restaurant_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_leave_requests_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_shifts_employee_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_shifts_restaurant_id"`);
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to add missing constraints, indexes, and enum types
 * HI_071-087: Entity improvements
 */
export class AddEntityConstraintsAndIndexes1733593500000 implements MigrationInterface {
  name = 'AddEntityConstraintsAndIndexes1733593500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ========== ENUMS ==========

    // Create notification_type enum if not exists
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE notification_type_enum AS ENUM (
          'order_placed', 'order_confirmed', 'order_ready', 'order_delivered', 'order_cancelled',
          'reservation_confirmed', 'reservation_reminder', 'reservation_cancelled',
          'payment_received', 'payment_failed',
          'loyalty_points_earned', 'loyalty_tier_upgrade', 'loyalty_reward_available',
          'promotion', 'system', 'review_request', 'review_response'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create related_type enum if not exists
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE related_type_enum AS ENUM (
          'order', 'reservation', 'payment', 'loyalty', 'review', 'restaurant', 'promotion'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create reference_type enum for financial transactions
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE reference_type_enum AS ENUM (
          'order', 'payment', 'tip', 'refund', 'manual'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // ========== CHECK CONSTRAINTS ==========

    // Review rating constraints (1-5)
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE reviews ADD CONSTRAINT "CHK_review_rating" CHECK (rating >= 1 AND rating <= 5);
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE reviews ADD CONSTRAINT "CHK_review_food_rating"
        CHECK (food_rating IS NULL OR (food_rating >= 1 AND food_rating <= 5));
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE reviews ADD CONSTRAINT "CHK_review_service_rating"
        CHECK (service_rating IS NULL OR (service_rating >= 1 AND service_rating <= 5));
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE reviews ADD CONSTRAINT "CHK_review_ambiance_rating"
        CHECK (ambiance_rating IS NULL OR (ambiance_rating >= 1 AND ambiance_rating <= 5));
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE reviews ADD CONSTRAINT "CHK_review_value_rating"
        CHECK (value_rating IS NULL OR (value_rating >= 1 AND value_rating <= 5));
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Payment split constraints
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE payment_splits ADD CONSTRAINT "CHK_payment_split_amount_due"
        CHECK (amount_due >= 0);
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE payment_splits ADD CONSTRAINT "CHK_payment_split_amount_paid"
        CHECK (amount_paid >= 0 AND amount_paid <= amount_due);
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // ========== UNIQUE CONSTRAINTS ==========

    // Order guest unique (order_id + guest_user_id)
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE order_guests ADD CONSTRAINT "UQ_order_guest_user"
        UNIQUE (order_id, guest_user_id);
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Reservation guest unique (reservation_id + guest_user_id)
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE reservation_guests ADD CONSTRAINT "UQ_reservation_guest_user"
        UNIQUE (reservation_id, guest_user_id);
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Payment split unique (order_id + guest_user_id)
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE payment_splits ADD CONSTRAINT "UQ_payment_split_order_user"
        UNIQUE (order_id, guest_user_id);
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // ========== INDEXES ==========

    // Order guest indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_order_guest_order" ON order_guests (order_id);
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_order_guest_user" ON order_guests (guest_user_id);
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_order_guest_status" ON order_guests (status);
    `);

    // Reservation guest indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_reservation_guest_reservation" ON reservation_guests (reservation_id);
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_reservation_guest_user" ON reservation_guests (guest_user_id);
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_reservation_guest_status" ON reservation_guests (status);
    `);

    // Payment split indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_payment_split_order" ON payment_splits (order_id);
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_payment_split_user" ON payment_splits (guest_user_id);
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_payment_split_status" ON payment_splits (status);
    `);

    // Financial transaction indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_financial_transaction_restaurant" ON financial_transactions (restaurant_id);
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_financial_transaction_type" ON financial_transactions (type);
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_financial_transaction_date" ON financial_transactions (transaction_date);
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_financial_transaction_restaurant_date"
      ON financial_transactions (restaurant_id, transaction_date);
    `);

    // Add updated_at column to financial_transactions if not exists
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE financial_transactions ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
      EXCEPTION
        WHEN duplicate_column THEN null;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop check constraints
    await queryRunner.query(`ALTER TABLE reviews DROP CONSTRAINT IF EXISTS "CHK_review_rating"`);
    await queryRunner.query(`ALTER TABLE reviews DROP CONSTRAINT IF EXISTS "CHK_review_food_rating"`);
    await queryRunner.query(`ALTER TABLE reviews DROP CONSTRAINT IF EXISTS "CHK_review_service_rating"`);
    await queryRunner.query(`ALTER TABLE reviews DROP CONSTRAINT IF EXISTS "CHK_review_ambiance_rating"`);
    await queryRunner.query(`ALTER TABLE reviews DROP CONSTRAINT IF EXISTS "CHK_review_value_rating"`);
    await queryRunner.query(`ALTER TABLE payment_splits DROP CONSTRAINT IF EXISTS "CHK_payment_split_amount_due"`);
    await queryRunner.query(`ALTER TABLE payment_splits DROP CONSTRAINT IF EXISTS "CHK_payment_split_amount_paid"`);

    // Drop unique constraints
    await queryRunner.query(`ALTER TABLE order_guests DROP CONSTRAINT IF EXISTS "UQ_order_guest_user"`);
    await queryRunner.query(`ALTER TABLE reservation_guests DROP CONSTRAINT IF EXISTS "UQ_reservation_guest_user"`);
    await queryRunner.query(`ALTER TABLE payment_splits DROP CONSTRAINT IF EXISTS "UQ_payment_split_order_user"`);

    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_order_guest_order"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_order_guest_user"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_order_guest_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_reservation_guest_reservation"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_reservation_guest_user"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_reservation_guest_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_payment_split_order"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_payment_split_user"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_payment_split_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_financial_transaction_restaurant"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_financial_transaction_type"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_financial_transaction_date"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_financial_transaction_restaurant_date"`);

    // Drop updated_at column
    await queryRunner.query(`ALTER TABLE financial_transactions DROP COLUMN IF EXISTS updated_at`);

    // Note: ENUMs are not dropped as they may be in use
  }
}

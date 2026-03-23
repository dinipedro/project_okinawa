import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDatabaseIndexes1733593300000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Reservations indexes
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_reservation_restaurant" ON "reservations" ("restaurant_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_reservation_user" ON "reservations" ("user_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_reservation_status" ON "reservations" ("status")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_reservation_date" ON "reservations" ("reservation_date")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_reservation_restaurant_date" ON "reservations" ("restaurant_id", "reservation_date")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_reservation_restaurant_status" ON "reservations" ("restaurant_id", "status")`);

    // Reviews indexes
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_review_restaurant" ON "reviews" ("restaurant_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_review_user" ON "reviews" ("user_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_review_order" ON "reviews" ("order_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_review_rating" ON "reviews" ("rating")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_review_restaurant_visible" ON "reviews" ("restaurant_id", "is_visible")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_review_created" ON "reviews" ("created_at")`);

    // Notifications indexes
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_notification_user" ON "notifications" ("user_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_notification_read" ON "notifications" ("is_read")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_notification_user_read" ON "notifications" ("user_id", "is_read")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_notification_type" ON "notifications" ("notification_type")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_notification_created" ON "notifications" ("created_at")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_notification_user_created" ON "notifications" ("user_id", "created_at")`);

    // Loyalty programs indexes
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_loyalty_user" ON "loyalty_programs" ("user_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_loyalty_restaurant" ON "loyalty_programs" ("restaurant_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_loyalty_tier" ON "loyalty_programs" ("tier")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_loyalty_points" ON "loyalty_programs" ("points")`);
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "uq_loyalty_user_restaurant" ON "loyalty_programs" ("user_id", "restaurant_id")`);

    // Order items indexes
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_order_item_order" ON "order_items" ("order_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_order_item_menu_item" ON "order_items" ("menu_item_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_order_item_status" ON "order_items" ("status")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_order_item_ordered_by" ON "order_items" ("ordered_by")`);

    // Tips indexes
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_tip_customer" ON "tips" ("customer_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_tip_restaurant" ON "tips" ("restaurant_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_tip_staff" ON "tips" ("staff_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_tip_order" ON "tips" ("order_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_tip_status" ON "tips" ("status")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_tip_created" ON "tips" ("created_at")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_tip_restaurant_staff" ON "tips" ("restaurant_id", "staff_id")`);

    // Wallet transactions indexes
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_wallet_tx_wallet" ON "wallet_transactions" ("wallet_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_wallet_tx_type" ON "wallet_transactions" ("transaction_type")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_wallet_tx_order" ON "wallet_transactions" ("order_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_wallet_tx_created" ON "wallet_transactions" ("created_at")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_wallet_tx_wallet_created" ON "wallet_transactions" ("wallet_id", "created_at")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop reservations indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_reservation_restaurant"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_reservation_user"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_reservation_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_reservation_date"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_reservation_restaurant_date"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_reservation_restaurant_status"`);

    // Drop reviews indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_review_restaurant"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_review_user"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_review_order"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_review_rating"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_review_restaurant_visible"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_review_created"`);

    // Drop notifications indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_notification_user"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_notification_read"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_notification_user_read"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_notification_type"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_notification_created"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_notification_user_created"`);

    // Drop loyalty programs indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_loyalty_user"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_loyalty_restaurant"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_loyalty_tier"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_loyalty_points"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "uq_loyalty_user_restaurant"`);

    // Drop order items indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_order_item_order"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_order_item_menu_item"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_order_item_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_order_item_ordered_by"`);

    // Drop tips indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_tip_customer"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_tip_restaurant"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_tip_staff"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_tip_order"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_tip_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_tip_created"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_tip_restaurant_staff"`);

    // Drop wallet transactions indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_wallet_tx_wallet"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_wallet_tx_type"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_wallet_tx_order"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_wallet_tx_created"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_wallet_tx_wallet_created"`);
  }
}

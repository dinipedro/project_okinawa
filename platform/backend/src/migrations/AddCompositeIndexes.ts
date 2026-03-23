import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompositeIndexes1702000000000 implements MigrationInterface {
  name = 'AddCompositeIndexes1702000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Orders indexes for common queries
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_orders_restaurant_status_created"
      ON "orders" ("restaurant_id", "status", "created_at" DESC)
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_orders_user_status_created"
      ON "orders" ("user_id", "status", "created_at" DESC)
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_orders_restaurant_date"
      ON "orders" ("restaurant_id", "created_at" DESC)
    `);

    // Reservations indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_reservations_restaurant_date_status"
      ON "reservations" ("restaurant_id", "reservation_date", "status")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_reservations_user_date"
      ON "reservations" ("user_id", "reservation_date" DESC)
    `);

    // Menu items indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_menu_items_restaurant_category_available"
      ON "menu_items" ("restaurant_id", "category_id", "is_available")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_menu_items_restaurant_active"
      ON "menu_items" ("restaurant_id", "is_active", "display_order")
    `);

    // Reviews indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_reviews_restaurant_created"
      ON "reviews" ("restaurant_id", "created_at" DESC)
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_reviews_restaurant_rating"
      ON "reviews" ("restaurant_id", "rating")
    `);

    // Tables indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_tables_restaurant_status"
      ON "restaurant_tables" ("restaurant_id", "status")
    `);

    // Order items indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_order_items_order_status"
      ON "order_items" ("order_id", "status")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_order_items_menu_item"
      ON "order_items" ("menu_item_id", "created_at" DESC)
    `);

    // Payments indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_payments_order_status"
      ON "payments" ("order_id", "status")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_payments_user_created"
      ON "payments" ("user_id", "created_at" DESC)
    `);

    // Loyalty points indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_loyalty_user_restaurant"
      ON "loyalty_programs" ("user_id", "restaurant_id")
    `);

    // Tips indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_tips_restaurant_date"
      ON "tips" ("restaurant_id", "created_at" DESC)
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_tips_staff_date"
      ON "tips" ("staff_id", "created_at" DESC)
    `);

    // Notifications indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_notifications_user_read"
      ON "notifications" ("user_id", "is_read", "created_at" DESC)
    `);

    // Attendance indexes (HR)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_attendance_restaurant_date"
      ON "attendance" ("restaurant_id", "date" DESC)
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_attendance_employee_date"
      ON "attendance" ("employee_id", "date" DESC)
    `);

    // Financial transactions indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_financial_restaurant_date"
      ON "financial_transactions" ("restaurant_id", "transaction_date" DESC)
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_financial_restaurant_type"
      ON "financial_transactions" ("restaurant_id", "type", "transaction_date" DESC)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop all indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_orders_restaurant_status_created"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_orders_user_status_created"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_orders_restaurant_date"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_reservations_restaurant_date_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_reservations_user_date"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_menu_items_restaurant_category_available"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_menu_items_restaurant_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_reviews_restaurant_created"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_reviews_restaurant_rating"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_tables_restaurant_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_order_items_order_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_order_items_menu_item"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_payments_order_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_payments_user_created"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_loyalty_user_restaurant"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_tips_restaurant_date"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_tips_staff_date"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_notifications_user_read"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_attendance_restaurant_date"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_attendance_employee_date"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_financial_restaurant_date"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_financial_restaurant_type"`);
  }
}

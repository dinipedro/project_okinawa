import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrderTypeAndIndexes1764800000000 implements MigrationInterface {
  name = 'AddOrderTypeAndIndexes1764800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create order_type enum
    await queryRunner.query(`
      CREATE TYPE "order_type_enum" AS ENUM ('delivery', 'pickup', 'dine_in')
    `);

    // Add order_type column to orders table
    await queryRunner.query(`
      ALTER TABLE "orders"
      ADD COLUMN "order_type" "order_type_enum" NOT NULL DEFAULT 'dine_in'
    `);

    // Create indexes on orders table
    await queryRunner.query(`
      CREATE INDEX "IDX_orders_restaurant_id" ON "orders" ("restaurant_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_orders_user_id" ON "orders" ("user_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_orders_status" ON "orders" ("status")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_orders_created_at" ON "orders" ("created_at")
    `);

    // Create indexes on order_items table
    await queryRunner.query(`
      CREATE INDEX "IDX_order_items_order_id" ON "order_items" ("order_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_order_items_menu_item_id" ON "order_items" ("menu_item_id")
    `);

    // Create indexes on reservations table
    await queryRunner.query(`
      CREATE INDEX "IDX_reservations_restaurant_id" ON "reservations" ("restaurant_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_reservations_user_id" ON "reservations" ("user_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_reservations_status" ON "reservations" ("status")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_reservations_reservation_time" ON "reservations" ("reservation_time")
    `);

    // Create indexes on menu_items table
    await queryRunner.query(`
      CREATE INDEX "IDX_menu_items_restaurant_id" ON "menu_items" ("restaurant_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_menu_items_category_id" ON "menu_items" ("category_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_menu_items_is_available" ON "menu_items" ("is_available")
    `);

    // Create indexes on reviews table (if exists)
    const reviewsExists = await queryRunner.hasTable('reviews');
    if (reviewsExists) {
      await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_reviews_restaurant_id" ON "reviews" ("restaurant_id")`);
      await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_reviews_user_id" ON "reviews" ("user_id")`);
    }

    // Create indexes on payments table (if exists)
    const paymentsExists = await queryRunner.hasTable('payments');
    if (paymentsExists) {
      await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_payments_order_id" ON "payments" ("order_id")`);
      await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_payments_user_id" ON "payments" ("user_id")`);
      await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_payments_status" ON "payments" ("status")`);
    }

    // Create indexes on tips table (if exists)
    const tipsExists = await queryRunner.hasTable('tips');
    if (tipsExists) {
      await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_tips_order_id" ON "tips" ("order_id")`);
      await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_tips_restaurant_id" ON "tips" ("restaurant_id")`);
    }

    // Create indexes on loyalty table (if exists)
    const loyaltyExists = await queryRunner.hasTable('loyalty');
    if (loyaltyExists) {
      await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_loyalty_user_id" ON "loyalty" ("user_id")`);
      await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_loyalty_restaurant_id" ON "loyalty" ("restaurant_id")`);
    }

    // Create indexes on tables table
    await queryRunner.query(`
      CREATE INDEX "IDX_tables_restaurant_id" ON "tables" ("restaurant_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_tables_status" ON "tables" ("status")
    `);

    // Create indexes on user_roles table
    await queryRunner.query(`
      CREATE INDEX "IDX_user_roles_user_id" ON "user_roles" ("user_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_user_roles_restaurant_id" ON "user_roles" ("restaurant_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes (using IF EXISTS for optional tables)
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_roles_restaurant_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_roles_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_tables_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_tables_restaurant_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_loyalty_restaurant_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_loyalty_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_tips_restaurant_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_tips_order_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_payments_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_payments_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_payments_order_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_reviews_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_reviews_restaurant_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_menu_items_is_available"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_menu_items_category_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_menu_items_restaurant_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_reservations_reservation_time"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_reservations_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_reservations_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_reservations_restaurant_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_order_items_menu_item_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_order_items_order_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_orders_created_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_orders_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_orders_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_orders_restaurant_id"`);

    // Remove order_type column
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "order_type"`);

    // Drop order_type enum
    await queryRunner.query(`DROP TYPE "order_type_enum"`);
  }
}

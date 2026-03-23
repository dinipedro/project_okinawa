import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixCascadePolicies1764800100000 implements MigrationInterface {
  name = 'FixCascadePolicies1764800100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop existing foreign key constraints
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints
                   WHERE constraint_name = 'FK_orders_restaurant_id') THEN
          ALTER TABLE "orders" DROP CONSTRAINT "FK_orders_restaurant_id";
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints
                   WHERE constraint_name = 'FK_orders_user_id') THEN
          ALTER TABLE "orders" DROP CONSTRAINT "FK_orders_user_id";
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints
                   WHERE constraint_name = 'FK_orders_table_id') THEN
          ALTER TABLE "orders" DROP CONSTRAINT "FK_orders_table_id";
        END IF;
      END $$;
    `);

    // Order items foreign keys
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints
                   WHERE constraint_name = 'FK_order_items_order_id') THEN
          ALTER TABLE "order_items" DROP CONSTRAINT "FK_order_items_order_id";
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints
                   WHERE constraint_name = 'FK_order_items_menu_item_id') THEN
          ALTER TABLE "order_items" DROP CONSTRAINT "FK_order_items_menu_item_id";
        END IF;
      END $$;
    `);

    // Menu items foreign keys
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints
                   WHERE constraint_name = 'FK_menu_items_restaurant_id') THEN
          ALTER TABLE "menu_items" DROP CONSTRAINT "FK_menu_items_restaurant_id";
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints
                   WHERE constraint_name = 'FK_menu_items_category_id') THEN
          ALTER TABLE "menu_items" DROP CONSTRAINT "FK_menu_items_category_id";
        END IF;
      END $$;
    `);

    // Recreate foreign keys with proper CASCADE policies

    // Orders table - NO ACTION for user (preserve history), CASCADE for restaurant
    await queryRunner.query(`
      ALTER TABLE "orders"
      ADD CONSTRAINT "FK_orders_restaurant_id"
      FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id")
      ON DELETE CASCADE ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "orders"
      ADD CONSTRAINT "FK_orders_user_id"
      FOREIGN KEY ("user_id") REFERENCES "profiles"("id")
      ON DELETE NO ACTION ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "orders"
      ADD CONSTRAINT "FK_orders_table_id"
      FOREIGN KEY ("table_id") REFERENCES "tables"("id")
      ON DELETE SET NULL ON UPDATE CASCADE
    `);

    // Order items - CASCADE on order deletion
    await queryRunner.query(`
      ALTER TABLE "order_items"
      ADD CONSTRAINT "FK_order_items_order_id"
      FOREIGN KEY ("order_id") REFERENCES "orders"("id")
      ON DELETE CASCADE ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "order_items"
      ADD CONSTRAINT "FK_order_items_menu_item_id"
      FOREIGN KEY ("menu_item_id") REFERENCES "menu_items"("id")
      ON DELETE NO ACTION ON UPDATE CASCADE
    `);

    // Menu items - CASCADE on restaurant, SET NULL on category
    await queryRunner.query(`
      ALTER TABLE "menu_items"
      ADD CONSTRAINT "FK_menu_items_restaurant_id"
      FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id")
      ON DELETE CASCADE ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "menu_items"
      ADD CONSTRAINT "FK_menu_items_category_id"
      FOREIGN KEY ("category_id") REFERENCES "menu_categories"("id")
      ON DELETE SET NULL ON UPDATE CASCADE
    `);

    // Reservations
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints
                   WHERE constraint_name = 'FK_reservations_restaurant_id') THEN
          ALTER TABLE "reservations" DROP CONSTRAINT "FK_reservations_restaurant_id";
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints
                   WHERE constraint_name = 'FK_reservations_user_id') THEN
          ALTER TABLE "reservations" DROP CONSTRAINT "FK_reservations_user_id";
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      ALTER TABLE "reservations"
      ADD CONSTRAINT "FK_reservations_restaurant_id"
      FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id")
      ON DELETE CASCADE ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "reservations"
      ADD CONSTRAINT "FK_reservations_user_id"
      FOREIGN KEY ("user_id") REFERENCES "profiles"("id")
      ON DELETE NO ACTION ON UPDATE CASCADE
    `);

    // Payments (if table exists)
    const paymentsExists = await queryRunner.hasTable('payments');
    if (paymentsExists) {
      await queryRunner.query(`
        DO $$
        BEGIN
          IF EXISTS (SELECT 1 FROM information_schema.table_constraints
                     WHERE constraint_name = 'FK_payments_order_id') THEN
            ALTER TABLE "payments" DROP CONSTRAINT "FK_payments_order_id";
          END IF;
        END $$;
      `);

      await queryRunner.query(`
        ALTER TABLE "payments"
        ADD CONSTRAINT "FK_payments_order_id"
        FOREIGN KEY ("order_id") REFERENCES "orders"("id")
        ON DELETE NO ACTION ON UPDATE CASCADE
      `);
    }

    // Reviews (if table exists) - preserve reviews even if order is deleted
    const reviewsExists = await queryRunner.hasTable('reviews');
    if (reviewsExists) {
      await queryRunner.query(`
        DO $$
        BEGIN
          IF EXISTS (SELECT 1 FROM information_schema.table_constraints
                     WHERE constraint_name = 'FK_reviews_order_id') THEN
            ALTER TABLE "reviews" DROP CONSTRAINT "FK_reviews_order_id";
          END IF;
        END $$;
      `);

      await queryRunner.query(`
        DO $$
        BEGIN
          IF EXISTS (SELECT 1 FROM information_schema.table_constraints
                     WHERE constraint_name = 'FK_reviews_restaurant_id') THEN
            ALTER TABLE "reviews" DROP CONSTRAINT "FK_reviews_restaurant_id";
          END IF;
        END $$;
      `);

      await queryRunner.query(`
        ALTER TABLE "reviews"
        ADD CONSTRAINT "FK_reviews_order_id"
        FOREIGN KEY ("order_id") REFERENCES "orders"("id")
        ON DELETE SET NULL ON UPDATE CASCADE
      `);

      await queryRunner.query(`
        ALTER TABLE "reviews"
        ADD CONSTRAINT "FK_reviews_restaurant_id"
        FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id")
        ON DELETE CASCADE ON UPDATE CASCADE
      `);
    }

    // Tables - CASCADE on restaurant deletion
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints
                   WHERE constraint_name = 'FK_tables_restaurant_id') THEN
          ALTER TABLE "tables" DROP CONSTRAINT "FK_tables_restaurant_id";
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      ALTER TABLE "tables"
      ADD CONSTRAINT "FK_tables_restaurant_id"
      FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id")
      ON DELETE CASCADE ON UPDATE CASCADE
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // This migration cannot be easily reversed as it changes business logic
    // You would need to manually review each foreign key constraint
  }
}

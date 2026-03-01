import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialTables1701000000001 implements MigrationInterface {
  name = 'CreateInitialTables1701000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // PostGIS extension commented out as it's not available in current postgres:15-alpine container
    // await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS postgis`);

    // Create profiles table
    await queryRunner.query(`
      CREATE TABLE "profiles" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "email" varchar UNIQUE NOT NULL,
        "full_name" varchar,
        "phone" varchar,
        "avatar_url" varchar,
        "date_of_birth" date,
        "cpf" varchar UNIQUE,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      )
    `);

    // Create user_roles table
    await queryRunner.query(`
      CREATE TABLE "user_roles" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "restaurant_id" uuid,
        "role" varchar NOT NULL,
        "permissions" jsonb,
        "is_active" boolean DEFAULT true,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now(),
        CONSTRAINT "fk_user_roles_user" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE
      )
    `);

    // Create addresses table
    await queryRunner.query(`
      CREATE TABLE "addresses" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "street" varchar NOT NULL,
        "number" varchar NOT NULL,
        "complement" varchar,
        "neighborhood" varchar NOT NULL,
        "city" varchar NOT NULL,
        "state" varchar NOT NULL,
        "zip_code" varchar NOT NULL,
        "location" jsonb,
        "is_default" boolean DEFAULT false,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now(),
        CONSTRAINT "fk_addresses_user" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE
      )
    `);

    // Create restaurants table
    await queryRunner.query(`
      CREATE TABLE "restaurants" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "owner_id" uuid NOT NULL,
        "name" varchar NOT NULL,
        "description" text,
        "address" varchar NOT NULL,
        "city" varchar NOT NULL,
        "state" varchar NOT NULL,
        "zip_code" varchar NOT NULL,
        "phone" varchar NOT NULL,
        "email" varchar NOT NULL,
        "logo_url" varchar,
        "banner_url" varchar,
        "location" jsonb,
        "service_type" varchar NOT NULL,
        "cuisine_types" jsonb,
        "opening_hours" jsonb,
        "average_ticket" numeric(10,2),
        "rating" numeric(3,2) DEFAULT 0,
        "total_reviews" int DEFAULT 0,
        "is_active" boolean DEFAULT true,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now(),
        CONSTRAINT "fk_restaurants_owner" FOREIGN KEY ("owner_id") REFERENCES "profiles"("id")
      )
    `);

    // Spatial index commented out since we're not using PostGIS
    // await queryRunner.query(`
    //   CREATE INDEX "idx_restaurants_location" ON "restaurants" USING GIST ("location")
    // `);

    // Create service_configs table
    await queryRunner.query(`
      CREATE TABLE "service_configs" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "restaurant_id" uuid NOT NULL,
        "service_type" varchar NOT NULL,
        "is_active" boolean DEFAULT true,
        "config" jsonb,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now(),
        CONSTRAINT "fk_service_configs_restaurant" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE
      )
    `);

    // Create menu_items table
    await queryRunner.query(`
      CREATE TABLE "menu_items" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "restaurant_id" uuid NOT NULL,
        "name" varchar NOT NULL,
        "description" text,
        "price" numeric(10,2) NOT NULL,
        "category" varchar NOT NULL,
        "image_url" varchar,
        "is_available" boolean DEFAULT true,
        "preparation_time" int,
        "calories" int,
        "allergens" jsonb,
        "dietary_info" jsonb,
        "customizations" jsonb,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now(),
        CONSTRAINT "fk_menu_items_restaurant" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE
      )
    `);

    // Create tables table
    await queryRunner.query(`
      CREATE TABLE "tables" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "restaurant_id" uuid NOT NULL,
        "table_number" varchar NOT NULL,
        "seats" int NOT NULL,
        "status" varchar DEFAULT 'available',
        "position_x" int,
        "position_y" int,
        "qr_code" varchar,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now(),
        CONSTRAINT "fk_tables_restaurant" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE
      )
    `);

    // Create orders table
    await queryRunner.query(`
      CREATE TABLE "orders" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "restaurant_id" uuid NOT NULL,
        "table_id" uuid,
        "status" varchar DEFAULT 'pending',
        "subtotal_amount" numeric(10,2) NOT NULL,
        "tax_amount" numeric(10,2) DEFAULT 0,
        "tip_amount" numeric(10,2) DEFAULT 0,
        "discount_amount" numeric(10,2) DEFAULT 0,
        "total_amount" numeric(10,2) NOT NULL,
        "special_instructions" text,
        "estimated_time" int,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now(),
        CONSTRAINT "fk_orders_user" FOREIGN KEY ("user_id") REFERENCES "profiles"("id"),
        CONSTRAINT "fk_orders_restaurant" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id"),
        CONSTRAINT "fk_orders_table" FOREIGN KEY ("table_id") REFERENCES "tables"("id")
      )
    `);

    // Create order_items table
    await queryRunner.query(`
      CREATE TABLE "order_items" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "order_id" uuid NOT NULL,
        "menu_item_id" uuid NOT NULL,
        "quantity" int NOT NULL,
        "unit_price" numeric(10,2) NOT NULL,
        "subtotal" numeric(10,2) NOT NULL,
        "customizations" jsonb,
        "special_instructions" text,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now(),
        CONSTRAINT "fk_order_items_order" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_order_items_menu_item" FOREIGN KEY ("menu_item_id") REFERENCES "menu_items"("id")
      )
    `);

    // Create reservations table
    await queryRunner.query(`
      CREATE TABLE "reservations" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "restaurant_id" uuid NOT NULL,
        "table_id" uuid,
        "customer_name" varchar NOT NULL,
        "customer_phone" varchar NOT NULL,
        "customer_email" varchar,
        "party_size" int NOT NULL,
        "reservation_time" timestamp NOT NULL,
        "status" varchar DEFAULT 'pending',
        "special_requests" text,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now(),
        CONSTRAINT "fk_reservations_user" FOREIGN KEY ("user_id") REFERENCES "profiles"("id"),
        CONSTRAINT "fk_reservations_restaurant" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id"),
        CONSTRAINT "fk_reservations_table" FOREIGN KEY ("table_id") REFERENCES "tables"("id")
      )
    `);

    // Create wallets table
    await queryRunner.query(`
      CREATE TABLE "wallets" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid UNIQUE NOT NULL,
        "balance" numeric(10,2) DEFAULT 0,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now(),
        CONSTRAINT "fk_wallets_user" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE
      )
    `);

    // Create wallet_transactions table
    await queryRunner.query(`
      CREATE TABLE "wallet_transactions" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "wallet_id" uuid NOT NULL,
        "type" varchar NOT NULL,
        "amount" numeric(10,2) NOT NULL,
        "balance_after" numeric(10,2) NOT NULL,
        "description" varchar,
        "metadata" jsonb,
        "created_at" timestamp DEFAULT now(),
        CONSTRAINT "fk_wallet_transactions_wallet" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE CASCADE
      )
    `);

    // Create payments table
    await queryRunner.query(`
      CREATE TABLE "payments" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "order_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "amount" numeric(10,2) NOT NULL,
        "payment_method" varchar NOT NULL,
        "status" varchar DEFAULT 'pending',
        "transaction_id" varchar,
        "metadata" jsonb,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now(),
        CONSTRAINT "fk_payments_order" FOREIGN KEY ("order_id") REFERENCES "orders"("id"),
        CONSTRAINT "fk_payments_user" FOREIGN KEY ("user_id") REFERENCES "profiles"("id")
      )
    `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX "idx_user_roles_user_id" ON "user_roles"("user_id")`);
    await queryRunner.query(`CREATE INDEX "idx_user_roles_restaurant_id" ON "user_roles"("restaurant_id")`);
    await queryRunner.query(`CREATE INDEX "idx_addresses_user_id" ON "addresses"("user_id")`);
    await queryRunner.query(`CREATE INDEX "idx_menu_items_restaurant_id" ON "menu_items"("restaurant_id")`);
    await queryRunner.query(`CREATE INDEX "idx_orders_user_id" ON "orders"("user_id")`);
    await queryRunner.query(`CREATE INDEX "idx_orders_restaurant_id" ON "orders"("restaurant_id")`);
    await queryRunner.query(`CREATE INDEX "idx_orders_status" ON "orders"("status")`);
    await queryRunner.query(`CREATE INDEX "idx_reservations_user_id" ON "reservations"("user_id")`);
    await queryRunner.query(`CREATE INDEX "idx_reservations_restaurant_id" ON "reservations"("restaurant_id")`);
    await queryRunner.query(`CREATE INDEX "idx_reservations_time" ON "reservations"("reservation_time")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order
    await queryRunner.query(`DROP TABLE IF EXISTS "payments" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "wallet_transactions" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "wallets" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "reservations" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "order_items" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "orders" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tables" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "menu_items" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "service_configs" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "restaurants" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "addresses" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_roles" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "profiles" CASCADE`);
  }
}

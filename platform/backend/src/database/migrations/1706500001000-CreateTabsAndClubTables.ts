import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTabsAndClubTables1706500001000 implements MigrationInterface {
  name = 'CreateTabsAndClubTables1706500001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ==========================================
    // TAB ENUMS
    // ==========================================
    await queryRunner.query(`
      CREATE TYPE "tab_status_enum" AS ENUM ('open', 'pending_payment', 'closed');
    `);
    await queryRunner.query(`
      CREATE TYPE "tab_type_enum" AS ENUM ('individual', 'group');
    `);
    await queryRunner.query(`
      CREATE TYPE "tab_member_role_enum" AS ENUM ('host', 'member');
    `);
    await queryRunner.query(`
      CREATE TYPE "tab_member_status_enum" AS ENUM ('active', 'left', 'removed');
    `);

    // ==========================================
    // CLUB ENUMS
    // ==========================================
    await queryRunner.query(`
      CREATE TYPE "club_entry_purchase_type_enum" AS ENUM ('advance', 'door', 'guest_list', 'birthday', 'table_included');
    `);
    await queryRunner.query(`
      CREATE TYPE "club_entry_status_enum" AS ENUM ('active', 'used', 'cancelled', 'expired');
    `);
    await queryRunner.query(`
      CREATE TYPE "vip_table_reservation_status_enum" AS ENUM ('pending_confirmation', 'confirmed', 'cancelled', 'no_show', 'completed');
    `);
    await queryRunner.query(`
      CREATE TYPE "vip_table_guest_status_enum" AS ENUM ('pending', 'confirmed', 'declined', 'checked_in');
    `);
    await queryRunner.query(`
      CREATE TYPE "queue_entry_status_enum" AS ENUM ('waiting', 'called', 'entered', 'left', 'no_show');
    `);
    await queryRunner.query(`
      CREATE TYPE "guest_list_status_enum" AS ENUM ('active', 'used', 'expired');
    `);
    await queryRunner.query(`
      CREATE TYPE "artist_type_enum" AS ENUM ('resident_dj', 'guest_dj', 'live_band', 'mc', 'performance');
    `);
    await queryRunner.query(`
      CREATE TYPE "happy_hour_discount_type_enum" AS ENUM ('percentage', 'fixed', 'bogo');
    `);
    await queryRunner.query(`
      CREATE TYPE "happy_hour_applies_to_enum" AS ENUM ('all', 'categories', 'items');
    `);

    // ==========================================
    // TABS TABLE
    // ==========================================
    await queryRunner.query(`
      CREATE TABLE "tabs" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "restaurant_id" uuid NOT NULL,
        "table_id" uuid,
        "host_user_id" uuid NOT NULL,
        "status" "tab_status_enum" NOT NULL DEFAULT 'open',
        "type" "tab_type_enum" NOT NULL DEFAULT 'individual',
        "preauth_transaction_id" uuid,
        "preauth_amount" decimal(10,2),
        "cover_charge_credit" decimal(10,2) DEFAULT 0,
        "deposit_credit" decimal(10,2) DEFAULT 0,
        "subtotal" decimal(10,2) DEFAULT 0,
        "discount_amount" decimal(10,2) DEFAULT 0,
        "tip_amount" decimal(10,2) DEFAULT 0,
        "total_amount" decimal(10,2) DEFAULT 0,
        "amount_paid" decimal(10,2) DEFAULT 0,
        "invite_token" text,
        "metadata" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "closed_at" TIMESTAMP,
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_tab_restaurant" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_tab_table" FOREIGN KEY ("table_id") REFERENCES "restaurant_tables"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_tab_host" FOREIGN KEY ("host_user_id") REFERENCES "profiles"("id") ON DELETE CASCADE
      );
    `);
    await queryRunner.query(`CREATE INDEX "idx_tab_restaurant" ON "tabs"("restaurant_id");`);
    await queryRunner.query(`CREATE INDEX "idx_tab_host" ON "tabs"("host_user_id");`);
    await queryRunner.query(`CREATE INDEX "idx_tab_table" ON "tabs"("table_id");`);
    await queryRunner.query(`CREATE INDEX "idx_tab_status" ON "tabs"("status");`);
    await queryRunner.query(`CREATE INDEX "idx_tab_created" ON "tabs"("created_at");`);

    // ==========================================
    // TAB MEMBERS TABLE
    // ==========================================
    await queryRunner.query(`
      CREATE TABLE "tab_members" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "tab_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "role" "tab_member_role_enum" NOT NULL DEFAULT 'member',
        "status" "tab_member_status_enum" NOT NULL DEFAULT 'active',
        "amount_consumed" decimal(10,2) DEFAULT 0,
        "amount_paid" decimal(10,2) DEFAULT 0,
        "credit_contribution" decimal(10,2) DEFAULT 0,
        "joined_at" TIMESTAMP NOT NULL DEFAULT now(),
        "left_at" TIMESTAMP,
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_tab_member_tab" FOREIGN KEY ("tab_id") REFERENCES "tabs"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_tab_member_user" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE,
        CONSTRAINT "UQ_tab_member_user" UNIQUE ("tab_id", "user_id")
      );
    `);
    await queryRunner.query(`CREATE INDEX "idx_tab_member_tab" ON "tab_members"("tab_id");`);
    await queryRunner.query(`CREATE INDEX "idx_tab_member_user" ON "tab_members"("user_id");`);
    await queryRunner.query(`CREATE INDEX "idx_tab_member_status" ON "tab_members"("status");`);

    // ==========================================
    // TAB ITEMS TABLE
    // ==========================================
    await queryRunner.query(`
      CREATE TABLE "tab_items" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "tab_id" uuid NOT NULL,
        "menu_item_id" uuid NOT NULL,
        "ordered_by_user_id" uuid NOT NULL,
        "quantity" int NOT NULL,
        "unit_price" decimal(10,2) NOT NULL,
        "discount_amount" decimal(10,2) DEFAULT 0,
        "discount_reason" varchar(100),
        "total_price" decimal(10,2) NOT NULL,
        "status" "order_item_status_enum" NOT NULL DEFAULT 'pending',
        "customizations" jsonb,
        "special_instructions" text,
        "is_round_repeat" boolean DEFAULT false,
        "prepared_by" uuid,
        "prepared_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_tab_item_tab" FOREIGN KEY ("tab_id") REFERENCES "tabs"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_tab_item_menu_item" FOREIGN KEY ("menu_item_id") REFERENCES "menu_items"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_tab_item_ordered_by" FOREIGN KEY ("ordered_by_user_id") REFERENCES "profiles"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_tab_item_prepared_by" FOREIGN KEY ("prepared_by") REFERENCES "profiles"("id") ON DELETE SET NULL
      );
    `);
    await queryRunner.query(`CREATE INDEX "idx_tab_item_tab" ON "tab_items"("tab_id");`);
    await queryRunner.query(`CREATE INDEX "idx_tab_item_menu_item" ON "tab_items"("menu_item_id");`);
    await queryRunner.query(`CREATE INDEX "idx_tab_item_ordered_by" ON "tab_items"("ordered_by_user_id");`);
    await queryRunner.query(`CREATE INDEX "idx_tab_item_status" ON "tab_items"("status");`);

    // ==========================================
    // TAB PAYMENTS TABLE
    // ==========================================
    await queryRunner.query(`
      CREATE TABLE "tab_payments" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "tab_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "amount" decimal(10,2) NOT NULL,
        "tip_amount" decimal(10,2) DEFAULT 0,
        "payment_method" varchar(50) NOT NULL,
        "transaction_id" varchar(100),
        "status" "payment_split_status_enum" NOT NULL DEFAULT 'pending',
        "payment_details" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_tab_payment_tab" FOREIGN KEY ("tab_id") REFERENCES "tabs"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_tab_payment_user" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE
      );
    `);
    await queryRunner.query(`CREATE INDEX "idx_tab_payment_tab" ON "tab_payments"("tab_id");`);
    await queryRunner.query(`CREATE INDEX "idx_tab_payment_user" ON "tab_payments"("user_id");`);
    await queryRunner.query(`CREATE INDEX "idx_tab_payment_status" ON "tab_payments"("status");`);

    // ==========================================
    // HAPPY HOUR SCHEDULES TABLE
    // ==========================================
    await queryRunner.query(`
      CREATE TABLE "happy_hour_schedules" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "restaurant_id" uuid NOT NULL,
        "name" varchar(100) NOT NULL,
        "description" text,
        "days" text NOT NULL,
        "start_time" time NOT NULL,
        "end_time" time NOT NULL,
        "discount_type" "happy_hour_discount_type_enum" NOT NULL DEFAULT 'percentage',
        "discount_value" decimal(10,2) NOT NULL,
        "applies_to" "happy_hour_applies_to_enum" NOT NULL DEFAULT 'all',
        "category_ids" text,
        "item_ids" text,
        "is_active" boolean DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_happy_hour_restaurant" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE
      );
    `);
    await queryRunner.query(`CREATE INDEX "idx_happy_hour_restaurant" ON "happy_hour_schedules"("restaurant_id");`);
    await queryRunner.query(`CREATE INDEX "idx_happy_hour_active" ON "happy_hour_schedules"("is_active");`);

    // ==========================================
    // WAITER CALLS TABLE
    // ==========================================
    await queryRunner.query(`
      CREATE TABLE "waiter_calls" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "restaurant_id" uuid NOT NULL,
        "table_id" uuid,
        "user_id" uuid NOT NULL,
        "tab_id" uuid,
        "reason" varchar(50) NOT NULL,
        "notes" text,
        "status" varchar(20) DEFAULT 'pending',
        "acknowledged_by" uuid,
        "acknowledged_at" TIMESTAMP,
        "resolved_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_waiter_call_restaurant" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_waiter_call_table" FOREIGN KEY ("table_id") REFERENCES "restaurant_tables"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_waiter_call_user" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_waiter_call_acknowledged_by" FOREIGN KEY ("acknowledged_by") REFERENCES "profiles"("id") ON DELETE SET NULL
      );
    `);
    await queryRunner.query(`CREATE INDEX "idx_waiter_call_restaurant" ON "waiter_calls"("restaurant_id");`);
    await queryRunner.query(`CREATE INDEX "idx_waiter_call_table" ON "waiter_calls"("table_id");`);
    await queryRunner.query(`CREATE INDEX "idx_waiter_call_status" ON "waiter_calls"("status");`);
    await queryRunner.query(`CREATE INDEX "idx_waiter_call_created" ON "waiter_calls"("created_at");`);

    // ==========================================
    // CLUB ENTRIES TABLE
    // ==========================================
    await queryRunner.query(`
      CREATE TABLE "club_entries" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "restaurant_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "event_date" date NOT NULL,
        "variation_id" varchar(100) NOT NULL,
        "variation_name" varchar(100),
        "quantity" int DEFAULT 1,
        "unit_price" decimal(10,2) NOT NULL,
        "total_price" decimal(10,2) NOT NULL,
        "credit_amount" decimal(10,2) DEFAULT 0,
        "purchase_type" "club_entry_purchase_type_enum" NOT NULL DEFAULT 'advance',
        "qr_code" varchar(100) UNIQUE NOT NULL,
        "status" "club_entry_status_enum" NOT NULL DEFAULT 'active',
        "transaction_id" varchar(100),
        "used_at" TIMESTAMP,
        "metadata" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_club_entry_restaurant" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_club_entry_user" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE
      );
    `);
    await queryRunner.query(`CREATE INDEX "idx_club_entry_restaurant" ON "club_entries"("restaurant_id");`);
    await queryRunner.query(`CREATE INDEX "idx_club_entry_user" ON "club_entries"("user_id");`);
    await queryRunner.query(`CREATE INDEX "idx_club_entry_event_date" ON "club_entries"("event_date");`);
    await queryRunner.query(`CREATE INDEX "idx_club_entry_status" ON "club_entries"("status");`);
    await queryRunner.query(`CREATE INDEX "idx_club_entry_qr" ON "club_entries"("qr_code");`);

    // ==========================================
    // GUEST LIST ENTRIES TABLE
    // ==========================================
    await queryRunner.query(`
      CREATE TABLE "guest_list_entries" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "restaurant_id" uuid NOT NULL,
        "event_date" date NOT NULL,
        "user_id" uuid NOT NULL,
        "name" varchar(100) NOT NULL,
        "party_size" int DEFAULT 1,
        "promoter_id" uuid,
        "status" "guest_list_status_enum" NOT NULL DEFAULT 'active',
        "qr_code" varchar(100) UNIQUE NOT NULL,
        "used_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_guest_list_restaurant" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_guest_list_user" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_guest_list_promoter" FOREIGN KEY ("promoter_id") REFERENCES "profiles"("id") ON DELETE SET NULL
      );
    `);
    await queryRunner.query(`CREATE INDEX "idx_guest_list_restaurant" ON "guest_list_entries"("restaurant_id");`);
    await queryRunner.query(`CREATE INDEX "idx_guest_list_user" ON "guest_list_entries"("user_id");`);
    await queryRunner.query(`CREATE INDEX "idx_guest_list_event_date" ON "guest_list_entries"("event_date");`);
    await queryRunner.query(`CREATE INDEX "idx_guest_list_status" ON "guest_list_entries"("status");`);

    // ==========================================
    // VIP TABLE RESERVATIONS TABLE
    // ==========================================
    await queryRunner.query(`
      CREATE TABLE "vip_table_reservations" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "restaurant_id" uuid NOT NULL,
        "table_type_id" varchar(100) NOT NULL,
        "table_id" uuid,
        "host_user_id" uuid NOT NULL,
        "event_date" date NOT NULL,
        "party_size" int NOT NULL,
        "minimum_spend" decimal(10,2) NOT NULL,
        "deposit_amount" decimal(10,2) DEFAULT 0,
        "deposit_credit" decimal(10,2) DEFAULT 0,
        "deposit_transaction_id" varchar(100),
        "status" "vip_table_reservation_status_enum" NOT NULL DEFAULT 'pending_confirmation',
        "confirmation_deadline" TIMESTAMP,
        "confirmed_at" TIMESTAMP,
        "cancellation_reason" text,
        "cancelled_at" TIMESTAMP,
        "invite_token" text,
        "special_requests" text,
        "metadata" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_vip_reservation_restaurant" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_vip_reservation_host" FOREIGN KEY ("host_user_id") REFERENCES "profiles"("id") ON DELETE CASCADE
      );
    `);
    await queryRunner.query(`CREATE INDEX "idx_vip_reservation_restaurant" ON "vip_table_reservations"("restaurant_id");`);
    await queryRunner.query(`CREATE INDEX "idx_vip_reservation_host" ON "vip_table_reservations"("host_user_id");`);
    await queryRunner.query(`CREATE INDEX "idx_vip_reservation_event_date" ON "vip_table_reservations"("event_date");`);
    await queryRunner.query(`CREATE INDEX "idx_vip_reservation_status" ON "vip_table_reservations"("status");`);

    // ==========================================
    // VIP TABLE GUESTS TABLE
    // ==========================================
    await queryRunner.query(`
      CREATE TABLE "vip_table_guests" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "reservation_id" uuid NOT NULL,
        "user_id" uuid,
        "name" varchar(100),
        "email" varchar(100),
        "phone" varchar(20),
        "invite_token" text NOT NULL,
        "status" "vip_table_guest_status_enum" NOT NULL DEFAULT 'pending',
        "entry_id" uuid,
        "credit_contribution" decimal(10,2) DEFAULT 0,
        "invited_at" TIMESTAMP NOT NULL DEFAULT now(),
        "responded_at" TIMESTAMP,
        "checked_in_at" TIMESTAMP,
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_vip_guest_reservation" FOREIGN KEY ("reservation_id") REFERENCES "vip_table_reservations"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_vip_guest_user" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_vip_guest_entry" FOREIGN KEY ("entry_id") REFERENCES "club_entries"("id") ON DELETE SET NULL,
        CONSTRAINT "UQ_vip_table_guest_user" UNIQUE ("reservation_id", "user_id")
      );
    `);
    await queryRunner.query(`CREATE INDEX "idx_vip_guest_reservation" ON "vip_table_guests"("reservation_id");`);
    await queryRunner.query(`CREATE INDEX "idx_vip_guest_user" ON "vip_table_guests"("user_id");`);
    await queryRunner.query(`CREATE INDEX "idx_vip_guest_status" ON "vip_table_guests"("status");`);

    // ==========================================
    // VIP TABLE TABS TABLE
    // ==========================================
    await queryRunner.query(`
      CREATE TABLE "vip_table_tabs" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "reservation_id" uuid NOT NULL,
        "status" "tab_status_enum" NOT NULL DEFAULT 'open',
        "deposit_credit" decimal(10,2) DEFAULT 0,
        "entry_credits_total" decimal(10,2) DEFAULT 0,
        "subtotal" decimal(10,2) DEFAULT 0,
        "total_amount" decimal(10,2) DEFAULT 0,
        "amount_paid" decimal(10,2) DEFAULT 0,
        "minimum_spend_progress" decimal(10,2) DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "closed_at" TIMESTAMP,
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_vip_tab_reservation" FOREIGN KEY ("reservation_id") REFERENCES "vip_table_reservations"("id") ON DELETE CASCADE
      );
    `);
    await queryRunner.query(`CREATE INDEX "idx_vip_tab_reservation" ON "vip_table_tabs"("reservation_id");`);
    await queryRunner.query(`CREATE INDEX "idx_vip_tab_status" ON "vip_table_tabs"("status");`);

    // ==========================================
    // VIP TABLE TAB ITEMS TABLE
    // ==========================================
    await queryRunner.query(`
      CREATE TABLE "vip_table_tab_items" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "table_tab_id" uuid NOT NULL,
        "menu_item_id" uuid NOT NULL,
        "ordered_by_user_id" uuid NOT NULL,
        "quantity" int NOT NULL,
        "unit_price" decimal(10,2) NOT NULL,
        "total_price" decimal(10,2) NOT NULL,
        "status" "order_item_status_enum" NOT NULL DEFAULT 'pending',
        "special_instructions" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_vip_tab_item_tab" FOREIGN KEY ("table_tab_id") REFERENCES "vip_table_tabs"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_vip_tab_item_menu_item" FOREIGN KEY ("menu_item_id") REFERENCES "menu_items"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_vip_tab_item_ordered_by" FOREIGN KEY ("ordered_by_user_id") REFERENCES "profiles"("id") ON DELETE CASCADE
      );
    `);
    await queryRunner.query(`CREATE INDEX "idx_vip_tab_item_tab" ON "vip_table_tab_items"("table_tab_id");`);
    await queryRunner.query(`CREATE INDEX "idx_vip_tab_item_menu_item" ON "vip_table_tab_items"("menu_item_id");`);
    await queryRunner.query(`CREATE INDEX "idx_vip_tab_item_ordered_by" ON "vip_table_tab_items"("ordered_by_user_id");`);
    await queryRunner.query(`CREATE INDEX "idx_vip_tab_item_status" ON "vip_table_tab_items"("status");`);

    // ==========================================
    // QUEUE ENTRIES TABLE
    // ==========================================
    await queryRunner.query(`
      CREATE TABLE "queue_entries" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "restaurant_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "party_size" int NOT NULL,
        "priority_level_id" varchar(100) NOT NULL,
        "priority_level_name" varchar(50),
        "position" int NOT NULL,
        "estimated_wait_minutes" int NOT NULL,
        "status" "queue_entry_status_enum" NOT NULL DEFAULT 'waiting',
        "called_at" TIMESTAMP,
        "entered_at" TIMESTAMP,
        "left_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_queue_restaurant" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_queue_user" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE
      );
    `);
    await queryRunner.query(`CREATE INDEX "idx_queue_restaurant" ON "queue_entries"("restaurant_id");`);
    await queryRunner.query(`CREATE INDEX "idx_queue_user" ON "queue_entries"("user_id");`);
    await queryRunner.query(`CREATE INDEX "idx_queue_status" ON "queue_entries"("status");`);
    await queryRunner.query(`CREATE INDEX "idx_queue_position" ON "queue_entries"("restaurant_id", "position");`);

    // ==========================================
    // LINEUPS TABLE
    // ==========================================
    await queryRunner.query(`
      CREATE TABLE "lineups" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "restaurant_id" uuid NOT NULL,
        "event_date" date NOT NULL,
        "event_name" varchar(200),
        "description" text,
        "cover_image_url" varchar(500),
        "is_active" boolean DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_lineup_restaurant" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE
      );
    `);
    await queryRunner.query(`CREATE INDEX "idx_lineup_restaurant" ON "lineups"("restaurant_id");`);
    await queryRunner.query(`CREATE INDEX "idx_lineup_event_date" ON "lineups"("event_date");`);

    // ==========================================
    // LINEUP SLOTS TABLE
    // ==========================================
    await queryRunner.query(`
      CREATE TABLE "lineup_slots" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "lineup_id" uuid NOT NULL,
        "artist_name" varchar(200) NOT NULL,
        "artist_type" "artist_type_enum" NOT NULL DEFAULT 'guest_dj',
        "photo_url" varchar(500),
        "start_time" time NOT NULL,
        "end_time" time NOT NULL,
        "stage" varchar(100),
        "genre" varchar(100),
        "is_headliner" boolean DEFAULT false,
        "display_order" int DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_lineup_slot_lineup" FOREIGN KEY ("lineup_id") REFERENCES "lineups"("id") ON DELETE CASCADE
      );
    `);
    await queryRunner.query(`CREATE INDEX "idx_lineup_slot_lineup" ON "lineup_slots"("lineup_id");`);
    await queryRunner.query(`CREATE INDEX "idx_lineup_slot_time" ON "lineup_slots"("start_time");`);

    // ==========================================
    // CLUB CHECK-IN/OUT TABLE
    // ==========================================
    await queryRunner.query(`
      CREATE TABLE "club_check_in_outs" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "restaurant_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "entry_id" uuid,
        "check_in_at" TIMESTAMP NOT NULL,
        "check_out_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_check_in_restaurant" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_check_in_user" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_check_in_entry" FOREIGN KEY ("entry_id") REFERENCES "club_entries"("id") ON DELETE SET NULL
      );
    `);
    await queryRunner.query(`CREATE INDEX "idx_check_in_restaurant" ON "club_check_in_outs"("restaurant_id");`);
    await queryRunner.query(`CREATE INDEX "idx_check_in_user" ON "club_check_in_outs"("user_id");`);
    await queryRunner.query(`CREATE INDEX "idx_check_in_date" ON "club_check_in_outs"("check_in_at");`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order
    await queryRunner.query(`DROP TABLE IF EXISTS "club_check_in_outs" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "lineup_slots" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "lineups" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "queue_entries" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "vip_table_tab_items" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "vip_table_tabs" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "vip_table_guests" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "vip_table_reservations" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "guest_list_entries" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "club_entries" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "waiter_calls" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "happy_hour_schedules" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tab_payments" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tab_items" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tab_members" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tabs" CASCADE;`);

    // Drop enums
    await queryRunner.query(`DROP TYPE IF EXISTS "happy_hour_applies_to_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "happy_hour_discount_type_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "artist_type_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "guest_list_status_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "queue_entry_status_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "vip_table_guest_status_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "vip_table_reservation_status_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "club_entry_status_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "club_entry_purchase_type_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "tab_member_status_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "tab_member_role_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "tab_type_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "tab_status_enum";`);
  }
}

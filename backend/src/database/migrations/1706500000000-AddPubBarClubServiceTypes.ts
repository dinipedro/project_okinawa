import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPubBarClubServiceTypes1706500000000 implements MigrationInterface {
  name = 'AddPubBarClubServiceTypes1706500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new service types to enum
    await queryRunner.query(`
      ALTER TYPE "service_type_enum" ADD VALUE IF NOT EXISTS 'pub_bar';
    `);
    await queryRunner.query(`
      ALTER TYPE "service_type_enum" ADD VALUE IF NOT EXISTS 'club';
    `);

    // Add new order types
    await queryRunner.query(`
      ALTER TYPE "order_type_enum" ADD VALUE IF NOT EXISTS 'tab';
    `);
    await queryRunner.query(`
      ALTER TYPE "order_type_enum" ADD VALUE IF NOT EXISTS 'table_tab';
    `);

    // ==========================================
    // PUB & BAR Configuration Columns
    // ==========================================

    // Cover Charge
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "cover_charge_enabled" boolean DEFAULT false;
    `);
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "cover_charge_amount" decimal(10,2) DEFAULT 0;
    `);
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "cover_charge_credit_enabled" boolean DEFAULT false;
    `);
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "cover_charge_credit_percentage" int DEFAULT 0;
    `);
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "cover_charge_schedules" jsonb;
    `);

    // Digital Tab
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "digital_tab_enabled" boolean DEFAULT true;
    `);
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "tab_requires_card_preauth" boolean DEFAULT false;
    `);
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "tab_preauth_amount" decimal(10,2) DEFAULT 0;
    `);
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "tab_limit_enabled" boolean DEFAULT false;
    `);
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "tab_limit_amount" decimal(10,2) DEFAULT 0;
    `);
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "tab_auto_close_enabled" boolean DEFAULT false;
    `);
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "tab_auto_close_time" varchar(5);
    `);
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "tab_idle_warning_minutes" int DEFAULT 60;
    `);

    // Group Tab
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "group_tab_enabled" boolean DEFAULT true;
    `);
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "group_tab_max_members" int DEFAULT 10;
    `);
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "track_individual_consumption" boolean DEFAULT true;
    `);
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "group_invite_via_link" boolean DEFAULT true;
    `);
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "group_member_can_order" boolean DEFAULT true;
    `);

    // Happy Hour
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "happy_hour_enabled" boolean DEFAULT false;
    `);
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "happy_hour_schedules" jsonb;
    `);

    // Environment
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "outdoor_area_available" boolean DEFAULT false;
    `);
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "smoking_area_available" boolean DEFAULT false;
    `);

    // ==========================================
    // CLUB Configuration Columns
    // ==========================================

    // Cover Charge Variations
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "cover_charge_default_price" decimal(10,2) DEFAULT 0;
    `);
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "cover_charge_door_price" decimal(10,2) DEFAULT 0;
    `);
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "cover_charge_advance_price" decimal(10,2) DEFAULT 0;
    `);
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "cover_charge_variations" jsonb;
    `);

    // Guest List
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "guest_list_enabled" boolean DEFAULT false;
    `);
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "guest_list_discount_percentage" int DEFAULT 0;
    `);
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "guest_list_deadline" varchar(5);
    `);

    // Birthday
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "birthday_free_entry_enabled" boolean DEFAULT false;
    `);
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "birthday_minimum_companions" int DEFAULT 0;
    `);
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "birthday_advance_days" int DEFAULT 7;
    `);

    // Access Control
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "age_restriction" int DEFAULT 18;
    `);
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "dress_code_enabled" boolean DEFAULT false;
    `);
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "dress_code_description" text;
    `);

    // Lineup
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "lineup_enabled" boolean DEFAULT false;
    `);

    // VIP Tables
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "table_service_enabled" boolean DEFAULT false;
    `);
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "table_types" jsonb;
    `);
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "table_map_enabled" boolean DEFAULT false;
    `);
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "table_deposit_required" boolean DEFAULT false;
    `);
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "table_deposit_type" varchar(20);
    `);
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "table_deposit_value" decimal(10,2) DEFAULT 0;
    `);
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "table_deposit_credit_enabled" boolean DEFAULT false;
    `);
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "table_deposit_credit_percentage" int DEFAULT 0;
    `);
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "table_cancellation_deadline_hours" int DEFAULT 24;
    `);
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "table_confirmation_required" boolean DEFAULT false;
    `);
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "table_confirmation_deadline_hours" int DEFAULT 24;
    `);

    // Consumption
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "bottle_service_enabled" boolean DEFAULT false;
    `);
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "minimum_spend_tracker_enabled" boolean DEFAULT false;
    `);
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "minimum_spend_alert_percentage" int DEFAULT 80;
    `);
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "bar_order_enabled" boolean DEFAULT false;
    `);

    // Capacity & Queue
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "capacity_limit" int;
    `);
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "show_occupancy_level" boolean DEFAULT false;
    `);
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "occupancy_levels" jsonb;
    `);
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "queue_management_enabled" boolean DEFAULT false;
    `);
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "queue_priority_levels" jsonb;
    `);
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "check_in_out_enabled" boolean DEFAULT false;
    `);

    // Multiple Areas
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "multiple_areas_enabled" boolean DEFAULT false;
    `);
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "areas" jsonb;
    `);

    // Reservation deposit credit (shared)
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "reservation_deposit_enabled" boolean DEFAULT false;
    `);
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "reservation_deposit_amount" decimal(10,2) DEFAULT 0;
    `);
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "reservation_deposit_credit_enabled" boolean DEFAULT false;
    `);
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "reservation_deposit_credit_percentage" int DEFAULT 0;
    `);
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "reservation_minimum_spend_enabled" boolean DEFAULT false;
    `);
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "reservation_minimum_spend_amount" decimal(10,2) DEFAULT 0;
    `);
    await queryRunner.query(`
      ALTER TABLE "restaurant_service_configs" 
      ADD COLUMN IF NOT EXISTS "reservations_required_from_group_size" int;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove columns in reverse order
    const columns = [
      'reservations_required_from_group_size',
      'reservation_minimum_spend_amount',
      'reservation_minimum_spend_enabled',
      'reservation_deposit_credit_percentage',
      'reservation_deposit_credit_enabled',
      'reservation_deposit_amount',
      'reservation_deposit_enabled',
      'areas',
      'multiple_areas_enabled',
      'check_in_out_enabled',
      'queue_priority_levels',
      'queue_management_enabled',
      'occupancy_levels',
      'show_occupancy_level',
      'capacity_limit',
      'bar_order_enabled',
      'minimum_spend_alert_percentage',
      'minimum_spend_tracker_enabled',
      'bottle_service_enabled',
      'table_confirmation_deadline_hours',
      'table_confirmation_required',
      'table_cancellation_deadline_hours',
      'table_deposit_credit_percentage',
      'table_deposit_credit_enabled',
      'table_deposit_value',
      'table_deposit_type',
      'table_deposit_required',
      'table_map_enabled',
      'table_types',
      'table_service_enabled',
      'lineup_enabled',
      'dress_code_description',
      'dress_code_enabled',
      'age_restriction',
      'birthday_advance_days',
      'birthday_minimum_companions',
      'birthday_free_entry_enabled',
      'guest_list_deadline',
      'guest_list_discount_percentage',
      'guest_list_enabled',
      'cover_charge_variations',
      'cover_charge_advance_price',
      'cover_charge_door_price',
      'cover_charge_default_price',
      'smoking_area_available',
      'outdoor_area_available',
      'happy_hour_schedules',
      'happy_hour_enabled',
      'group_member_can_order',
      'group_invite_via_link',
      'track_individual_consumption',
      'group_tab_max_members',
      'group_tab_enabled',
      'tab_idle_warning_minutes',
      'tab_auto_close_time',
      'tab_auto_close_enabled',
      'tab_limit_amount',
      'tab_limit_enabled',
      'tab_preauth_amount',
      'tab_requires_card_preauth',
      'digital_tab_enabled',
      'cover_charge_schedules',
      'cover_charge_credit_percentage',
      'cover_charge_credit_enabled',
      'cover_charge_amount',
      'cover_charge_enabled',
    ];

    for (const column of columns) {
      await queryRunner.query(`
        ALTER TABLE "restaurant_service_configs" 
        DROP COLUMN IF EXISTS "${column}";
      `);
    }

    // Note: Cannot remove enum values in PostgreSQL without recreating the type
    // This would require a more complex migration
  }
}

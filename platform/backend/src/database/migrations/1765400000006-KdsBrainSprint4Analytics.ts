import { MigrationInterface, QueryRunner } from 'typeorm';

export class KdsBrainSprint4Analytics1765400000006
  implements MigrationInterface
{
  name = 'KdsBrainSprint4Analytics1765400000006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ─── prep_analytics ──────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "prep_analytics" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "restaurant_id" uuid NOT NULL,
        "station_id" uuid NOT NULL,
        "menu_item_id" uuid NOT NULL,
        "order_item_id" uuid NOT NULL,
        "expected_prep_minutes" int NOT NULL,
        "actual_prep_minutes" int,
        "was_late" boolean NOT NULL DEFAULT false,
        "shift" varchar(20),
        "source" varchar(20),
        "day_of_week" varchar(20),
        "recorded_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_prep_analytics" PRIMARY KEY ("id"),
        CONSTRAINT "FK_prep_analytics_restaurant" FOREIGN KEY ("restaurant_id")
          REFERENCES "restaurants"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_prep_analytics_station" FOREIGN KEY ("station_id")
          REFERENCES "cook_stations"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_prep_analytics_menu_item" FOREIGN KEY ("menu_item_id")
          REFERENCES "menu_items"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_prep_analytics_order_item" FOREIGN KEY ("order_item_id")
          REFERENCES "order_items"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_prep_analytics_restaurant_station"
        ON "prep_analytics" ("restaurant_id", "station_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_prep_analytics_menu_item"
        ON "prep_analytics" ("menu_item_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_prep_analytics_recorded_at"
        ON "prep_analytics" ("recorded_at")
    `);

    // ─── prep_time_suggestions ───────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "prep_time_suggestions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "restaurant_id" uuid NOT NULL,
        "menu_item_id" uuid NOT NULL,
        "station_id" uuid,
        "menu_item_name" varchar(255) NOT NULL,
        "current_prep_minutes" int NOT NULL,
        "suggested_prep_minutes" int NOT NULL,
        "sample_size" int NOT NULL,
        "confidence_score" decimal(5,2) NOT NULL,
        "status" varchar(20) NOT NULL DEFAULT 'pending',
        "decided_at" timestamp,
        "decided_by" varchar,
        "created_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_prep_time_suggestions" PRIMARY KEY ("id"),
        CONSTRAINT "FK_prep_time_suggestions_restaurant" FOREIGN KEY ("restaurant_id")
          REFERENCES "restaurants"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_prep_time_suggestions_menu_item" FOREIGN KEY ("menu_item_id")
          REFERENCES "menu_items"("id") ON DELETE CASCADE
      )
    `);

    // ─── kds_brain_configs ───────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "kds_brain_configs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "restaurant_id" uuid NOT NULL,
        "course_gap_mode" varchar(20) NOT NULL DEFAULT 'on_ready',
        "course_gap_minutes" int NOT NULL DEFAULT 0,
        "delivery_buffer_minutes" int NOT NULL DEFAULT 3,
        "auto_accept_delivery" boolean NOT NULL DEFAULT true,
        "sound_enabled" boolean NOT NULL DEFAULT true,
        "sound_volume" decimal(3,2) NOT NULL DEFAULT 0.8,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_kds_brain_configs" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_kds_brain_configs_restaurant" UNIQUE ("restaurant_id"),
        CONSTRAINT "FK_kds_brain_configs_restaurant" FOREIGN KEY ("restaurant_id")
          REFERENCES "restaurants"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "kds_brain_configs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "prep_time_suggestions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "prep_analytics"`);
  }
}

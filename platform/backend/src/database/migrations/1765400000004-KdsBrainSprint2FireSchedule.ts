import { MigrationInterface, QueryRunner } from 'typeorm';

export class KdsBrainSprint2FireSchedule1765400000004
  implements MigrationInterface
{
  name = 'KdsBrainSprint2FireSchedule1765400000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "fire_schedules" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "order_id" uuid NOT NULL,
        "order_item_id" uuid NOT NULL,
        "station_id" uuid NOT NULL,
        "course" varchar(20),
        "fire_at" timestamp,
        "expected_ready_at" timestamp,
        "actual_ready_at" timestamp,
        "fired" boolean NOT NULL DEFAULT false,
        "fire_mode" varchar(20) NOT NULL DEFAULT 'auto',
        "created_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_fire_schedules" PRIMARY KEY ("id"),
        CONSTRAINT "FK_fire_schedules_order" FOREIGN KEY ("order_id")
          REFERENCES "orders"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_fire_schedules_order_item" FOREIGN KEY ("order_item_id")
          REFERENCES "order_items"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_fire_schedules_station" FOREIGN KEY ("station_id")
          REFERENCES "cook_stations"("id") ON DELETE CASCADE
      )
    `);

    // Partial index: only unfired schedules (used by the cron to find items to fire)
    await queryRunner.query(`
      CREATE INDEX "idx_fire_schedule_fire_at_unfired"
        ON "fire_schedules" ("fire_at")
        WHERE "fired" = false
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_fire_schedule_order"
        ON "fire_schedules" ("order_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_fire_schedule_station_fired"
        ON "fire_schedules" ("station_id", "fired")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "fire_schedules"`);
  }
}

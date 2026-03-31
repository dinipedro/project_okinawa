import { MigrationInterface, QueryRunner } from 'typeorm';

export class KdsBrainSprint1CookStations1765400000001 implements MigrationInterface {
  name = 'KdsBrainSprint1CookStations1765400000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "cook_stations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "restaurant_id" uuid NOT NULL,
        "name" varchar(100) NOT NULL,
        "type" varchar(10) NOT NULL DEFAULT 'kitchen',
        "emoji" varchar(10),
        "late_threshold_minutes" int NOT NULL DEFAULT 15,
        "display_order" int NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_cook_stations" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_cook_station_restaurant" ON "cook_stations" ("restaurant_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_cook_station_active" ON "cook_stations" ("is_active")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_cook_station_active"`);
    await queryRunner.query(`DROP INDEX "idx_cook_station_restaurant"`);
    await queryRunner.query(`DROP TABLE "cook_stations"`);
  }
}

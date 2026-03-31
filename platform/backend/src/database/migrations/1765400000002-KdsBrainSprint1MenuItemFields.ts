import { MigrationInterface, QueryRunner } from 'typeorm';

export class KdsBrainSprint1MenuItemFields1765400000002 implements MigrationInterface {
  name = 'KdsBrainSprint1MenuItemFields1765400000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "menu_items"
      ADD COLUMN "station_id" uuid,
      ADD COLUMN "estimated_prep_minutes" int NOT NULL DEFAULT 10,
      ADD COLUMN "course" varchar(20) NOT NULL DEFAULT 'main'
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_menu_item_station" ON "menu_items" ("station_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_menu_item_course" ON "menu_items" ("course")
    `);

    await queryRunner.query(`
      ALTER TABLE "menu_items"
      ADD CONSTRAINT "FK_menu_items_station"
      FOREIGN KEY ("station_id") REFERENCES "cook_stations"("id")
      ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "menu_items" DROP CONSTRAINT "FK_menu_items_station"`);
    await queryRunner.query(`DROP INDEX "idx_menu_item_course"`);
    await queryRunner.query(`DROP INDEX "idx_menu_item_station"`);
    await queryRunner.query(`
      ALTER TABLE "menu_items"
      DROP COLUMN "course",
      DROP COLUMN "estimated_prep_minutes",
      DROP COLUMN "station_id"
    `);
  }
}

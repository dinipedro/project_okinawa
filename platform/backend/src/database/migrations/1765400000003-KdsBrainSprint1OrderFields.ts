import { MigrationInterface, QueryRunner } from 'typeorm';

export class KdsBrainSprint1OrderFields1765400000003 implements MigrationInterface {
  name = 'KdsBrainSprint1OrderFields1765400000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Order entity new fields
    await queryRunner.query(`
      ALTER TABLE "orders"
      ADD COLUMN "source" varchar(20) NOT NULL DEFAULT 'noowe',
      ADD COLUMN "source_order_id" varchar(255),
      ADD COLUMN "delivery_rider_eta" TIMESTAMP
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_order_source" ON "orders" ("source")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_order_source_order_id" ON "orders" ("source_order_id")
    `);

    // OrderItem entity new fields
    await queryRunner.query(`
      ALTER TABLE "order_items"
      ADD COLUMN "station_id" uuid,
      ADD COLUMN "fire_at" TIMESTAMP,
      ADD COLUMN "expected_ready_at" TIMESTAMP,
      ADD COLUMN "course" varchar(20)
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_order_item_station" ON "order_items" ("station_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_order_item_fire_at" ON "order_items" ("fire_at")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_order_item_course" ON "order_items" ("course")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop OrderItem indexes and columns
    await queryRunner.query(`DROP INDEX "idx_order_item_course"`);
    await queryRunner.query(`DROP INDEX "idx_order_item_fire_at"`);
    await queryRunner.query(`DROP INDEX "idx_order_item_station"`);
    await queryRunner.query(`
      ALTER TABLE "order_items"
      DROP COLUMN "course",
      DROP COLUMN "expected_ready_at",
      DROP COLUMN "fire_at",
      DROP COLUMN "station_id"
    `);

    // Drop Order indexes and columns
    await queryRunner.query(`DROP INDEX "idx_order_source_order_id"`);
    await queryRunner.query(`DROP INDEX "idx_order_source"`);
    await queryRunner.query(`
      ALTER TABLE "orders"
      DROP COLUMN "delivery_rider_eta",
      DROP COLUMN "source_order_id",
      DROP COLUMN "source"
    `);
  }
}

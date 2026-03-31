import { MigrationInterface, QueryRunner } from 'typeorm';

export class KdsBrainSprint3Integrations1765400000005
  implements MigrationInterface
{
  name = 'KdsBrainSprint3Integrations1765400000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ────────────────────────────────────────────────────────
    // platform_connections — stores API credentials & config
    // for each delivery platform (iFood, Rappi, UberEats)
    // ────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "platform_connections" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "restaurant_id" uuid NOT NULL,
        "platform" varchar(20) NOT NULL,
        "credentials" jsonb NOT NULL DEFAULT '{}',
        "webhook_secret" varchar(255),
        "is_active" boolean NOT NULL DEFAULT true,
        "auto_accept" boolean NOT NULL DEFAULT true,
        "max_concurrent_orders" int NOT NULL DEFAULT 30,
        "high_load_threshold" int NOT NULL DEFAULT 20,
        "last_sync_at" timestamp,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_platform_connections" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_platform_connections_restaurant_platform"
          UNIQUE ("restaurant_id", "platform"),
        CONSTRAINT "FK_platform_connections_restaurant"
          FOREIGN KEY ("restaurant_id")
          REFERENCES "restaurants"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_platform_connections_restaurant"
        ON "platform_connections" ("restaurant_id")
    `);

    // ────────────────────────────────────────────────────────
    // external_menu_mappings — maps external platform item IDs
    // to internal menu_item UUIDs
    // ────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "external_menu_mappings" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "restaurant_id" uuid NOT NULL,
        "platform" varchar(20) NOT NULL,
        "external_item_id" varchar(255) NOT NULL,
        "external_item_name" varchar(255) NOT NULL,
        "internal_menu_item_id" uuid NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_external_menu_mappings" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_external_menu_mappings_restaurant_platform_item"
          UNIQUE ("restaurant_id", "platform", "external_item_id"),
        CONSTRAINT "FK_external_menu_mappings_restaurant"
          FOREIGN KEY ("restaurant_id")
          REFERENCES "restaurants"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_external_menu_mappings_menu_item"
          FOREIGN KEY ("internal_menu_item_id")
          REFERENCES "menu_items"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_external_menu_mappings_restaurant_platform"
        ON "external_menu_mappings" ("restaurant_id", "platform")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_external_menu_mappings_internal_menu_item"
        ON "external_menu_mappings" ("internal_menu_item_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "external_menu_mappings"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "platform_connections"`);
  }
}

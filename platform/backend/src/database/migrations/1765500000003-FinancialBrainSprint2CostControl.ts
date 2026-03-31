import { MigrationInterface, QueryRunner } from 'typeorm';

export class FinancialBrainSprint2CostControl1765500000003 implements MigrationInterface {
  name = 'FinancialBrainSprint2CostControl1765500000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── Ingredients table ──
    await queryRunner.query(`
      CREATE TABLE "ingredients" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "restaurant_id" uuid NOT NULL,
        "name" varchar(200) NOT NULL,
        "unit" varchar(20) NOT NULL,
        "category" varchar(50),
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_ingredients" PRIMARY KEY ("id"),
        CONSTRAINT "FK_ingredients_restaurant" FOREIGN KEY ("restaurant_id")
          REFERENCES "restaurants"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_ingredient_restaurant" ON "ingredients" ("restaurant_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_ingredient_active" ON "ingredients" ("is_active")
    `);

    // ── Ingredient Prices table ──
    await queryRunner.query(`
      CREATE TABLE "ingredient_prices" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "ingredient_id" uuid NOT NULL,
        "price_per_unit" decimal(10,4) NOT NULL,
        "supplier" varchar(200),
        "effective_date" date NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_ingredient_prices" PRIMARY KEY ("id"),
        CONSTRAINT "FK_ingredient_prices_ingredient" FOREIGN KEY ("ingredient_id")
          REFERENCES "ingredients"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_ingredient_price_ingredient" ON "ingredient_prices" ("ingredient_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_ingredient_price_effective_date" ON "ingredient_prices" ("effective_date")
    `);

    // ── Recipes table ──
    await queryRunner.query(`
      CREATE TABLE "recipes" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "menu_item_id" uuid NOT NULL,
        "restaurant_id" uuid NOT NULL,
        "calculated_cost" decimal(10,2),
        "calculated_margin_pct" decimal(5,2),
        "last_calculated_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_recipes" PRIMARY KEY ("id"),
        CONSTRAINT "FK_recipes_menu_item" FOREIGN KEY ("menu_item_id")
          REFERENCES "menu_items"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_recipes_restaurant" FOREIGN KEY ("restaurant_id")
          REFERENCES "restaurants"("id") ON DELETE CASCADE,
        CONSTRAINT "UQ_recipes_menu_item" UNIQUE ("menu_item_id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_recipe_restaurant" ON "recipes" ("restaurant_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_recipe_menu_item" ON "recipes" ("menu_item_id")
    `);

    // ── Recipe Ingredients table ──
    await queryRunner.query(`
      CREATE TABLE "recipe_ingredients" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "recipe_id" uuid NOT NULL,
        "ingredient_id" uuid NOT NULL,
        "quantity" decimal(10,4) NOT NULL,
        CONSTRAINT "PK_recipe_ingredients" PRIMARY KEY ("id"),
        CONSTRAINT "FK_recipe_ingredients_recipe" FOREIGN KEY ("recipe_id")
          REFERENCES "recipes"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_recipe_ingredients_ingredient" FOREIGN KEY ("ingredient_id")
          REFERENCES "ingredients"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_recipe_ingredient_recipe" ON "recipe_ingredients" ("recipe_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_recipe_ingredient_ingredient" ON "recipe_ingredients" ("ingredient_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "recipe_ingredients"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "recipes"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ingredient_prices"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ingredients"`);
  }
}

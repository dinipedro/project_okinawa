import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMissingColumns1764695661021 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add missing columns to profiles table
        await queryRunner.query(`
            ALTER TABLE "profiles"
            ADD COLUMN IF NOT EXISTS "default_address" varchar,
            ADD COLUMN IF NOT EXISTS "dietary_restrictions" text,
            ADD COLUMN IF NOT EXISTS "favorite_cuisines" text,
            ADD COLUMN IF NOT EXISTS "preferences" jsonb,
            ADD COLUMN IF NOT EXISTS "is_active" boolean DEFAULT true
        `);

        // Add missing columns to wallets table
        await queryRunner.query(`
            ALTER TABLE "wallets"
            ADD COLUMN IF NOT EXISTS "restaurant_id" uuid,
            ADD COLUMN IF NOT EXISTS "wallet_type" varchar DEFAULT 'personal',
            ADD COLUMN IF NOT EXISTS "is_active" boolean DEFAULT true,
            ADD COLUMN IF NOT EXISTS "metadata" jsonb
        `);

        // Add foreign key for wallet restaurant_id
        await queryRunner.query(`
            ALTER TABLE "wallets"
            ADD CONSTRAINT "fk_wallets_restaurant"
            FOREIGN KEY ("restaurant_id")
            REFERENCES "restaurants"("id")
            ON DELETE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove foreign key
        await queryRunner.query(`ALTER TABLE "wallets" DROP CONSTRAINT IF EXISTS "fk_wallets_restaurant"`);

        // Remove columns from wallets
        await queryRunner.query(`
            ALTER TABLE "wallets"
            DROP COLUMN IF EXISTS "metadata",
            DROP COLUMN IF EXISTS "is_active",
            DROP COLUMN IF EXISTS "wallet_type",
            DROP COLUMN IF EXISTS "restaurant_id"
        `);

        // Remove columns from profiles
        await queryRunner.query(`
            ALTER TABLE "profiles"
            DROP COLUMN IF EXISTS "is_active",
            DROP COLUMN IF EXISTS "preferences",
            DROP COLUMN IF EXISTS "favorite_cuisines",
            DROP COLUMN IF EXISTS "dietary_restrictions",
            DROP COLUMN IF EXISTS "default_address"
        `);
    }

}

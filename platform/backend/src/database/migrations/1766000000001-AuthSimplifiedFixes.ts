/**
 * Migration: Auth Simplified Fixes
 *
 * 1. Fix token_blacklist schema mismatch (token_hash → token_jti, etc.)
 * 2. Create otp_tokens table if not exists
 * 3. Create biometric_tokens table if not exists
 * 4. Add missing Profile fields (provider, google_id, apple_id, biometric_enabled, fcm_token, last_login_at)
 * 5. Make profiles.email nullable (phone-only users don't have email)
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AuthSimplifiedFixes1766000000001 implements MigrationInterface {
  name = 'AuthSimplifiedFixes1766000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ═══════════════════════════════════════════════════
    // 1. Fix token_blacklist schema mismatch
    // ═══════════════════════════════════════════════════

    // Check if old column exists and rename
    const tokenBlacklistCols = await queryRunner.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'token_blacklist'
    `);
    const colNames = tokenBlacklistCols.map((c: { column_name: string }) => c.column_name);

    if (colNames.includes('token_hash') && !colNames.includes('token_jti')) {
      await queryRunner.query(`
        ALTER TABLE "token_blacklist" RENAME COLUMN "token_hash" TO "token_jti"
      `);
      await queryRunner.query(`
        ALTER TABLE "token_blacklist" ALTER COLUMN "token_jti" TYPE varchar(64)
      `);
      // Drop old index and create new one
      await queryRunner.query(`DROP INDEX IF EXISTS "IDX_token_blacklist_hash"`);
      await queryRunner.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS "IDX_token_blacklist_jti"
        ON "token_blacklist" ("token_jti")
      `);
    }

    if (colNames.includes('revocation_reason') && !colNames.includes('revoked_reason')) {
      await queryRunner.query(`
        ALTER TABLE "token_blacklist" RENAME COLUMN "revocation_reason" TO "revoked_reason"
      `);
    }

    if (colNames.includes('revoked_by_ip') && !colNames.includes('revoked_ip')) {
      await queryRunner.query(`
        ALTER TABLE "token_blacklist" RENAME COLUMN "revoked_by_ip" TO "revoked_ip"
      `);
    }

    // ═══════════════════════════════════════════════════
    // 2. Create otp_tokens table if not exists
    // ═══════════════════════════════════════════════════

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "otp_tokens" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "phone_number" varchar(20) NOT NULL,
        "code_hash" varchar(64) NOT NULL,
        "channel" varchar(20) NOT NULL,
        "purpose" varchar(20) NOT NULL,
        "expires_at" TIMESTAMP NOT NULL,
        "attempts" integer NOT NULL DEFAULT 0,
        "is_used" boolean NOT NULL DEFAULT false,
        "used_at" TIMESTAMP,
        "ip_address" varchar,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_otp_tokens" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_otp_phone_number"
      ON "otp_tokens" ("phone_number")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_otp_expires_at"
      ON "otp_tokens" ("expires_at")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_otp_phone_purpose_active"
      ON "otp_tokens" ("phone_number", "purpose", "is_used")
    `);

    // ═══════════════════════════════════════════════════
    // 3. Create biometric_tokens table if not exists
    // ═══════════════════════════════════════════════════

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "biometric_tokens" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "device_id" varchar(100) NOT NULL,
        "token_hash" varchar(64) NOT NULL,
        "biometric_type" varchar(20) NOT NULL,
        "public_key" text,
        "expires_at" TIMESTAMP NOT NULL,
        "device_info" jsonb,
        "is_revoked" boolean NOT NULL DEFAULT false,
        "revoked_at" TIMESTAMP,
        "revoke_reason" varchar,
        "last_used_at" TIMESTAMP,
        "ip_address" varchar,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_biometric_tokens" PRIMARY KEY ("id"),
        CONSTRAINT "FK_biometric_user" FOREIGN KEY ("user_id")
          REFERENCES "profiles"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_biometric_user_id"
      ON "biometric_tokens" ("user_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_biometric_device_id"
      ON "biometric_tokens" ("device_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_biometric_token_hash"
      ON "biometric_tokens" ("token_hash")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_biometric_expires_at"
      ON "biometric_tokens" ("expires_at")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_biometric_user_device_active"
      ON "biometric_tokens" ("user_id", "device_id", "is_revoked")
    `);

    // ═══════════════════════════════════════════════════
    // 4. Add missing columns to profiles table
    // ═══════════════════════════════════════════════════

    // Make email nullable (phone-only users don't have email)
    await queryRunner.query(`
      ALTER TABLE "profiles" ALTER COLUMN "email" DROP NOT NULL
    `);

    // Add provider column
    await queryRunner.query(`
      ALTER TABLE "profiles"
      ADD COLUMN IF NOT EXISTS "provider" varchar(10)
    `);

    // Add google_id column (unique, nullable)
    await queryRunner.query(`
      ALTER TABLE "profiles"
      ADD COLUMN IF NOT EXISTS "google_id" varchar
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "IDX_profiles_google_id"
      ON "profiles" ("google_id") WHERE "google_id" IS NOT NULL
    `);

    // Add apple_id column (unique, nullable)
    await queryRunner.query(`
      ALTER TABLE "profiles"
      ADD COLUMN IF NOT EXISTS "apple_id" varchar
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "IDX_profiles_apple_id"
      ON "profiles" ("apple_id") WHERE "apple_id" IS NOT NULL
    `);

    // Add biometric_enabled column
    await queryRunner.query(`
      ALTER TABLE "profiles"
      ADD COLUMN IF NOT EXISTS "biometric_enabled" boolean NOT NULL DEFAULT false
    `);

    // Add fcm_token column
    await queryRunner.query(`
      ALTER TABLE "profiles"
      ADD COLUMN IF NOT EXISTS "fcm_token" varchar
    `);

    // Add last_login_at column
    await queryRunner.query(`
      ALTER TABLE "profiles"
      ADD COLUMN IF NOT EXISTS "last_login_at" TIMESTAMP
    `);

    // Add unique partial index on phone (only non-null values)
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "IDX_profiles_phone_unique"
      ON "profiles" ("phone") WHERE "phone" IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove profile columns
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_profiles_phone_unique"`);
    await queryRunner.query(`ALTER TABLE "profiles" DROP COLUMN IF EXISTS "last_login_at"`);
    await queryRunner.query(`ALTER TABLE "profiles" DROP COLUMN IF EXISTS "fcm_token"`);
    await queryRunner.query(`ALTER TABLE "profiles" DROP COLUMN IF EXISTS "biometric_enabled"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_profiles_apple_id"`);
    await queryRunner.query(`ALTER TABLE "profiles" DROP COLUMN IF EXISTS "apple_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_profiles_google_id"`);
    await queryRunner.query(`ALTER TABLE "profiles" DROP COLUMN IF EXISTS "google_id"`);
    await queryRunner.query(`ALTER TABLE "profiles" DROP COLUMN IF EXISTS "provider"`);

    // Make email NOT NULL again
    await queryRunner.query(`
      ALTER TABLE "profiles" ALTER COLUMN "email" SET NOT NULL
    `);

    // Drop biometric_tokens
    await queryRunner.query(`DROP TABLE IF EXISTS "biometric_tokens"`);

    // Drop otp_tokens
    await queryRunner.query(`DROP TABLE IF EXISTS "otp_tokens"`);

    // Revert token_blacklist columns
    const cols = await queryRunner.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'token_blacklist'
    `);
    const colNames = cols.map((c: { column_name: string }) => c.column_name);

    if (colNames.includes('token_jti')) {
      await queryRunner.query(`DROP INDEX IF EXISTS "IDX_token_blacklist_jti"`);
      await queryRunner.query(`ALTER TABLE "token_blacklist" RENAME COLUMN "token_jti" TO "token_hash"`);
      await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS "IDX_token_blacklist_hash"
        ON "token_blacklist" ("token_hash")
      `);
    }
    if (colNames.includes('revoked_reason')) {
      await queryRunner.query(`ALTER TABLE "token_blacklist" RENAME COLUMN "revoked_reason" TO "revocation_reason"`);
    }
    if (colNames.includes('revoked_ip')) {
      await queryRunner.query(`ALTER TABLE "token_blacklist" RENAME COLUMN "revoked_ip" TO "revoked_by_ip"`);
    }
  }
}

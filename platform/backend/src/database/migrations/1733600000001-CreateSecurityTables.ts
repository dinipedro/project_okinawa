import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSecurityTables1733600000001 implements MigrationInterface {
  name = 'CreateSecurityTables1733600000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create user_credentials table (secure password storage)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_credentials" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "password_hash" varchar NOT NULL,
        "password_changed_at" TIMESTAMP DEFAULT now(),
        "password_history" text[] DEFAULT '{}',
        "failed_login_attempts" integer NOT NULL DEFAULT 0,
        "locked_until" TIMESTAMP,
        "last_login_at" TIMESTAMP,
        "last_login_ip" varchar(45),
        "mfa_enabled" boolean NOT NULL DEFAULT false,
        "mfa_secret" varchar,
        "mfa_backup_codes" text[],
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_credentials" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_user_credentials_user_id" UNIQUE ("user_id"),
        CONSTRAINT "FK_user_credentials_profile" FOREIGN KEY ("user_id")
          REFERENCES "profiles"("id") ON DELETE CASCADE
      )
    `);

    // Create token_blacklist table (token revocation)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "token_blacklist" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "token_hash" text NOT NULL,
        "user_id" uuid NOT NULL,
        "token_type" varchar(20) NOT NULL,
        "expires_at" TIMESTAMP NOT NULL,
        "revocation_reason" varchar(50),
        "revoked_by_ip" varchar(45),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_token_blacklist" PRIMARY KEY ("id")
      )
    `);

    // Create audit_logs table (security event tracking)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "audit_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid,
        "action" varchar(100) NOT NULL,
        "entity_type" varchar(50) NOT NULL,
        "entity_id" uuid,
        "ip_address" varchar(45),
        "user_agent" text,
        "old_values" jsonb,
        "new_values" jsonb,
        "metadata" jsonb,
        "success" boolean NOT NULL DEFAULT true,
        "failure_reason" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_audit_logs" PRIMARY KEY ("id")
      )
    `);

    // Create indexes for performance
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_user_credentials_user_id"
      ON "user_credentials" ("user_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_token_blacklist_hash"
      ON "token_blacklist" ("token_hash")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_token_blacklist_user"
      ON "token_blacklist" ("user_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_token_blacklist_expires"
      ON "token_blacklist" ("expires_at")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_audit_logs_user"
      ON "audit_logs" ("user_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_audit_logs_action"
      ON "audit_logs" ("action")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_audit_logs_created"
      ON "audit_logs" ("created_at")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_audit_logs_ip"
      ON "audit_logs" ("ip_address")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_audit_logs_ip"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_audit_logs_created"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_audit_logs_action"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_audit_logs_user"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_token_blacklist_expires"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_token_blacklist_user"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_token_blacklist_hash"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_credentials_user_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_logs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "token_blacklist"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_credentials"`);
  }
}

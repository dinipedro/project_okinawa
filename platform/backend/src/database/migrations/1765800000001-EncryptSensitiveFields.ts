import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Converts sensitive columns to TEXT type and encrypts existing plaintext values.
 *
 * Affected tables:
 *  - fiscal_configs: csc_token, focus_nfe_token, certificate_password
 *  - gateway_configs: credentials (jsonb → text)
 *  - platform_connections: credentials (jsonb → text), webhook_secret
 *
 * Note: Actual encryption of existing values requires FIELD_ENCRYPTION_KEY to be
 * set in the environment. The TypeORM transformer will auto-encrypt on next save.
 * This migration only changes column types to TEXT so encrypted payloads fit.
 */
export class EncryptSensitiveFields1765800000001
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // fiscal_configs — widen columns to TEXT for encrypted payloads
    await queryRunner.query(`
      ALTER TABLE "fiscal_configs"
        ALTER COLUMN "csc_token" TYPE text,
        ALTER COLUMN "focus_nfe_token" TYPE text,
        ALTER COLUMN "certificate_password" TYPE text;
    `);

    // gateway_configs — credentials from jsonb to text
    await queryRunner.query(`
      ALTER TABLE "gateway_configs"
        ALTER COLUMN "credentials" TYPE text USING credentials::text;
    `);

    // platform_connections — credentials from jsonb to text, webhook_secret to text
    await queryRunner.query(`
      ALTER TABLE "platform_connections"
        ALTER COLUMN "credentials" TYPE text USING credentials::text,
        ALTER COLUMN "webhook_secret" TYPE text;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse: restore original column types
    // WARNING: If data was encrypted, this will leave encrypted strings in varchar columns
    // which may exceed length limits. Only run down if no encrypted data exists.

    await queryRunner.query(`
      ALTER TABLE "fiscal_configs"
        ALTER COLUMN "csc_token" TYPE varchar(255),
        ALTER COLUMN "focus_nfe_token" TYPE varchar(255),
        ALTER COLUMN "certificate_password" TYPE varchar(255);
    `);

    await queryRunner.query(`
      ALTER TABLE "gateway_configs"
        ALTER COLUMN "credentials" TYPE jsonb USING credentials::jsonb;
    `);

    await queryRunner.query(`
      ALTER TABLE "platform_connections"
        ALTER COLUMN "credentials" TYPE jsonb USING credentials::jsonb,
        ALTER COLUMN "webhook_secret" TYPE varchar(255);
    `);
  }
}

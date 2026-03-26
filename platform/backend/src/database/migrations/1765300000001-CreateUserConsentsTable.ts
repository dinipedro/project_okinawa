import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateUserConsentsTable1765300000001 implements MigrationInterface {
  name = 'CreateUserConsentsTable1765300000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create consent_type enum
    await queryRunner.query(`
      CREATE TYPE "consent_type_enum" AS ENUM (
        'terms_of_service',
        'privacy_policy',
        'marketing',
        'analytics',
        'geolocation'
      )
    `);

    await queryRunner.createTable(
      new Table({
        name: 'user_consents',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'consent_type',
            type: 'consent_type_enum',
            isNullable: false,
          },
          {
            name: 'version',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'version_hash',
            type: 'varchar',
            length: '128',
            isNullable: true,
          },
          {
            name: 'ip_address',
            type: 'varchar',
            length: '45',
            isNullable: false,
          },
          {
            name: 'device_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'user_agent',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'accepted_at',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
          {
            name: 'revoked_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Add indexes
    await queryRunner.createIndex(
      'user_consents',
      new TableIndex({
        name: 'IDX_user_consents_user_id',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'user_consents',
      new TableIndex({
        name: 'IDX_user_consents_consent_type',
        columnNames: ['consent_type'],
      }),
    );

    await queryRunner.createIndex(
      'user_consents',
      new TableIndex({
        name: 'IDX_user_consents_version',
        columnNames: ['version'],
      }),
    );

    // Add foreign key to profiles
    await queryRunner.createForeignKey(
      'user_consents',
      new TableForeignKey({
        name: 'FK_user_consents_user_id',
        columnNames: ['user_id'],
        referencedTableName: 'profiles',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Add birth_date and marketing_consent columns to profiles table
    await queryRunner.query(`
      ALTER TABLE "profiles"
      ADD COLUMN IF NOT EXISTS "birth_date" DATE NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "profiles"
      ADD COLUMN IF NOT EXISTS "marketing_consent" BOOLEAN NOT NULL DEFAULT false
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove columns from profiles
    await queryRunner.query(`ALTER TABLE "profiles" DROP COLUMN IF EXISTS "marketing_consent"`);
    await queryRunner.query(`ALTER TABLE "profiles" DROP COLUMN IF EXISTS "birth_date"`);

    // Drop foreign key
    await queryRunner.dropForeignKey('user_consents', 'FK_user_consents_user_id');

    // Drop indexes
    await queryRunner.dropIndex('user_consents', 'IDX_user_consents_version');
    await queryRunner.dropIndex('user_consents', 'IDX_user_consents_consent_type');
    await queryRunner.dropIndex('user_consents', 'IDX_user_consents_user_id');

    // Drop table
    await queryRunner.dropTable('user_consents');

    // Drop enum
    await queryRunner.query(`DROP TYPE IF EXISTS "consent_type_enum"`);
  }
}

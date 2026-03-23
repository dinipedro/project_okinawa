/**
 * Migration: Create Biometric Tokens Table
 * 
 * Stores biometric authentication tokens for quick device login.
 * Supports token rotation, revocation, and device binding.
 */

import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateBiometricTokensTable1706370100000 implements MigrationInterface {
  name = 'CreateBiometricTokensTable1706370100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'biometric_tokens',
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
          },
          {
            name: 'device_id',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'token_hash',
            type: 'varchar',
            length: '64',
          },
          {
            name: 'biometric_type',
            type: 'varchar',
            length: '20',
            comment: 'face_id, touch_id, or fingerprint',
          },
          {
            name: 'public_key',
            type: 'text',
            isNullable: true,
            comment: 'For asymmetric verification',
          },
          {
            name: 'expires_at',
            type: 'timestamp',
          },
          {
            name: 'device_info',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'is_revoked',
            type: 'boolean',
            default: false,
          },
          {
            name: 'revoked_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'revoke_reason',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'last_used_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'ip_address',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create indexes
    await queryRunner.createIndex(
      'biometric_tokens',
      new TableIndex({
        name: 'idx_biometric_user_id',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'biometric_tokens',
      new TableIndex({
        name: 'idx_biometric_device_id',
        columnNames: ['device_id'],
      }),
    );

    await queryRunner.createIndex(
      'biometric_tokens',
      new TableIndex({
        name: 'idx_biometric_token_hash',
        columnNames: ['token_hash'],
      }),
    );

    await queryRunner.createIndex(
      'biometric_tokens',
      new TableIndex({
        name: 'idx_biometric_expires_at',
        columnNames: ['expires_at'],
      }),
    );

    await queryRunner.createIndex(
      'biometric_tokens',
      new TableIndex({
        name: 'idx_biometric_user_device_active',
        columnNames: ['user_id', 'device_id', 'is_revoked'],
      }),
    );

    // Foreign key to profiles table
    await queryRunner.createForeignKey(
      'biometric_tokens',
      new TableForeignKey({
        name: 'fk_biometric_user',
        columnNames: ['user_id'],
        referencedTableName: 'profiles',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('biometric_tokens', 'fk_biometric_user');
    await queryRunner.dropIndex('biometric_tokens', 'idx_biometric_user_device_active');
    await queryRunner.dropIndex('biometric_tokens', 'idx_biometric_expires_at');
    await queryRunner.dropIndex('biometric_tokens', 'idx_biometric_token_hash');
    await queryRunner.dropIndex('biometric_tokens', 'idx_biometric_device_id');
    await queryRunner.dropIndex('biometric_tokens', 'idx_biometric_user_id');
    await queryRunner.dropTable('biometric_tokens');
  }
}

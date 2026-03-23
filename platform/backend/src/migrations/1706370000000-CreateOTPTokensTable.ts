/**
 * Migration: Create OTP Tokens Table
 * 
 * Stores OTP codes for phone verification with security metadata.
 * Supports rate limiting, expiration, and attempt tracking.
 */

import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateOTPTokensTable1706370000000 implements MigrationInterface {
  name = 'CreateOTPTokensTable1706370000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'otp_tokens',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'phone_number',
            type: 'varchar',
            length: '20',
          },
          {
            name: 'code_hash',
            type: 'varchar',
            length: '64',
          },
          {
            name: 'channel',
            type: 'varchar',
            length: '20',
            comment: 'whatsapp or sms',
          },
          {
            name: 'purpose',
            type: 'varchar',
            length: '20',
            comment: 'registration, login, or verification',
          },
          {
            name: 'expires_at',
            type: 'timestamp',
          },
          {
            name: 'attempts',
            type: 'int',
            default: 0,
          },
          {
            name: 'is_used',
            type: 'boolean',
            default: false,
          },
          {
            name: 'used_at',
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
        ],
      }),
      true,
    );

    // Create indexes for efficient queries
    await queryRunner.createIndex(
      'otp_tokens',
      new TableIndex({
        name: 'idx_otp_phone_number',
        columnNames: ['phone_number'],
      }),
    );

    await queryRunner.createIndex(
      'otp_tokens',
      new TableIndex({
        name: 'idx_otp_expires_at',
        columnNames: ['expires_at'],
      }),
    );

    await queryRunner.createIndex(
      'otp_tokens',
      new TableIndex({
        name: 'idx_otp_phone_purpose_active',
        columnNames: ['phone_number', 'purpose', 'is_used'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('otp_tokens', 'idx_otp_phone_purpose_active');
    await queryRunner.dropIndex('otp_tokens', 'idx_otp_expires_at');
    await queryRunner.dropIndex('otp_tokens', 'idx_otp_phone_number');
    await queryRunner.dropTable('otp_tokens');
  }
}

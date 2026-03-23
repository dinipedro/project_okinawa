import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreatePaymentSplitsTable1733580000003 implements MigrationInterface {
  name = 'CreatePaymentSplitsTable1733580000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(`
      CREATE TYPE "payment_splits_mode_enum" AS ENUM (
        'individual',
        'split_equal',
        'split_selective'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "payment_splits_status_enum" AS ENUM (
        'pending',
        'partially_paid',
        'paid',
        'cancelled'
      )
    `);

    // Create table
    await queryRunner.createTable(
      new Table({
        name: 'payment_splits',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'order_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'guest_user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'split_mode',
            type: 'payment_splits_mode_enum',
            isNullable: false,
          },
          {
            name: 'amount_due',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'amount_paid',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'status',
            type: 'payment_splits_status_enum',
            default: "'pending'",
          },
          {
            name: 'payment_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'selected_items',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'custom_amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'service_charge',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'tip_amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'paid_at',
            type: 'timestamp',
            isNullable: true,
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
      'payment_splits',
      new TableIndex({
        name: 'IDX_payment_splits_order_id',
        columnNames: ['order_id'],
      }),
    );

    await queryRunner.createIndex(
      'payment_splits',
      new TableIndex({
        name: 'IDX_payment_splits_guest_user_id',
        columnNames: ['guest_user_id'],
      }),
    );

    await queryRunner.createIndex(
      'payment_splits',
      new TableIndex({
        name: 'IDX_payment_splits_status',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'payment_splits',
      new TableIndex({
        name: 'IDX_payment_splits_order_guest',
        columnNames: ['order_id', 'guest_user_id'],
      }),
    );

    // Create foreign keys
    await queryRunner.createForeignKey(
      'payment_splits',
      new TableForeignKey({
        name: 'FK_payment_splits_order',
        columnNames: ['order_id'],
        referencedTableName: 'orders',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'payment_splits',
      new TableForeignKey({
        name: 'FK_payment_splits_guest_user',
        columnNames: ['guest_user_id'],
        referencedTableName: 'profiles',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    await queryRunner.dropForeignKey('payment_splits', 'FK_payment_splits_guest_user');
    await queryRunner.dropForeignKey('payment_splits', 'FK_payment_splits_order');

    // Drop indexes
    await queryRunner.dropIndex('payment_splits', 'IDX_payment_splits_order_guest');
    await queryRunner.dropIndex('payment_splits', 'IDX_payment_splits_status');
    await queryRunner.dropIndex('payment_splits', 'IDX_payment_splits_guest_user_id');
    await queryRunner.dropIndex('payment_splits', 'IDX_payment_splits_order_id');

    // Drop table
    await queryRunner.dropTable('payment_splits');

    // Drop enums
    await queryRunner.query('DROP TYPE "payment_splits_status_enum"');
    await queryRunner.query('DROP TYPE "payment_splits_mode_enum"');
  }
}

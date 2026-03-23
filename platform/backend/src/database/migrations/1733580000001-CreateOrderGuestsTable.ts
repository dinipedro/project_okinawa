import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateOrderGuestsTable1733580000001 implements MigrationInterface {
  name = 'CreateOrderGuestsTable1733580000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type
    await queryRunner.query(`
      CREATE TYPE "order_guests_status_enum" AS ENUM (
        'joined',
        'left',
        'payment_pending',
        'payment_completed'
      )
    `);

    // Create table
    await queryRunner.createTable(
      new Table({
        name: 'order_guests',
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
            isNullable: true,
          },
          {
            name: 'guest_name',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'is_host',
            type: 'boolean',
            default: false,
          },
          {
            name: 'status',
            type: 'order_guests_status_enum',
            default: "'joined'",
          },
          {
            name: 'amount_due',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'amount_paid',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'payment_completed',
            type: 'boolean',
            default: false,
          },
          {
            name: 'payment_completed_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'joined_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'left_at',
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
      'order_guests',
      new TableIndex({
        name: 'IDX_order_guests_order_id',
        columnNames: ['order_id'],
      }),
    );

    await queryRunner.createIndex(
      'order_guests',
      new TableIndex({
        name: 'IDX_order_guests_guest_user_id',
        columnNames: ['guest_user_id'],
      }),
    );

    await queryRunner.createIndex(
      'order_guests',
      new TableIndex({
        name: 'IDX_order_guests_status',
        columnNames: ['status'],
      }),
    );

    // Create foreign keys
    await queryRunner.createForeignKey(
      'order_guests',
      new TableForeignKey({
        name: 'FK_order_guests_order',
        columnNames: ['order_id'],
        referencedTableName: 'orders',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'order_guests',
      new TableForeignKey({
        name: 'FK_order_guests_profile',
        columnNames: ['guest_user_id'],
        referencedTableName: 'profiles',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    await queryRunner.dropForeignKey('order_guests', 'FK_order_guests_profile');
    await queryRunner.dropForeignKey('order_guests', 'FK_order_guests_order');

    // Drop indexes
    await queryRunner.dropIndex('order_guests', 'IDX_order_guests_status');
    await queryRunner.dropIndex('order_guests', 'IDX_order_guests_guest_user_id');
    await queryRunner.dropIndex('order_guests', 'IDX_order_guests_order_id');

    // Drop table
    await queryRunner.dropTable('order_guests');

    // Drop enum
    await queryRunner.query('DROP TYPE "order_guests_status_enum"');
  }
}

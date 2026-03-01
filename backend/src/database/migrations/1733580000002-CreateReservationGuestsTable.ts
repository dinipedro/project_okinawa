import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateReservationGuestsTable1733580000002 implements MigrationInterface {
  name = 'CreateReservationGuestsTable1733580000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type
    await queryRunner.query(`
      CREATE TYPE "reservation_guests_status_enum" AS ENUM (
        'pending',
        'accepted',
        'declined',
        'cancelled'
      )
    `);

    // Create table
    await queryRunner.createTable(
      new Table({
        name: 'reservation_guests',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'reservation_id',
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
            name: 'guest_phone',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'guest_email',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'reservation_guests_status_enum',
            default: "'pending'",
          },
          {
            name: 'is_host',
            type: 'boolean',
            default: false,
          },
          {
            name: 'invited_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'invite_method',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'invite_token',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'invited_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'responded_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'has_arrived',
            type: 'boolean',
            default: false,
          },
          {
            name: 'arrived_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'requires_host_approval',
            type: 'boolean',
            default: false,
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
      'reservation_guests',
      new TableIndex({
        name: 'IDX_reservation_guests_reservation_id',
        columnNames: ['reservation_id'],
      }),
    );

    await queryRunner.createIndex(
      'reservation_guests',
      new TableIndex({
        name: 'IDX_reservation_guests_guest_user_id',
        columnNames: ['guest_user_id'],
      }),
    );

    await queryRunner.createIndex(
      'reservation_guests',
      new TableIndex({
        name: 'IDX_reservation_guests_status',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'reservation_guests',
      new TableIndex({
        name: 'IDX_reservation_guests_invite_token',
        columnNames: ['invite_token'],
      }),
    );

    // Create foreign keys
    await queryRunner.createForeignKey(
      'reservation_guests',
      new TableForeignKey({
        name: 'FK_reservation_guests_reservation',
        columnNames: ['reservation_id'],
        referencedTableName: 'reservations',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'reservation_guests',
      new TableForeignKey({
        name: 'FK_reservation_guests_guest_profile',
        columnNames: ['guest_user_id'],
        referencedTableName: 'profiles',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'reservation_guests',
      new TableForeignKey({
        name: 'FK_reservation_guests_invited_by',
        columnNames: ['invited_by'],
        referencedTableName: 'profiles',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    await queryRunner.dropForeignKey('reservation_guests', 'FK_reservation_guests_invited_by');
    await queryRunner.dropForeignKey('reservation_guests', 'FK_reservation_guests_guest_profile');
    await queryRunner.dropForeignKey('reservation_guests', 'FK_reservation_guests_reservation');

    // Drop indexes
    await queryRunner.dropIndex('reservation_guests', 'IDX_reservation_guests_invite_token');
    await queryRunner.dropIndex('reservation_guests', 'IDX_reservation_guests_status');
    await queryRunner.dropIndex('reservation_guests', 'IDX_reservation_guests_guest_user_id');
    await queryRunner.dropIndex('reservation_guests', 'IDX_reservation_guests_reservation_id');

    // Drop table
    await queryRunner.dropTable('reservation_guests');

    // Drop enum
    await queryRunner.query('DROP TYPE "reservation_guests_status_enum"');
  }
}

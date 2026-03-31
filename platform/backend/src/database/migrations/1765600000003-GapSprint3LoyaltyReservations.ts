import { MigrationInterface, QueryRunner, Table, TableIndex, TableUnique } from 'typeorm';

/**
 * GAP Sprint 3 — Loyalty cashback/points config + Reservations reminder field
 *
 * Creates:
 * - loyalty_configs table (per-restaurant cashback & points configuration)
 * - reminder_sent_at column on reservations table
 */
export class GapSprint3LoyaltyReservations1765600000003 implements MigrationInterface {
  name = 'GapSprint3LoyaltyReservations1765600000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ========== 1. Create loyalty_configs table ==========
    await queryRunner.createTable(
      new Table({
        name: 'loyalty_configs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'restaurant_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'cashback_enabled',
            type: 'boolean',
            default: false,
          },
          {
            name: 'cashback_percentage',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 5.0,
          },
          {
            name: 'points_enabled',
            type: 'boolean',
            default: false,
          },
          {
            name: 'points_per_real',
            type: 'int',
            default: 1,
          },
          {
            name: 'points_redemption_rate',
            type: 'decimal',
            precision: 10,
            scale: 4,
            default: 0.01,
          },
          {
            name: 'min_points_for_redemption',
            type: 'int',
            default: 100,
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
        foreignKeys: [
          {
            columnNames: ['restaurant_id'],
            referencedTableName: 'restaurants',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );

    // Unique constraint on restaurant_id
    await queryRunner.createUniqueConstraint(
      'loyalty_configs',
      new TableUnique({
        name: 'uq_loyalty_config_restaurant',
        columnNames: ['restaurant_id'],
      }),
    );

    // Index on restaurant_id
    await queryRunner.createIndex(
      'loyalty_configs',
      new TableIndex({
        name: 'idx_loyalty_config_restaurant',
        columnNames: ['restaurant_id'],
      }),
    );

    // ========== 2. Add reminder_sent_at to reservations ==========
    await queryRunner.query(
      `ALTER TABLE "reservations" ADD COLUMN IF NOT EXISTS "reminder_sent_at" TIMESTAMP DEFAULT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove reminder_sent_at from reservations
    await queryRunner.query(
      `ALTER TABLE "reservations" DROP COLUMN IF EXISTS "reminder_sent_at"`,
    );

    // Drop loyalty_configs table
    await queryRunner.dropTable('loyalty_configs', true);
  }
}

import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

/**
 * Migration to add Casual Dining specific columns to restaurant_service_configs table
 * These columns support the 9th service type: Casual Dining
 */
export class AddCasualDiningColumns1764900000001 implements MigrationInterface {
  name = 'AddCasualDiningColumns1764900000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add CASUAL_DINING to the service_type enum
    await queryRunner.query(`
      ALTER TYPE restaurant_service_configs_service_type_enum 
      ADD VALUE IF NOT EXISTS 'casual_dining'
    `);

    // Reservations & Entry
    await queryRunner.addColumns('restaurant_service_configs', [
      new TableColumn({
        name: 'reservations_optional',
        type: 'boolean',
        isNullable: true,
        default: null,
        comment: 'Accept both walk-ins and reservations',
      }),
      new TableColumn({
        name: 'reservation_grace_period',
        type: 'int',
        isNullable: true,
        default: null,
        comment: 'Grace period in minutes before reservation is cancelled (5-30)',
      }),
      new TableColumn({
        name: 'waitlist_enabled',
        type: 'boolean',
        isNullable: true,
        default: null,
        comment: 'Enable smart waitlist for walk-ins',
      }),
      new TableColumn({
        name: 'waitlist_advance_drinks',
        type: 'boolean',
        isNullable: true,
        default: null,
        comment: 'Allow ordering drinks/appetizers while waiting in queue',
      }),
      new TableColumn({
        name: 'estimated_wait_display',
        type: 'boolean',
        isNullable: true,
        default: null,
        comment: 'Display estimated wait time to customers',
      }),
    ]);

    // Table Service
    await queryRunner.addColumns('restaurant_service_configs', [
      new TableColumn({
        name: 'table_service',
        type: 'boolean',
        isNullable: true,
        default: null,
        comment: 'Full table service with dedicated waiter',
      }),
      new TableColumn({
        name: 'order_at_table',
        type: 'boolean',
        isNullable: true,
        default: null,
        comment: 'Allow ordering via app while at the table',
      }),
      new TableColumn({
        name: 'call_waiter_button',
        type: 'boolean',
        isNullable: true,
        default: null,
        comment: 'Enable call waiter button in app',
      }),
      new TableColumn({
        name: 'partial_order_enabled',
        type: 'boolean',
        isNullable: true,
        default: null,
        comment: 'Allow adding items to existing order without waiter',
      }),
    ]);

    // Groups
    await queryRunner.addColumns('restaurant_service_configs', [
      new TableColumn({
        name: 'group_friendly',
        type: 'boolean',
        isNullable: true,
        default: null,
        comment: 'Restaurant is group-friendly',
      }),
      new TableColumn({
        name: 'max_group_size',
        type: 'int',
        isNullable: true,
        default: null,
        comment: 'Maximum group size allowed (4-50)',
      }),
      new TableColumn({
        name: 'group_reservation_required',
        type: 'int',
        isNullable: true,
        default: null,
        comment: 'Party size threshold that requires reservation (4-20)',
      }),
    ]);

    // Payment
    await queryRunner.addColumns('restaurant_service_configs', [
      new TableColumn({
        name: 'suggested_tip_percentage',
        type: 'int',
        isNullable: true,
        default: null,
        comment: 'Suggested tip percentage shown to customers (0-20)',
      }),
      new TableColumn({
        name: 'service_charge_included',
        type: 'boolean',
        isNullable: true,
        default: null,
        comment: 'Service charge is already included in prices',
      }),
      new TableColumn({
        name: 'split_bill_promoted',
        type: 'boolean',
        isNullable: true,
        default: null,
        comment: 'Promote split bill feature prominently',
      }),
    ]);

    // Operational
    await queryRunner.addColumns('restaurant_service_configs', [
      new TableColumn({
        name: 'table_turnover_target',
        type: 'int',
        isNullable: true,
        default: null,
        comment: 'Target table turnover per day (1-10)',
      }),
    ]);

    // Create index for service_type to optimize queries filtering by casual_dining
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_service_configs_casual_dining 
      ON restaurant_service_configs (service_type) 
      WHERE service_type = 'casual_dining'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the index
    await queryRunner.query(`DROP INDEX IF EXISTS idx_service_configs_casual_dining`);

    // Remove all Casual Dining specific columns
    const columnsToRemove = [
      'reservations_optional',
      'reservation_grace_period',
      'waitlist_enabled',
      'waitlist_advance_drinks',
      'estimated_wait_display',
      'table_service',
      'order_at_table',
      'call_waiter_button',
      'partial_order_enabled',
      'group_friendly',
      'max_group_size',
      'group_reservation_required',
      'suggested_tip_percentage',
      'service_charge_included',
      'split_bill_promoted',
      'table_turnover_target',
    ];

    for (const columnName of columnsToRemove) {
      await queryRunner.dropColumn('restaurant_service_configs', columnName);
    }

    // Note: PostgreSQL doesn't support removing enum values in a simple way
    // The 'casual_dining' value will remain in the enum but won't be used
  }
}

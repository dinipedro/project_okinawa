import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateInventoryCount1765700000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create inventory_counts table
    await queryRunner.createTable(
      new Table({
        name: 'inventory_counts',
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
            name: 'status',
            type: 'varchar',
            length: '20',
            default: "'in_progress'",
          },
          {
            name: 'started_by',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'completed_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'started_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'completed_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'total_deviation_value',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'inventory_counts',
      new TableIndex({
        name: 'idx_inventory_counts_restaurant',
        columnNames: ['restaurant_id'],
      }),
    );

    await queryRunner.createIndex(
      'inventory_counts',
      new TableIndex({
        name: 'idx_inventory_counts_status',
        columnNames: ['restaurant_id', 'status'],
      }),
    );

    await queryRunner.createForeignKey(
      'inventory_counts',
      new TableForeignKey({
        name: 'fk_inventory_counts_restaurant',
        columnNames: ['restaurant_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'restaurants',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'inventory_counts',
      new TableForeignKey({
        name: 'fk_inventory_counts_started_by',
        columnNames: ['started_by'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      }),
    );

    // 2. Create inventory_count_items table
    await queryRunner.createTable(
      new Table({
        name: 'inventory_count_items',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'count_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'stock_item_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'ingredient_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'ingredient_name',
            type: 'varchar',
            length: '200',
          },
          {
            name: 'unit',
            type: 'varchar',
            length: '20',
          },
          {
            name: 'system_quantity',
            type: 'decimal',
            precision: 10,
            scale: 4,
          },
          {
            name: 'counted_quantity',
            type: 'decimal',
            precision: 10,
            scale: 4,
            isNullable: true,
          },
          {
            name: 'deviation',
            type: 'decimal',
            precision: 10,
            scale: 4,
            isNullable: true,
          },
          {
            name: 'deviation_value',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'is_counted',
            type: 'boolean',
            default: false,
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'inventory_count_items',
      new TableIndex({
        name: 'idx_inventory_count_items_count',
        columnNames: ['count_id'],
      }),
    );

    await queryRunner.createIndex(
      'inventory_count_items',
      new TableIndex({
        name: 'idx_inventory_count_items_stock',
        columnNames: ['stock_item_id'],
      }),
    );

    await queryRunner.createForeignKey(
      'inventory_count_items',
      new TableForeignKey({
        name: 'fk_inventory_count_items_count',
        columnNames: ['count_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'inventory_counts',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'inventory_count_items',
      new TableForeignKey({
        name: 'fk_inventory_count_items_stock_item',
        columnNames: ['stock_item_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'stock_items',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'inventory_count_items',
      new TableForeignKey({
        name: 'fk_inventory_count_items_ingredient',
        columnNames: ['ingredient_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'ingredients',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('inventory_count_items', true, true, true);
    await queryRunner.dropTable('inventory_counts', true, true, true);
  }
}

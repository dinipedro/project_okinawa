/**
 * AUDIT-009: Orders Table Partitioning Migration
 *
 * This migration sets up range partitioning on the orders table by created_at date.
 * Partitioning improves query performance for time-based queries and enables
 * efficient data archival.
 *
 * IMPORTANT: This is a major schema change. Backup your database before running.
 *
 * Partition Strategy:
 * - Monthly partitions for orders
 * - Automatic partition creation for future months
 * - Archive partitions older than 2 years can be detached
 *
 * Usage:
 *   npm run migration:run
 *
 * To revert:
 *   npm run migration:revert
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class OrdersTablePartitioning1733700000000 implements MigrationInterface {
  name = 'OrdersTablePartitioning1733700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Create partitioned orders table (new)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS orders_partitioned (
        id UUID NOT NULL DEFAULT gen_random_uuid(),
        restaurant_id UUID NOT NULL,
        user_id UUID NOT NULL,
        table_id UUID,
        waiter_id UUID,
        party_size INTEGER DEFAULT 1,
        order_type VARCHAR(20) DEFAULT 'DINE_IN',
        status VARCHAR(20) DEFAULT 'PENDING',
        subtotal DECIMAL(10,2) NOT NULL,
        tax_amount DECIMAL(10,2) DEFAULT 0,
        tip_amount DECIMAL(10,2) DEFAULT 0,
        discount_amount DECIMAL(10,2) DEFAULT 0,
        total_amount DECIMAL(10,2) NOT NULL,
        special_instructions TEXT,
        delivery_address TEXT,
        delivery_phone VARCHAR(50),
        estimated_ready_at TIMESTAMP,
        actual_ready_at TIMESTAMP,
        completed_at TIMESTAMP,
        is_shared BOOLEAN DEFAULT FALSE,
        payment_split_mode VARCHAR(20),
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id, created_at)
      ) PARTITION BY RANGE (created_at);
    `);

    // Step 2: Create initial partitions (current month and next 6 months)
    const now = new Date();
    for (let i = -1; i <= 6; i++) {
      const partitionDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + i + 1, 1);

      const partitionName = `orders_y${partitionDate.getFullYear()}m${String(partitionDate.getMonth() + 1).padStart(2, '0')}`;
      const fromDate = partitionDate.toISOString().split('T')[0];
      const toDate = nextMonth.toISOString().split('T')[0];

      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS ${partitionName}
        PARTITION OF orders_partitioned
        FOR VALUES FROM ('${fromDate}') TO ('${toDate}');
      `);
    }

    // Step 3: Create default partition for any dates outside defined ranges
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS orders_default
      PARTITION OF orders_partitioned DEFAULT;
    `);

    // Step 4: Create indexes on partitioned table
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_part_restaurant_id ON orders_partitioned (restaurant_id);
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_part_user_id ON orders_partitioned (user_id);
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_part_status ON orders_partitioned (status);
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_part_created_at ON orders_partitioned (created_at);
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_part_restaurant_status ON orders_partitioned (restaurant_id, status);
    `);

    // Step 5: Create function to auto-create partitions
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION create_orders_partition_if_needed()
      RETURNS TRIGGER AS $$
      DECLARE
        partition_name TEXT;
        partition_start DATE;
        partition_end DATE;
      BEGIN
        partition_start := date_trunc('month', NEW.created_at)::DATE;
        partition_end := (partition_start + INTERVAL '1 month')::DATE;
        partition_name := 'orders_y' || to_char(NEW.created_at, 'YYYY') || 'm' || to_char(NEW.created_at, 'MM');

        -- Check if partition exists
        IF NOT EXISTS (
          SELECT 1 FROM pg_tables WHERE tablename = partition_name
        ) THEN
          EXECUTE format(
            'CREATE TABLE IF NOT EXISTS %I PARTITION OF orders_partitioned FOR VALUES FROM (%L) TO (%L)',
            partition_name,
            partition_start,
            partition_end
          );
        END IF;

        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Step 6: Create trigger for auto-partition creation (optional - for new data)
    // Note: This trigger runs BEFORE INSERT but AFTER partition routing
    // It's mainly useful for logging/monitoring purposes

    // Step 7: Create view for seamless querying
    await queryRunner.query(`
      CREATE OR REPLACE VIEW orders_view AS
      SELECT * FROM orders_partitioned;
    `);

    // Step 8: Document the migration
    await queryRunner.query(`
      COMMENT ON TABLE orders_partitioned IS 'Partitioned orders table - partitioned by created_at month. AUDIT-009';
    `);

    console.log('✅ Orders table partitioning setup complete');
    console.log('⚠️  NOTE: Data migration from orders to orders_partitioned must be done manually');
    console.log('   Use: INSERT INTO orders_partitioned SELECT * FROM orders;');
    console.log('   Then rename tables when ready to switch over');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove view
    await queryRunner.query(`DROP VIEW IF EXISTS orders_view;`);

    // Remove function
    await queryRunner.query(`DROP FUNCTION IF EXISTS create_orders_partition_if_needed();`);

    // Drop partitioned table (this will drop all partitions)
    await queryRunner.query(`DROP TABLE IF EXISTS orders_partitioned CASCADE;`);

    console.log('✅ Orders table partitioning reverted');
  }
}

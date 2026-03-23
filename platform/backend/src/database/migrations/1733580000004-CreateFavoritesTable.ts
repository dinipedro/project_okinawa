import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex, TableUnique } from 'typeorm';

export class CreateFavoritesTable1733580000004 implements MigrationInterface {
  name = 'CreateFavoritesTable1733580000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create table
    await queryRunner.createTable(
      new Table({
        name: 'favorites',
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
            name: 'restaurant_id',
            type: 'uuid',
            isNullable: false,
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
        ],
      }),
      true,
    );

    // Create unique constraint
    await queryRunner.createUniqueConstraint(
      'favorites',
      new TableUnique({
        name: 'UQ_favorites_user_restaurant',
        columnNames: ['user_id', 'restaurant_id'],
      }),
    );

    // Create indexes
    await queryRunner.createIndex(
      'favorites',
      new TableIndex({
        name: 'IDX_favorites_user_id',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'favorites',
      new TableIndex({
        name: 'IDX_favorites_restaurant_id',
        columnNames: ['restaurant_id'],
      }),
    );

    // Create foreign keys
    await queryRunner.createForeignKey(
      'favorites',
      new TableForeignKey({
        name: 'FK_favorites_user',
        columnNames: ['user_id'],
        referencedTableName: 'profiles',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'favorites',
      new TableForeignKey({
        name: 'FK_favorites_restaurant',
        columnNames: ['restaurant_id'],
        referencedTableName: 'restaurants',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    await queryRunner.dropForeignKey('favorites', 'FK_favorites_restaurant');
    await queryRunner.dropForeignKey('favorites', 'FK_favorites_user');

    // Drop indexes
    await queryRunner.dropIndex('favorites', 'IDX_favorites_restaurant_id');
    await queryRunner.dropIndex('favorites', 'IDX_favorites_user_id');

    // Drop unique constraint
    await queryRunner.dropUniqueConstraint('favorites', 'UQ_favorites_user_restaurant');

    // Drop table
    await queryRunner.dropTable('favorites');
  }
}

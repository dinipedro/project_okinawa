import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddNotesToTables1701000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'tables',
      new TableColumn({
        name: 'notes',
        type: 'text',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('tables', 'notes');
  }
}

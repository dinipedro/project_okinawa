import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDrinkRecipeCostFields1765900000001 implements MigrationInterface {
  name = 'AddDrinkRecipeCostFields1765900000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "drink_recipes" ADD COLUMN "estimated_cost" decimal(10,2) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "drink_recipes" ADD COLUMN "margin_percentage" decimal(5,2) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "drink_recipes" DROP COLUMN "margin_percentage"`,
    );
    await queryRunner.query(
      `ALTER TABLE "drink_recipes" DROP COLUMN "estimated_cost"`,
    );
  }
}

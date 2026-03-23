import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCategoryIdToMenuItems1764735634555 implements MigrationInterface {
    name = 'AddCategoryIdToMenuItems1764735634555'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "menu_items" RENAME COLUMN "category" TO "category_id"`);
        await queryRunner.query(`ALTER TABLE "menu_items" DROP COLUMN "category_id"`);
        await queryRunner.query(`ALTER TABLE "menu_items" ADD "category_id" uuid`);
        await queryRunner.query(`ALTER TABLE "menu_items" ADD CONSTRAINT "FK_20cff56c44dd4fe52d5aa2b96f8" FOREIGN KEY ("category_id") REFERENCES "menu_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "menu_items" DROP CONSTRAINT "FK_20cff56c44dd4fe52d5aa2b96f8"`);
        await queryRunner.query(`ALTER TABLE "menu_items" DROP COLUMN "category_id"`);
        await queryRunner.query(`ALTER TABLE "menu_items" ADD "category_id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "menu_items" RENAME COLUMN "category_id" TO "category"`);
    }

}

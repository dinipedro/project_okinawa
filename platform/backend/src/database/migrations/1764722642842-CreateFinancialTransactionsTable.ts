import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateFinancialTransactionsTable1764722642842 implements MigrationInterface {
    name = 'CreateFinancialTransactionsTable1764722642842'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."financial_transactions_type_enum" AS ENUM('sale', 'tip', 'refund', 'expense', 'adjustment')`);
        await queryRunner.query(`CREATE TYPE "public"."financial_transactions_category_enum" AS ENUM('food_sales', 'beverage_sales', 'tip_income', 'staff_wages', 'supplies', 'rent', 'utilities', 'marketing', 'maintenance', 'other')`);
        await queryRunner.query(`CREATE TABLE "financial_transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "restaurant_id" uuid NOT NULL, "type" "public"."financial_transactions_type_enum" NOT NULL, "category" "public"."financial_transactions_category_enum" NOT NULL, "amount" numeric(10,2) NOT NULL, "description" text, "reference_id" uuid, "reference_type" character varying, "metadata" jsonb, "transaction_date" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3f0ffe3ca2def8783ad8bb5036b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "financial_transactions" ADD CONSTRAINT "FK_976c2ae3d3e5e58b151e0a16f42" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "financial_transactions" DROP CONSTRAINT "FK_976c2ae3d3e5e58b151e0a16f42"`);
        await queryRunner.query(`DROP TABLE "financial_transactions"`);
        await queryRunner.query(`DROP TYPE "public"."financial_transactions_category_enum"`);
        await queryRunner.query(`DROP TYPE "public"."financial_transactions_type_enum"`);
    }

}

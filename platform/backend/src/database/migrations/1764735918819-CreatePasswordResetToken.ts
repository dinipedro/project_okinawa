import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePasswordResetToken1764735918819 implements MigrationInterface {
    name = 'CreatePasswordResetToken1764735918819'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "password_reset_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "token" character varying NOT NULL, "expires_at" TIMESTAMP NOT NULL, "is_used" boolean NOT NULL DEFAULT false, "used_at" TIMESTAMP, "ip_address" character varying, "user_agent" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_ab673f0e63eac966762155508ee" UNIQUE ("token"), CONSTRAINT "PK_d16bebd73e844c48bca50ff8d3d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_52ac39dd8a28730c63aeb428c9" ON "password_reset_tokens" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_ab673f0e63eac966762155508e" ON "password_reset_tokens" ("token") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_ab673f0e63eac966762155508e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_52ac39dd8a28730c63aeb428c9"`);
        await queryRunner.query(`DROP TABLE "password_reset_tokens"`);
    }

}

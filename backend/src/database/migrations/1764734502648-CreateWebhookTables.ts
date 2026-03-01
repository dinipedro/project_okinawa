import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateWebhookTables1764734502648 implements MigrationInterface {
    name = 'CreateWebhookTables1764734502648'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "webhook_subscriptions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "restaurant_id" uuid NOT NULL, "url" character varying(255) NOT NULL, "events" character varying array NOT NULL, "secret" character varying(255), "is_active" boolean NOT NULL DEFAULT true, "description" text, "failure_count" integer NOT NULL DEFAULT '0', "last_triggered_at" TIMESTAMP, "last_success_at" TIMESTAMP, "last_failure_at" TIMESTAMP, "headers" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_bf631ae77d39849d599817fb6f4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."webhook_deliveries_status_enum" AS ENUM('pending', 'success', 'failed', 'retrying')`);
        await queryRunner.query(`CREATE TABLE "webhook_deliveries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "subscription_id" uuid NOT NULL, "event_type" character varying(100) NOT NULL, "payload" jsonb NOT NULL, "status" "public"."webhook_deliveries_status_enum" NOT NULL DEFAULT 'pending', "response_code" integer, "response_body" text, "retry_count" integer NOT NULL DEFAULT '0', "max_retries" integer NOT NULL DEFAULT '3', "next_retry_at" TIMESTAMP, "delivered_at" TIMESTAMP, "error_message" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_535dd409947fb6d8fc6dfc0112a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "webhook_subscriptions" ADD CONSTRAINT "FK_6dd7d386abfc2a7bdc3c0303693" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "webhook_deliveries" ADD CONSTRAINT "FK_23eb2b6ae801c52cfb79a556b8a" FOREIGN KEY ("subscription_id") REFERENCES "webhook_subscriptions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "webhook_deliveries" DROP CONSTRAINT "FK_23eb2b6ae801c52cfb79a556b8a"`);
        await queryRunner.query(`ALTER TABLE "webhook_subscriptions" DROP CONSTRAINT "FK_6dd7d386abfc2a7bdc3c0303693"`);
        await queryRunner.query(`DROP TABLE "webhook_deliveries"`);
        await queryRunner.query(`DROP TYPE "public"."webhook_deliveries_status_enum"`);
        await queryRunner.query(`DROP TABLE "webhook_subscriptions"`);
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateHrTables1764723106487 implements MigrationInterface {
    name = 'CreateHrTables1764723106487'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."shifts_status_enum" AS ENUM('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')`);
        await queryRunner.query(`CREATE TABLE "shifts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "staff_id" uuid NOT NULL, "restaurant_id" uuid NOT NULL, "date" date NOT NULL, "start_time" TIME NOT NULL, "end_time" TIME NOT NULL, "role" character varying, "status" "public"."shifts_status_enum" NOT NULL DEFAULT 'scheduled', "actual_start_time" TIME, "actual_end_time" TIME, "break_minutes" integer, "notes" text, "is_overtime" boolean NOT NULL DEFAULT false, "hourly_rate" numeric(10,2), "total_pay" numeric(10,2), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_84d692e367e4d6cdf045828768c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."leave_requests_leave_type_enum" AS ENUM('vacation', 'sick_leave', 'personal', 'emergency', 'unpaid', 'maternity', 'paternity')`);
        await queryRunner.query(`CREATE TYPE "public"."leave_requests_status_enum" AS ENUM('pending', 'approved', 'rejected', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "leave_requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "staff_id" uuid NOT NULL, "restaurant_id" uuid NOT NULL, "leave_type" "public"."leave_requests_leave_type_enum" NOT NULL, "start_date" date NOT NULL, "end_date" date NOT NULL, "total_days" integer NOT NULL, "reason" text NOT NULL, "status" "public"."leave_requests_status_enum" NOT NULL DEFAULT 'pending', "reviewed_by" uuid, "reviewed_at" TIMESTAMP, "reviewer_notes" text, "attachments" jsonb, "is_paid" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d3abcf9a16cef1450129e06fa9f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."attendances_status_enum" AS ENUM('present', 'absent', 'late', 'half_day', 'on_leave')`);
        await queryRunner.query(`CREATE TABLE "attendances" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "staff_id" uuid NOT NULL, "restaurant_id" uuid NOT NULL, "date" date NOT NULL, "check_in_time" TIME, "check_out_time" TIME, "status" "public"."attendances_status_enum" NOT NULL DEFAULT 'present', "hours_worked" integer, "overtime_minutes" integer, "notes" text, "location" jsonb, "is_approved" boolean NOT NULL DEFAULT false, "approved_by" uuid, "approved_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_483ed97cd4cd43ab4a117516b69" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "shifts" ADD CONSTRAINT "FK_5d750ec7e9b1c0c4f4edb89621f" FOREIGN KEY ("staff_id") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shifts" ADD CONSTRAINT "FK_b3ef12f347b562807cf6b8ccb79" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "leave_requests" ADD CONSTRAINT "FK_c56fb4812a75bdfad7a635098f5" FOREIGN KEY ("staff_id") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "leave_requests" ADD CONSTRAINT "FK_f1d7952f1efaf47f0be785ad152" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "leave_requests" ADD CONSTRAINT "FK_2f7a4220ff516ce48bdd91ce23d" FOREIGN KEY ("reviewed_by") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attendances" ADD CONSTRAINT "FK_ab399fdbf4648bd7bb78aac3c82" FOREIGN KEY ("staff_id") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attendances" ADD CONSTRAINT "FK_aaf67573f538142858a5ec20d65" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attendances" ADD CONSTRAINT "FK_95efad5988005425fcbee654142" FOREIGN KEY ("approved_by") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attendances" DROP CONSTRAINT "FK_95efad5988005425fcbee654142"`);
        await queryRunner.query(`ALTER TABLE "attendances" DROP CONSTRAINT "FK_aaf67573f538142858a5ec20d65"`);
        await queryRunner.query(`ALTER TABLE "attendances" DROP CONSTRAINT "FK_ab399fdbf4648bd7bb78aac3c82"`);
        await queryRunner.query(`ALTER TABLE "leave_requests" DROP CONSTRAINT "FK_2f7a4220ff516ce48bdd91ce23d"`);
        await queryRunner.query(`ALTER TABLE "leave_requests" DROP CONSTRAINT "FK_f1d7952f1efaf47f0be785ad152"`);
        await queryRunner.query(`ALTER TABLE "leave_requests" DROP CONSTRAINT "FK_c56fb4812a75bdfad7a635098f5"`);
        await queryRunner.query(`ALTER TABLE "shifts" DROP CONSTRAINT "FK_b3ef12f347b562807cf6b8ccb79"`);
        await queryRunner.query(`ALTER TABLE "shifts" DROP CONSTRAINT "FK_5d750ec7e9b1c0c4f4edb89621f"`);
        await queryRunner.query(`DROP TABLE "attendances"`);
        await queryRunner.query(`DROP TYPE "public"."attendances_status_enum"`);
        await queryRunner.query(`DROP TABLE "leave_requests"`);
        await queryRunner.query(`DROP TYPE "public"."leave_requests_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."leave_requests_leave_type_enum"`);
        await queryRunner.query(`DROP TABLE "shifts"`);
        await queryRunner.query(`DROP TYPE "public"."shifts_status_enum"`);
    }

}

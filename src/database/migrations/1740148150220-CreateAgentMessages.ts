import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAgentMessages1740148150220 implements MigrationInterface {
  name = "CreateAgentMessages1740148150220";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."agent_messages_type_enum" AS ENUM('INFO', 'SIMULATION', 'ERROR')`,
    );
    await queryRunner.query(
      `CREATE TABLE "agent_messages" ("id" SERIAL NOT NULL, "message" character varying NOT NULL, "type" "public"."agent_messages_type_enum" NOT NULL DEFAULT 'INFO', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_8c7cdeda30e81dba421925df4fe" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "agent_messages"`);
    await queryRunner.query(`DROP TYPE "public"."agent_messages_type_enum"`);
  }
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

export enum AgentMessageType {
  INFO = "INFO",
  SIMULATION = "SIMULATION",
  ERROR = "ERROR",
}

@Entity({ name: "agent_messages" })
export class AgentMessage {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Column({ type: "varchar" })
  message!: string;

  @Column({
    type: "enum",
    enum: AgentMessageType,
    default: AgentMessageType.INFO,
  })
  type!: AgentMessageType;

  @CreateDateColumn({ type: "timestamp with time zone" })
  created_at!: Date;
}

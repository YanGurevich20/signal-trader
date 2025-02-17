import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { DetectedToken } from "./DetectedToken";

@Entity({ name: "buy_transactions" })
export class BuyTransaction {
  @PrimaryGeneratedColumn("increment")
  id!: string;

  @ManyToOne(() => DetectedToken, { onDelete: "CASCADE", nullable: true })
  @JoinColumn({ name: "detected_token_id" })
  detected_token?: DetectedToken;

  @Column({ 
    type: "decimal", 
    precision: 16, 
    scale: 2,
    transformer: {
      to: (value: number | string): string => value.toString(),
      from: (value: string): number => parseFloat(value)
    }
  })
  spent_sol!: number;

  @Column({ 
    type: "decimal", 
    precision: 16, 
    scale: 2,
    transformer: {
      to: (value: number | string): string => value.toString(),
      from: (value: string): number => parseFloat(value)
    }
  })
  swap_usd_value!: number;

  @Column({ 
    type: "decimal", 
    precision: 16, 
    scale: 2,
    transformer: {
      to: (value: number | string): string => value.toString(),
      from: (value: string): number => parseFloat(value)
    }
  })
  received_amount!: number;

  @Column({ type: "bigint" })
  block!: number;

  @CreateDateColumn({ type: "timestamp with time zone" })
  created_at!: Date;
}

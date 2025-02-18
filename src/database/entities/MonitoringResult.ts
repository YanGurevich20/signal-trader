import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { DetectedToken } from "./DetectedToken.js";
import { BuyTransaction } from "./BuyTransaction.js";

@Entity({ name: "monitoring_results" })
export class MonitoringResult {
  @PrimaryGeneratedColumn("increment")
  id!: string;

  @ManyToOne(() => DetectedToken, { onDelete: "CASCADE" })
  @JoinColumn({ name: "detected_token_id" })
  detected_token!: DetectedToken;

  @ManyToOne(() => BuyTransaction, { onDelete: "CASCADE" })
  @JoinColumn({ name: "buy_transaction_id" })
  buy_transaction!: BuyTransaction;

  @Column({
    type: "decimal",
    precision: 36,
    scale: 18,
    transformer: {
      to: (value: number | string): string => value.toString(),
      from: (value: string): number => parseFloat(value),
    },
  })
  initial_price!: number;

  @Column({
    type: "decimal",
    precision: 36,
    scale: 18,
    transformer: {
      to: (value: number | string): string => value.toString(),
      from: (value: string): number => parseFloat(value),
    },
  })
  highest_price!: number;

  @Column({
    type: "decimal",
    precision: 36,
    scale: 18,
    transformer: {
      to: (value: number | string): string => value.toString(),
      from: (value: string): number => parseFloat(value),
    },
  })
  lowest_price!: number;

  @Column({
    type: "decimal",
    precision: 36,
    scale: 18,
    transformer: {
      to: (value: number | string): string => value.toString(),
      from: (value: string): number => parseFloat(value),
    },
  })
  final_price!: number;

  @Column({
    type: "decimal",
    precision: 36,
    scale: 18,
    transformer: {
      to: (value: number | string): string => value.toString(),
      from: (value: string): number => parseFloat(value),
    },
  })
  potential_sol_return!: number;

  @CreateDateColumn({ type: "timestamp with time zone" })
  created_at!: Date;
}

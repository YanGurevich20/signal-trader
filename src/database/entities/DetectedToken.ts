import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { TwitterUser } from "./TwitterUser";

export type InitialTokenState = {
  liquidity_usd: number;
  transaction_count: number;
  volume_usd: number;
  price_change_percentage: number;
  price_usd: number;
  fdv_usd: number;
};

export type TokenInfo = {
  decimals: number;
  symbol: string;
  is_pumpfun: boolean;
  gt_score: number;
};

@Entity({ name: "detected_tokens" })
export class DetectedToken {
  @PrimaryGeneratedColumn("increment")
  id!: string;

  @ManyToOne(() => TwitterUser, { onDelete: "CASCADE", nullable: true })
  @JoinColumn({ name: "twitter_user_id" })
  twitter_user?: TwitterUser;

  @Column({ type: "varchar" })
  address!: string;

  @Column({ type: "jsonb" })
  token_info!: TokenInfo;

  @Column({ type: "jsonb" })
  initial_state!: InitialTokenState;

  @CreateDateColumn({ type: "timestamp with time zone" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updated_at!: Date;
}

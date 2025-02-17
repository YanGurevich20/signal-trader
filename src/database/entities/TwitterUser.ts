import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "twitter_users" })
export class TwitterUser {
  @PrimaryGeneratedColumn("increment")
  id!: string;

  @Column({ type: "varchar" })
  handle!: string;

  @Column({ type: "varchar" })
  display_name!: string;

  @Column({ type: "integer" })
  follower_count!: number;

  @Column({ type: "integer", nullable: true })
  following_count?: number;

  @Column({ type: "integer", nullable: true })
  tweet_count?: number;

  @Column({ type: "boolean", nullable: true })
  is_verified?: boolean;

  @CreateDateColumn({ type: "timestamp with time zone" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updated_at!: Date;
}

import { DetectedToken } from "@/database/entities/DetectedToken";
import { createJupiterApiClient } from "@jup-ag/api";
import { NATIVE_MINT } from "@solana/spl-token";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { sleep } from "@/utils/sleep";
import { msValues } from "@/utils/time/msValues";
import { database } from "@/database/database";
import { MonitoringResult } from "@/database/entities/MonitoringResult";
import { BuyTransaction } from "@/database/entities/BuyTransaction";

export class TokenPriceMonitor {
  private static instances: Map<string, TokenPriceMonitor> = new Map();
  private isRunning: boolean = false;
  private initialPrice: number;
  private highestPrice: number;
  private lowestPrice: number;
  private lastPrice: number;

  private constructor(
    private token: DetectedToken,
    private buyTransaction: BuyTransaction,
  ) {
    this.initialPrice = token.initial_state.price_usd;
    this.highestPrice = this.initialPrice;
    this.lowestPrice = this.initialPrice;
    this.lastPrice = this.initialPrice;
  }

  static async startMonitoring(
    token: DetectedToken,
    buyTransaction: BuyTransaction,
  ) {
    if (this.instances.has(token.address)) {
      return;
    }

    const monitor = new TokenPriceMonitor(token, buyTransaction);
    this.instances.set(token.address, monitor);
    await monitor.start();
  }

  private async getCurrentPrice(): Promise<number> {
    const client = createJupiterApiClient();
    const quote = await client.quoteGet({
      inputMint: this.token.address,
      outputMint: NATIVE_MINT.toBase58(),
      amount:
        this.buyTransaction.received_amount *
        10 ** this.token.token_info.decimals,
    });

    return Number(quote.outAmount) / LAMPORTS_PER_SOL;
  }

  private async saveResults() {
    const monitoringResult = new MonitoringResult();
    monitoringResult.detected_token = this.token;
    monitoringResult.buy_transaction = this.buyTransaction;
    monitoringResult.initial_price = this.initialPrice;
    monitoringResult.highest_price = this.highestPrice;
    monitoringResult.lowest_price = this.lowestPrice;
    monitoringResult.final_price = this.lastPrice;
    monitoringResult.potential_sol_return = this.lastPrice;

    const monitoringRepo = await database.getRepository(MonitoringResult);
    await monitoringRepo.save(monitoringResult);
  }

  private async start() {
    if (this.isRunning) return;
    this.isRunning = true;

    const INTERVAL = 10 * msValues.second;
    const DURATION = 10 * msValues.minute;
    const iterations = DURATION / INTERVAL;

    console.log(`Starting price monitor for ${this.token.address}`);

    for (let i = 0; i < iterations && this.isRunning; i++) {
      try {
        const currentPrice = await this.getCurrentPrice();
        this.lastPrice = currentPrice;
        this.highestPrice = Math.max(this.highestPrice, currentPrice);
        this.lowestPrice = Math.min(this.lowestPrice, currentPrice);

        console.log(
          `${this.token.address} - Current: $${currentPrice} | High: $${this.highestPrice} | Low: $${this.lowestPrice}`,
        );

        await sleep(INTERVAL);
      } catch (error) {
        console.error(`Error monitoring ${this.token.address}:`, error);
      }
    }

    await this.saveResults();
    this.stop();
  }

  private stop() {
    this.isRunning = false;
    TokenPriceMonitor.instances.delete(this.token.address);
    console.log(`Stopped monitoring ${this.token.address}`);
  }
}

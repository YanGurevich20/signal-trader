import { database } from "@/database/database";
import { MonitoringResult } from "@/database/entities/MonitoringResult";

const main = async () => {
  const monitoringRepo = await database.getRepository(MonitoringResult);

  // Get all monitoring results with related data
  const results = await monitoringRepo.find({
    relations: {
      detected_token: true,
      buy_transaction: true,
    },
    order: {
      created_at: "DESC",
    },
  });

  console.log("\n=== Token Performance Report ===\n");

  for (const result of results) {
    const token = result.detected_token;
    const buy = result.buy_transaction;

    // Calculate potential profit/loss
    const initialValue = buy.spent_sol;
    const finalValue = result.potential_sol_return;

    // Calculate PnL at different points
    const pnlPercentage = ((finalValue - initialValue) / initialValue) * 100;
    const peakValue =
      (result.highest_price / buy.token_price_usd) * initialValue;
    const peakPnlPercentage = ((peakValue - initialValue) / initialValue) * 100;
    const thirtyPercentValue = initialValue * 1.3;
    const hasReached30Percent = thirtyPercentValue < peakValue;

    console.log(`
Token: ${token.token_info.symbol} (${token.address})
Initial SOL: ${initialValue} SOL
Entry Price: $${buy.token_price_usd.toFixed(6)}
Highest Price: $${result.highest_price.toFixed(6)}
Lowest Price: $${result.lowest_price.toFixed(6)}
Final Price: $${result.final_price.toFixed(6)}
Would have been sold at 30%: ${hasReached30Percent ? "Yes" : "No"}
PnL if sold at 30% gain: +30.00% (${thirtyPercentValue.toFixed(4)} SOL)
PnL if sold at peak: ${peakPnlPercentage.toFixed(2)}% (${peakValue.toFixed(4)} SOL)
PnL if sold at end: ${pnlPercentage.toFixed(2)}% (${finalValue.toFixed(4)} SOL)
Token detected at: ${token.created_at.toLocaleString()}
Opened position at: ${buy.created_at.toLocaleString()}
Monitoring ended at: ${result.created_at.toLocaleString()}
----------------------------------------`);
  }
};

main().catch(console.error);

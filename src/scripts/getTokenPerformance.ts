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
    const tw = initialValue * 1.3;
    const hasReached30Percent = tw < peakValue;

    console.log(`
Token: ${token.token_info.symbol} (${token.address})
Initial SOL: ${initialValue} SOL
Entry Price: $${buy.token_price_usd.toFixed(6)} 
Highest Price: $${result.highest_price.toFixed(6)}
Lowest Price: $${result.lowest_price.toFixed(6)}
Final Price: $${result.final_price.toFixed(6)}
Would have been sold at 30%: ${hasReached30Percent ? "Yes" : "No"}
PnL if sold at 30% gain: +30.00% (${tw.toFixed(4)} SOL)
PnL if sold at peak: ${peakPnlPercentage.toFixed(2)}% (${peakValue.toFixed(4)} SOL)
PnL if sold at end: ${pnlPercentage.toFixed(2)}% (${finalValue.toFixed(4)} SOL)
Token detected at: ${token.created_at.toLocaleString()}
Opened position at: ${buy.created_at.toLocaleString()}
Monitoring ended at: ${result.created_at.toLocaleString()}
----------------------------------------`);
  }
};
//** pnl calculation helper **/
// pnl per transaction either +20%, -50% or some value between (after 10 minutes)
// each transaction costs 0.1 SOL. 20 tokens, 2 SOL spent
//tx 1 + 1.2 SOL 20% take proft
//tx 2 + 1.2 SOL 20% take proft
//tx 3 - 0.5 SOL 50% loss
//...
//21.2 SOL returned <- pnl

// potentialSolReturn - how much sol we would have got if sold 100% at final price sol_if_held_till_end

// 20% take profit, 50% stop loss
// peak price result.highest_price <- if that's 20% higher than the entry price, we consider the trade a 20% gain (+0.02SOL pnl)
// if result.lowest_price is 50% lower than the entry price, we consider the trade a 50% loss (-0.05SOL pnl)
// else loss of lowest price - as if we sold automatically after 10 minutes (monitoring period)

main().catch(console.error);

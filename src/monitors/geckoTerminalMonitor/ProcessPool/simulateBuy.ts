import { DetectedToken } from "@/database/entities/DetectedToken";
import { NATIVE_MINT } from "@solana/spl-token";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { createJupiterApiClient } from "@jup-ag/api";
import { BuyTransaction } from "@/database/entities/BuyTransaction";
import { database } from "@/database/database";

export const simulateBuy = async (token: DetectedToken) => {
  const solToSpend = 0.1;
  const decimals = token.token_info.decimals;
  const address = token.address;
  const amountToBuy = solToSpend * LAMPORTS_PER_SOL;
  const client = createJupiterApiClient();
  const quote = await client.quoteGet({
    inputMint: NATIVE_MINT.toBase58(),
    outputMint: address,
    amount: amountToBuy,
  });
  const receivedAmount = Number(quote.outAmount) / 10 ** decimals;
  const usd_value = Number(quote.swapUsdValue);
  const buyTransaction = new BuyTransaction();
  const block = quote.contextSlot ?? 0;

  buyTransaction.detected_token = token;
  buyTransaction.spent_sol = solToSpend;
  buyTransaction.swap_usd_value = usd_value;
  buyTransaction.received_amount = receivedAmount;
  buyTransaction.block = block;
  const buyTransactionRepo = await database.getRepository(BuyTransaction);
  await buyTransactionRepo.save(buyTransaction);
};

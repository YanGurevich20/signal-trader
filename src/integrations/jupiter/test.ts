import { createJupiterApiClient } from '@jup-ag/api';
import {LAMPORTS_PER_SOL} from "@solana/web3.js"
import { NATIVE_MINT } from "@solana/spl-token";

export const main = async () => {
  const client = createJupiterApiClient();
  const testTarget = "6vLt6Fj2kQ9eS3pBTBAc4AcNUFHZVJEhPudGr617Xsnw"
  const quote = await client.quoteGet({
    inputMint: NATIVE_MINT.toBase58(),
    outputMint: testTarget,
    amount: 0.01 * LAMPORTS_PER_SOL,
    slippageBps: 500, // 5%
  });
  console.dir(quote, { depth: null });
};

main();

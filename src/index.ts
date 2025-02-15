import { msValues } from "@/utils/time/msValues";
import { getLatestPools } from "./integrations/geckoTerminal/getLatestPools";
import { getTokenInfo } from "./integrations/geckoTerminal/getTokenInfo";
import { getTokenPools } from "./integrations/geckoTerminal/getTokenPools";
import { getUserInfo } from "./integrations/twitter/getUserInfo";
import { sleep } from "@/utils/sleep";
import { getElapsedTime } from "@/utils/time/getElapsedTime";

async function main() {
  while (true) {
    await sleep(2000);
    const allPools = await getLatestPools();
    const pools = allPools.filter(pool => new Date(pool.attributes.pool_created_at).getTime() > Date.now() - msValues.minute * 2);
    const newestPool = getElapsedTime(new Date(pools[0].attributes.pool_created_at).getTime());
    const oldestPool = getElapsedTime(new Date(pools[pools.length - 1].attributes.pool_created_at).getTime());
    console.log(`${new Date().toLocaleTimeString('en-GB')} - processing ${pools.length} pools. Closest: ${newestPool.minutes}m ${newestPool.seconds}s - Farthest: ${oldestPool.minutes}m ${oldestPool.seconds}s`);
    for (const [index, pool] of pools.entries()) {
      await sleep(2000);
      const poolAddress = pool.attributes.address;
      const {hours, minutes, seconds} = getElapsedTime(new Date(pool.attributes.pool_created_at).getTime());
      const tokenAddress = pool.relationships.base_token.data.id.split("_")[1];
      let tokenInfo;
      try {
        tokenInfo = await getTokenInfo(tokenAddress);
      } catch {
        console.log("Error getting token info, skipping...");
        continue;
      }
      const existingPools = await getTokenPools(tokenAddress);
      const twitterHandle = tokenInfo.attributes.twitter_handle;
      if (twitterHandle) {
        try{
          const userInfo = await getUserInfo(twitterHandle);
          if (userInfo.followers > 10000) {
            console.log('--------------------------------');
            console.log(`${new Date().toLocaleTimeString('en-GB')} - ${index + 1}/${pools.length} - ${tokenInfo.attributes.symbol} has ${userInfo.followers} followers. Link: https://www.geckoterminal.com/solana/pools/${poolAddress}.`);
            console.log(`Existing pools: ${existingPools.length}. Pool created ${hours}h ${minutes}m ${seconds}s ago`);
            console.log('--------------------------------');
          }
        } catch {
          console.log("Error getting user info");
          break;
        }
      } else {
        // console.log("No twitter handle found");
      }
    }
    
    // console.log("Waiting 30 seconds before next iteration...");
    // await sleep(30000);
  }
}

main().catch((error) => {
  console.error('Error in main:', error);
  main();
});

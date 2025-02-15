import { getLatestPools } from "./integrations/geckoTerminal/getLatestPools";
import { getTokenInfo } from "./integrations/geckoTerminal/getTokenInfo";
import { getUserInfo } from "./integrations/twitter/getUserInfo";

const pools = await getLatestPools();
for (const pool of pools.data) {
  const tokenAddress = pool.relationships.base_token.data.id.split("_")[1];
  const tokenInfo = await getTokenInfo(tokenAddress);
  console.log(tokenInfo);

  const twitterHandle = tokenInfo.data.attributes.twitter_handle;

  if (twitterHandle) {
    const userInfo = await getUserInfo(twitterHandle);
    console.log(userInfo);
    break;
  } else {
    console.log("No twitter handle found");
  }
}

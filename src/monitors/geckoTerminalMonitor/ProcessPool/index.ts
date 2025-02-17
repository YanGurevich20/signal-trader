import { Pool } from "@/integrations/geckoTerminal/getLatestPools/types";
import { getTokenInfo } from "@/integrations/geckoTerminal/getTokenInfo";
import { getOrInsertUser } from "@/integrations/twitter/getOrInsertUser";
import { getTokenPools } from "@/integrations/geckoTerminal/getTokenPools";
import { AxiosError } from "axios";
import { logSkip } from "@/utils/errors/logger";
import { notifyToken } from "./notifyToken";
import { simulateBuy } from "./simulateBuy";

export const processPool = async (pool: Pool) => {
  const tokenAddress = pool.relationships.base_token.data.id.split("_")[1];
  try {
    const tokenInfo = await getTokenInfo(tokenAddress);
    const twitterHandle = tokenInfo.attributes.twitter_handle;
    if (!twitterHandle) {
      console.log(`${tokenAddress} has no twitter handle`);
      return;
    }
    const user = await getOrInsertUser(twitterHandle);
    if (user.follower_count < 10_000 || user.follower_count > 100_000_000) {
      await logSkip(
        `Skipping token ${tokenAddress} with ${user.follower_count} followers for user ${twitterHandle}`,
      );
      return;
    }
    const existingPoolCount = (await getTokenPools(tokenAddress)).length;
    if (existingPoolCount > 1) {
      await logSkip(
        `Skipping token ${tokenAddress} with ${existingPoolCount} pools`,
      );
      return;
    }
    const liquidity = pool.attributes.reserve_in_usd;
    if (Number(liquidity) < 5_000) {
      await logSkip(
        `Skipping token ${tokenAddress} with ${liquidity} liquidity`,
      );
      return;
    }
    const token = await notifyToken(pool, tokenInfo, user);
    await simulateBuy(token);
  } catch (error) {
    if (error instanceof AxiosError) {
      const data = error.response?.data as {
        status: string;
        message: string;
      }[];
      console.error("error in processPool", data[0]?.message);
    } else {
      console.error("error in processPool", error);
    }
    return;
  }
};

//data to save
// - pool address
// - token address
// - token symbol
// - token twitter handle
// - token twitter followers
// - pool created at

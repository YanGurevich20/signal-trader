import { Pool } from "@/integrations/geckoTerminal/getLatestPools/types";
import { getTokenInfo } from "@/integrations/geckoTerminal/getTokenInfo";
import { getOrInsertUser } from "@/integrations/twitter/getOrInsertUser";
import { getTokenPools } from "@/integrations/geckoTerminal/getTokenPools";
import { AxiosError } from "axios";
import { logSkip } from "@/utils/errors/logger";
import { notifyToken } from "./notifyToken";
import { simulateBuy } from "./simulateBuy";
import { database } from "@/database/database";
import { DetectedToken } from "@/database/entities/DetectedToken";
import { logAgentMessage } from "@/utils/agentLog";
import { AgentMessageType } from "@/database/entities/AgentMessage";

export const processPool = async (pool: Pool) => {
  const tokenAddress = pool.relationships.base_token.data.id.split("_")[1];
  try {
    const tokenRepo = await database.getRepository(DetectedToken);
    const existingToken = await tokenRepo.findOne({
      where: { address: tokenAddress },
    });
    if (existingToken) {
      return;
    }
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
      // Log that we found an interesting token before processing it
      await logAgentMessage(
        `Found a curious token ${tokenAddress}, but it has less than 5000 liquidity (around ${liquidity})`,
        AgentMessageType.SIMULATION,
      );

      return;
    }
    const transactionCount =
      Number(pool.attributes.transactions.h24.buys) +
      Number(pool.attributes.transactions.h24.sells);
    if (transactionCount < 10) {
      await logSkip(
        `Skipping token ${tokenAddress} with ${transactionCount} transactions`,
      );
      return;
    }

    // Log that we found an interesting token before processing it
    await logAgentMessage(
      `Found interesting token ${tokenAddress} (${tokenInfo.attributes.name}) with ${user.follower_count} followers, $${Number(liquidity).toFixed(2)} liquidity`,
      AgentMessageType.SIMULATION,
    );

    const token = await notifyToken(pool, tokenInfo, user);
    await simulateBuy(token);
  } catch (error) {
    if (error instanceof AxiosError) {
      const data = error.response?.data as {
        status: string;
        message: string;
      }[];
      console.error("error in processPool", data[0]?.message);
      await logAgentMessage(
        `Error processing token ${tokenAddress}: ${data[0]?.message}`,
        AgentMessageType.ERROR,
      );
    } else {
      console.error("error in processPool", error);
      await logAgentMessage(
        `Error processing token ${tokenAddress}: ${error instanceof Error ? error.message : String(error)}`,
        AgentMessageType.ERROR,
      );
    }
    return;
  }
};

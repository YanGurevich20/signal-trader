import { Pool } from "@/integrations/geckoTerminal/getLatestPools/types";
import { TwitterUser } from "@/database/entities/TwitterUser";
import { DetectedToken } from "@/database/entities/DetectedToken";
import { database } from "@/database/database";
import { sendDiscordMessage } from "@/notifications/discord/sendMessage";
import { DiscordWebhooks } from "@/notifications/discord/config";

export const notifyToken = async (pool: Pool, user: TwitterUser): Promise<DetectedToken> => {
  const tokenAddress = pool.relationships.base_token.data.id.split("_")[1];
  const tokenRepo = await database.getRepository(DetectedToken)
  const token = await tokenRepo.findOne({ where: { address: tokenAddress } });
  if (token) {
    return token;
  }
  const newToken = new DetectedToken();
  newToken.address = tokenAddress;
  newToken.twitter_user = user;
  newToken.initial_state = {
    liquidity_usd: Number(pool.attributes.reserve_in_usd),
    transaction_count: Number(pool.attributes.transactions.h24.buys) + Number(pool.attributes.transactions.h24.sells),
    volume_usd: Number(pool.attributes.volume_usd.h24),
    price_change_percentage: Number(pool.attributes.price_change_percentage.h24),
    price_usd: Number(pool.attributes.base_token_price_usd),
    fdv_usd: Number(pool.attributes.fdv_usd),
  };
  await tokenRepo.save(newToken);
  const message = 
  `🚀 New token detected: ${tokenAddress}\n`+
  `gecko: https://geckoterminal.com/solana/pools/${pool.attributes.address}\n`+
  `twitter: https://x.com/${user.handle} | ${user.follower_count} followers\n`+
  `liquidity: ${newToken.initial_state.liquidity_usd}\n`
  await sendDiscordMessage(message, DiscordWebhooks.token_notifications)
  return newToken;
}
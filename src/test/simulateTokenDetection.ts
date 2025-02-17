import { getLatestPools } from "@/integrations/geckoTerminal/getLatestPools";
import { getTokenInfo } from "@/integrations/geckoTerminal/getTokenInfo";
import { TwitterUser } from "@/database/entities/TwitterUser";
import { database } from "@/database/database";
import { notifyToken } from "@/monitors/geckoTerminalMonitor/ProcessPool/notifyToken";
import { simulateBuy } from "@/monitors/geckoTerminalMonitor/ProcessPool/simulateBuy";
import { MonitoringResult } from "@/database/entities/MonitoringResult";
import { msValues } from "@/utils/time/msValues";

export const main = async () => {
  try {
    // Get first pool from latest pools
    const pools = await getLatestPools(true); // skipSleep = true
    const pool = pools[0];
    const tokenAddress = pool.relationships.base_token.data.id.split("_")[1];
    
    console.log("Testing with token:", tokenAddress);
    console.log("Pool address:", pool.attributes.address);
    
    // Get token info
    const tokenInfo = await getTokenInfo(tokenAddress, true); // skipSleep = true
    
    // Create fake twitter user
    const userRepo = await database.getRepository(TwitterUser);
    const users = await userRepo.find();
    const user = users[0];
    
    // Create token and simulate buy
    const token = await notifyToken(pool, tokenInfo, user);
    await simulateBuy(token);
    
    // Wait for monitoring to complete (10 minutes + buffer)
    console.log("Monitoring started, waiting for completion...");
    await new Promise(resolve => setTimeout(resolve, 11 * msValues.minute));
    
    // Check results
    const monitoringRepo = await database.getRepository(MonitoringResult);
    const results = await monitoringRepo.find({
      where: { detected_token: { address: tokenAddress } },
      relations: ["detected_token", "buy_transaction"],
    });
    
    console.log("Monitoring results:", results);
    
  } catch (error) {
    console.error("Error in test:", error);
  }
};

// Run if called directly
main();
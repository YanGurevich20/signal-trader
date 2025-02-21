import { msValues } from "@/utils/time/msValues";
import { getLatestPools } from "@/integrations/geckoTerminal/getLatestPools";
import { logTimes } from "./logTimes";
import { processPool } from "./ProcessPool";
import { logAgentMessage } from "@/utils/agentLog";
import { AgentMessageType } from "@/database/entities/AgentMessage";

export const geckoTerminalMonitor = async () => {
  await logAgentMessage("GeckoTerminal monitor started", AgentMessageType.INFO);

  while (true) {
    try {
      const allPools = await getLatestPools();
      const pools = allPools.filter(
        (pool) =>
          new Date(pool.attributes.pool_created_at).getTime() >
          Date.now() - msValues.minute * 3,
      );

      // Only log if we found new pools

      const { newestPool, oldestPool } = logTimes(pools);
      if (pools.length > 0) {
        await logAgentMessage(
          `Processing ${pools.length} new pools from last ${oldestPool.minutes}m ${oldestPool.seconds}s`,
          AgentMessageType.INFO,
        );
      }

      for (const pool of pools) {
        await processPool(pool);
      }
    } catch (error: unknown) {
      console.error("error in geckoTerminalMonitor", error);
      // await logAgentMessage(
      //   `Monitor error: ${error instanceof Error ? error.message : String(error)}`,
      //   AgentMessageType.ERROR
      // );
    }
  }
};

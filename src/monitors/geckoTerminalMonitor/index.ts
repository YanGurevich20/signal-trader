import { msValues } from "@/utils/time/msValues";
import { getLatestPools } from "@/integrations/geckoTerminal/getLatestPools";
import { logTimes } from "./logTimes";
import { processPool } from "./ProcessPool";

export const geckoTerminalMonitor = async () => {
  while (true) {
    try{
      const allPools = await getLatestPools();
      const pools = allPools.filter(
        (pool) =>
          new Date(pool.attributes.pool_created_at).getTime() >
        Date.now() - msValues.minute * 3,
      );
      logTimes(pools);
      for (const pool of pools) {
        await processPool(pool);
      }
    } catch (error) {
      console.error("error in geckoTerminalMonitor", error);
    }
  }
};

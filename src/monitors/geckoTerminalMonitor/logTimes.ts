import { Pool } from "@/integrations/geckoTerminal/getLatestPools/types";
import { getElapsedTime } from "@/utils/time/getElapsedTime";

export const logTimes = (pools: Pool[]) => {
  const newestPool = getElapsedTime(
    new Date(pools[0].attributes.pool_created_at).getTime(),
  );
  const oldestPool = getElapsedTime(
    new Date(pools[pools.length - 1].attributes.pool_created_at).getTime(),
  );
  console.log(
    `${new Date().toLocaleTimeString("en-GB")} - processing ${pools.length} pools. Closest: ${newestPool.minutes}m ${newestPool.seconds}s - Farthest: ${oldestPool.minutes}m ${oldestPool.seconds}s`,
  );
};

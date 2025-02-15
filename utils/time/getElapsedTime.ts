import { formatMs } from "./formatMs";

export const getElapsedTime = (timestamp: number) => {
  const now = new Date();
  const poolDate = new Date(timestamp);
  const diffMs = Math.abs(now.getTime() - poolDate.getTime());
  return formatMs(diffMs);
};
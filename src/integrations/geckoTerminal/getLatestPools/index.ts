import axios from "axios";
import { BASE_URL } from "../../geckoTerminal/config";
import { LatestPoolsResponse } from "./types";

export const getLatestPools = async () => {
  const result = await axios.get<LatestPoolsResponse>(
    `${BASE_URL}/networks/solana/new_pools`,
    {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        Cookie: new Date().getTime().toString(),
      },
    },
  );
  return result.data.data;
};

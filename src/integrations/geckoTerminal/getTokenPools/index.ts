import axios from "axios";
import { BASE_URL } from "../config";
import { GeckoPoolResponse } from "./types";

export const getTokenPools = async (tokenAddress: string) => {
  const result = await axios.get<GeckoPoolResponse>(
    `${BASE_URL}/networks/solana/tokens/${tokenAddress}/pools`,
  );
  return result.data.data;
};

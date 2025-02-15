import axios from "axios";
import { BASE_URL } from "../config";
import { TokenInfoResponse } from "./types";

export const getTokenInfo = async (tokenAddress: string) => {
  const result = await axios.get<TokenInfoResponse>(
    `${BASE_URL}/networks/solana/tokens/${tokenAddress}/info`,
  );
  return result.data.data;
};

import axios from "axios";
import { TwitterUserInfo } from "./types";

export const getUserInfo = async (handle: string): Promise<TwitterUserInfo> => {
  const url = `https://api-v2.nextcounts.com/api/twitter/user/stats/${handle}`;
  const response = await axios.get<TwitterUserInfo>(url, { timeout: 5000 });
  return response.data;
};

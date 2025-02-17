import axios from "axios";
import { TwitterUserInfo } from "./types";

export const getUserInfo = async (handle: string): Promise<TwitterUserInfo> => {
  const url = `https://api-v2.nextcounts.com/api/twitter/user/stats/${handle}`;
  const response = await axios.get<TwitterUserInfo>(url, { timeout: 10000 });
  if (response.data.success) {
    return response.data;
  }
  if (response.data.error === "User not found.") {
    return {
      success: true,
      username: handle,
      followers: 0,
    };
  }
  throw new Error(`Failed to get user info ${handle}: ${response.data.error}`);
};

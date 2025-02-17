import { DiscordWebhooks } from "./config";
import axios from "axios";
export const sendDiscordMessage = async (
  message: string,
  webhook: DiscordWebhooks,
) => {
  const result = await axios.post(webhook, {
    content: message,
  });
  return result;
};

import { DiscordWebhooks } from "@/notifications/discord/config";
import { sendDiscordMessage } from "@/notifications/discord/sendMessage";

export const logError = async (message: string) => {
  console.error(message);
  await sendDiscordMessage(message, DiscordWebhooks.error_log);
};

export const logSkip = async (message: string) => {
  console.info(message);
  await sendDiscordMessage(message, DiscordWebhooks.token_skip_log);
};

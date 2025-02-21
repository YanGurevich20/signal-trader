import { database } from "@/database/database";
import {
  AgentMessage,
  AgentMessageType,
} from "@/database/entities/AgentMessage";

// Rate limiting: max 6 logs per minute
const MAX_LOGS_PER_MINUTE = 6;
const LOG_WINDOW_MS = 60 * 1000; // 1 minute
let logCount = 0;
let lastResetTime = Date.now();

export const logAgentMessage = async (
  message: string,
  type = AgentMessageType.INFO,
) => {
  const now = Date.now();

  // Reset counter if window has passed
  if (now - lastResetTime >= LOG_WINDOW_MS) {
    logCount = 0;
    lastResetTime = now;
  }

  // Check rate limit
  if (logCount >= MAX_LOGS_PER_MINUTE) {
    console.log("Rate limit reached for agent messages");
    return;
  }

  try {
    const messageRepo = await database.getRepository(AgentMessage);
    const agentMessage = new AgentMessage();
    agentMessage.message = message;
    agentMessage.type = type;
    await messageRepo.save(agentMessage);
    logCount++;
  } catch (error) {
    console.error("Error logging agent message:", error);
  }
};

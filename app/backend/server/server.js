const { sendTelegramMessage } = require("@/app/backend/server/telegram_server");
const { sendGmailAlert } = require("@/app/backend/server/gmail_server");
const winston = require("winston");
require("dotenv").config({ path: [".env.local", ".env"] });

const logger = winston.createLogger({
  transports: [new winston.transports.File({ filename: "alerts.log" })],
});

const PLATFORMS = {
  TELEGRAM: "telegram",
  GMAIL: "gmail",
};

const alertStrategies = {
  [PLATFORMS.TELEGRAM]: async (botName, chatId, message, threadId, email, subject, username, assigner) => {
    if (!botName?.trim() || !chatId?.trim() || !message?.trim() || !username?.trim()) {
      throw new Error(
        `Missing required fields: ${!botName?.trim() ? "botName" : ""} ${
          !chatId?.trim() ? "chatId" : ""
        } ${!message?.trim() ? "message" : ""} ${!username?.trim() ? "username" : ""}`
      );
    }
    if (message.includes("Status: Assign from") && !assigner?.trim()) {
      throw new Error("Assigner is required when status is Assigned");
    }
    if (message.trim() === "========================================================") {
      throw new Error("Message contains only design elements");
    }
    logger.info("Calling sendTelegramMessage", {
      timestamp: new Date().toISOString(),
      botName,
      chatId,
      username,
      assigner,
      threadId,
      messageLength: message?.length,
    });
    return await sendTelegramMessage(botName, chatId, message, threadId, username);
  },
  [PLATFORMS.GMAIL]: async (_, __, message, ___, email, subject) => {
    if (!email?.trim() || !message?.trim()) {
      throw new Error(
        `Missing required fields: ${!email?.trim() ? "email" : ""} ${
          !message?.trim() ? "message" : ""
        }`
      );
    }
    return await sendGmailAlert(email, message, subject);
  },
};

async function sendAlert(platform, params) {
  const { botName, chatId, threadId, email, message, subject, username, assigner } = params || {};
  try {
    const strategy = alertStrategies[platform];
    if (!strategy) {
      throw new Error(`Invalid platform: ${platform}`);
    }
    logger.info("Sending alert with:", {
      platform,
      botName,
      chatId,
      username,
      assigner,
      threadId,
      email,
      subject,
      message: message?.substring(0, 50),
    });
    const result = await strategy(botName, chatId, message, threadId, email, subject, username, assigner);
    logger.info(`Sent ${platform} alert`, {
      timestamp: new Date().toISOString(),
      platform,
      botName,
      chatId,
      email,
      subject,
      username,
      assigner,
      messageId: result.messageId,
    });
    return result;
  } catch (error) {
    logger.error(`Failed to send ${platform} alert: ${error.message}`, {
      timestamp: new Date().toISOString(),
      platform,
      botName,
      chatId,
      email,
      username,
      assigner,
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

module.exports = { sendAlert };

// server/server.js
const { sendTelegramMessage } = require("@/app/backend/server/telegram_server");

// Function to handle alert sending based on platform
async function sendAlert(platform, { botName, username, chatId, threadId, email, message }) {
  if (platform === "telegram") {
    return await sendTelegramMessage(botName, chatId, message, threadId);
  } else if (platform === "gmail") {
    // Placeholder for Gmail logic
    console.log("Sending Gmail alert:", { email, message });
    return { success: true, message: "Gmail alert sent successfully" };
  } else {
    throw new Error("Invalid platform specified");
  }
}

module.exports = { sendAlert };

// server/telegramserver.js
const mysql = require("mysql2/promise");
const { dbConfig } = require("@/app/database/db-config");

async function sendTelegramMessage(botName, chatId, message) {
  let connection;
  try {
    // Create MySQL connection
    connection = await mysql.createConnection(dbConfig);

    // Query to fetch bot_token based on bot_name
    const [rows] = await connection.execute(
      "SELECT bot_token FROM tbl_telegrambots WHERE bot_name = ?",
      [botName]
    );

    if (!rows || rows.length === 0) {
      throw new Error(`No bot found with name: ${botName}`);
    }
    
    const botToken = rows[0].bot_token;

    // Construct Telegram API URL (no thread ID)
    const url = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${encodeURIComponent(chatId)}&text=${encodeURIComponent(message)}`;

    // Make request to Telegram API
    const response = await fetch(url, {
      method: "GET",
    });

    const data = await response.json();
    if (!response.ok || !data.ok) {
      throw new Error(data.description || "Failed to send Telegram message");
    }

    return { success: true, message: "Telegram alert sent successfully" };
  } catch (error) {
    throw new Error(error.message || "Failed to send Telegram message");
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

module.exports = { sendTelegramMessage };

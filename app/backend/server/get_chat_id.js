import TelegramBot from 'node-telegram-bot-api';
import mysql from 'mysql2/promise';
import { config } from 'dotenv';


// Load environment variables
config();

async function getBotToken() {
  let connection;

  try {
    connection = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'pttcl_helpdesk_nextjs',
  port: process.env.DB_PORT || 3307,
    });
    const [rows] = await connection.execute(
      'SELECT bot_token FROM tbl_telegrambots WHERE bot_id = ?',
      [1]
    );

    if (rows.length === 0) {
      throw new Error('No bot found with bot_id = 1');
    }

    return rows[0].bot_token;
  } catch (error) {
    console.error('Error fetching bot token from database:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function startBot() {
  try {
    const token = await getBotToken();
    const bot = new TelegramBot(token, { polling: true });

    console.log('Bot is running and polling for messages.');

    bot.on('message', (msg) => {
      if (!msg.text) {
        return bot.sendMessage(msg.chat.id, 'Please send a text command like /start.');
      }

      const text = msg.text.toLowerCase();
      const chatId = msg.chat.id;

      if (text !== '/start') {
        return bot.sendMessage(chatId, 'Please send /start to get your chat ID.');
      }

      console.log('Received /start from Chat ID:', chatId, 'Username:@', msg.from?.username || 'N/A');
      bot.sendMessage(chatId, `Thanks! Your chat ID is ${chatId}. Use this for configuring alerts.`)
        .catch((error) => console.error('Error sending message:', error));
    });

    bot.on('polling_error', (error) => {
      console.error('Polling error:', error.message);
    });
  } catch (error) {
    console.error('Failed to start bot:', error.message);
    process.exit(1);
  }
}

startBot();
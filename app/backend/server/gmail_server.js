const nodemailer = require("nodemailer");
const sanitizeHtml = require("sanitize-html");
const winston = require("winston");
require("dotenv").config();

const logger = winston.createLogger({
  transports: [new winston.transports.File({ filename: "gmail_alerts.log" })],
});

const GMAIL_SENDER = process.env.GMAIL_USER || "pttpos.system@gmail.com";
const GMAIL_PASS = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, "");
let transporter;

function initializeGmail() {
  try {
    if (!GMAIL_SENDER || !GMAIL_PASS) {
      logger.error("Gmail credentials not configured", { rawPassword: process.env.GMAIL_APP_PASSWORD });
      throw new Error("Gmail credentials not configured in environment variables");
    }
    if (!/^[a-zA-Z0-9]{16}$/.test(GMAIL_PASS)) {
      logger.error("Invalid app-specific password format", { rawPassword: process.env.GMAIL_APP_PASSWORD, normalizedPassword: GMAIL_PASS });
      throw new Error("Invalid app-specific password format. Ensure GMAIL_APP_PASSWORD is a 16-character code generated for Mail.");
    }

    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: GMAIL_SENDER,
        pass: GMAIL_PASS,
      },
    });

    transporter.verify((error, success) => {
      if (error) {
        logger.error("SMTP connection verification failed", { error: error.message });
        throw new Error(`SMTP connection verification failed: ${error.message}`);
      }
      logger.info("Gmail transporter initialized for pttpos.system@gmail.com");
    });
  } catch (error) {
    logger.error("Error initializing Gmail transporter", { error: error.message });
    throw error;
  }
}

async function sendGmailAlert(recipientEmail, message, subject = "New Ticket Alert") {
  try {
    if (!transporter) {
      throw new Error("Gmail transporter not initialized");
    }

    if (!recipientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
      throw new Error("Invalid recipient email address format");
    }
    if (!message || typeof message !== "string" || message.trim() === "") {
      throw new Error("Message cannot be empty");
    }

    const sanitizedMessage = sanitizeHtml(message, {
      allowedTags: [],
      allowedAttributes: {},
    });

    const mailOptions = {
      from: `"PTT Helpdesk System" <${GMAIL_SENDER}>`,
      to: recipientEmail,
      subject,
      text: sanitizedMessage,
      html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
               <p>${sanitizedMessage.replace(/\n/g, "<br>")}</p>
             </div>`,
    };

    const info = await transporter.sendMail(mailOptions);

    logger.info(`Sent Gmail alert from ${GMAIL_SENDER} to ${recipientEmail}`, {
      timestamp: new Date().toISOString(),
      messageLength: sanitizedMessage.length,
      smtpResponse: info.response,
      messageId: info.messageId,
    });

    return {
      success: true,
      message: "Gmail alert sent successfully",
      messageId: info.messageId,
    };
  } catch (error) {
    logger.error(`Failed to send Gmail alert from ${GMAIL_SENDER} to ${recipientEmail}: ${error.message}`, {
      timestamp: new Date().toISOString(),
      errorCode: error.code,
      errorResponse: error.response || "No response",
      smtpDetails: error.command || "No SMTP command",
    });
    if (error.code === "EAUTH") {
      throw new Error("Gmail authentication failed. Verify app-specific password for pttpos.system@gmail.com.");
    } else if (error.code === "EENVELOPE") {
      throw new Error("Invalid recipient email address.");
    } else if (error.code === "ECONNECTION") {
      throw new Error("SMTP connection error. Check network or Gmail service status.");
    } else if (error.code === "EDNS") {
      throw new Error("DNS resolution error. Check network connectivity.");
    }
    throw new Error(`Failed to send Gmail alert: ${error.message}`);
  }
}

initializeGmail();

module.exports = { sendGmailAlert };
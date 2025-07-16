import { NextRequest, NextResponse } from "next/server";
import { sendAlert } from "@/app/backend/server/server";
import winston from "winston";

const logger = winston.createLogger({
  transports: [new winston.transports.File({ filename: "api_alerts.log" })],
});

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json(
        { error: "Authorization token is required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { platform, botName, username, chatId, threadId, email, message, subject } = body;

    logger.info("Received alert request", {
      timestamp: new Date().toISOString(),
      platform,
      botName,
      username,
      chatId,
      threadId,
      email,
      messageLength: message?.length,
      subject,
      rawUsername: username, // Debug raw username
      usernameTrimmed: username?.trim() || "EMPTY", // Debug trimmed username
      requestBody: JSON.stringify(body), // Debug full payload
    });

    if (!platform?.trim() || !message?.trim()) {
      return NextResponse.json(
        {
          error: `Missing required fields: ${
            !platform?.trim() ? "platform" : ""
          } ${!message?.trim() ? "message" : ""}`,
        },
        { status: 400 }
      );
    }

    if (platform === "telegram") {
      if (!botName?.trim() || !username?.trim() || !chatId?.trim()) {
        logger.warn("Telegram validation failed", {
          timestamp: new Date().toISOString(),
          botName: botName?.trim() || "EMPTY",
          username: username?.trim() || "EMPTY",
          chatId: chatId?.trim() || "EMPTY",
        });
        return NextResponse.json(
          {
            error: `Missing required fields for Telegram: ${
              !botName?.trim() ? "botName" : ""
            } ${!username?.trim() ? "username" : ""} ${!chatId?.trim() ? "chatId" : ""}`,
          },
          { status: 400 }
        );
      }
      if (message.trim() === "========================================================") {
        return NextResponse.json(
          { error: "Message contains only design elements" },
          { status: 400 }
        );
      }
      if (isNaN(Number(chatId)) || (threadId && isNaN(Number(threadId)))) {
        return NextResponse.json(
          { error: "Chat ID and Thread ID must be numeric" },
          { status: 400 }
        );
      }
      if (encodeURIComponent(message).length > 4096) {
        return NextResponse.json(
          { error: "Encoded message exceeds Telegram's 4096 character limit" },
          { status: 400 }
        );
      }
    }

    if (platform === "gmail" && !email?.trim()) {
      return NextResponse.json(
        { error: "Missing required field for Gmail: email" },
        { status: 400 }
      );
    }

    const result = await sendAlert(platform, {
      botName,
      username,
      chatId,
      threadId,
      email,
      message,
      subject,
    });

    logger.info("Alert sent successfully", {
      timestamp: new Date().toISOString(),
      platform,
      botName,
      username,
      chatId,
      threadId,
      email,
      messageId: result.message,
      subject,
    });

    return NextResponse.json(
      {
        message: `Alert sent successfully! (${
          platform.charAt(0).toUpperCase() + platform.slice(1)
        } sent)`,
        messageId: result.message,
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Error sending alert", {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      requestBody: JSON.stringify(await request.json().catch(() => ({}))),
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send alert" },
      { status: 500 }
    );
  }
}
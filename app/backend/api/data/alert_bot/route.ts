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
      rawUsername: username,
      usernameTrimmed: username?.trim() || "EMPTY",
      requestBody: JSON.stringify(body),
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
      // Validate chatId as a string representing an integer (positive or negative)
      if (!/^-?\d+$/.test(chatId)) {
        return NextResponse.json(
          { error: "Chat ID must be a valid integer (positive or negative)" },
          { status: 400 }
        );
      }
      // Validate threadId as numeric if provided
      if (threadId && isNaN(Number(threadId))) {
        return NextResponse.json(
          { error: "Thread ID must be numeric" },
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
      chatId, // Passed as string
      threadId, // Passed as string (numeric value)
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
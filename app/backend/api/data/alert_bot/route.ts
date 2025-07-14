import { NextRequest, NextResponse } from "next/server";
import { sendAlert } from "@/app/backend/server/server"; // Adjust path as needed

// POST /api/data/alert_bot - Send an alert (no auth)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform, botName, username, chatId, threadId, email, message } = body;

    // Validate required fields
    if (!platform || !message) {
      return NextResponse.json(
        { error: "Missing required fields: platform and message are required" },
        { status: 400 }
      );
    }

    if (platform === "telegram" && (!botName || !username || !chatId)) {
      return NextResponse.json(
        { error: "Missing required fields for Telegram: botName, username, chatId" },
        { status: 400 }
      );
    }

    if (platform === "gmail" && !email) {
      return NextResponse.json(
        { error: "Missing required field for Gmail: email" },
        { status: 400 }
      );
    }

    // Call server logic to send alert
    const result = await sendAlert(platform, {
      botName,
      username,
      chatId,
      threadId,
      email,
      message,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error processing alert:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

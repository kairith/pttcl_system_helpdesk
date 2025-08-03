import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { dbConfig } from "@/app/database/db-config";
import jwt from "jsonwebtoken";

// Initialize database pool for better performance
const db = mysql.createPool(dbConfig);

// JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(request: NextRequest) {
  try {
    // Check JWT
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized: Missing or invalid token" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    try {
      jwt.verify(token, JWT_SECRET!);
    } catch (error) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid token" },
        { status: 401 }
      );
    }

    // Log request (avoid logging sensitive data)
    // console.log(`Request to /api/data/bots from ${request.ip}`);

    // Fetch data
    const [rows] = await db.execute("SELECT bot_name FROM tbl_telegrambots");
    const botNames = (rows as { bot_name: string }[]).map((row) => row.bot_name);

    return NextResponse.json(botNames, { status: 200 });
  } catch (error) {
    // console.error(`Error in /api/data/bots from ${request.ip}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch bot names" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { dbConfig } from "@/app/database/db-config"; // Adjust path based on your project structure

// GET /api/data/bots - Fetch all bot names
export async function GET(request: NextRequest) {
  let connection;
  try {
    // Create MySQL connection
    connection = await mysql.createConnection(dbConfig);

    // Query to fetch bot names
    const [rows] = await connection.execute("SELECT bot_name FROM tbl_telegrambots");

    // Extract bot names
    const botNames = (rows as { bot_name: string }[]).map((row) => row.bot_name);

    return NextResponse.json(botNames, { status: 200 });
  } catch (error) {
    console.error("Error fetching bot names:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

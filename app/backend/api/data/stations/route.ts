
import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise"; // Install mysql2
import { dbConfig } from "@/app/database/db-config";
import jwt from "jsonwebtoken";
// normal display
const db = mysql.createPool(dbConfig)
const JWT_SECRET = process.env.JWT_SECRET;
export async function GET(request: NextRequest) {
  try {
    if (!JWT_SECRET) {
          console.error("JWT_SECRET is not defined");
          return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
        }
        // Extract token from Authorization header
        const authHeader = request.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return NextResponse.json({ error: "Missing or invalid token" }, { status: 401 });
        }
        const token = authHeader.split(" ")[1];
        // Verify JWT token
        try {
          jwt.verify(token, JWT_SECRET);
        } catch (err) {
          console.error("JWT verification error:", err);
          return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
        }
    const [rows] = await db.execute("SELECT station_id, station_name, station_type, province FROM tbl_station");
    // console.log("Database rows:", rows); // Debug: Log the database rows
    return NextResponse.json({ stations: rows }, { status: 200 });
  } catch (error) {
    console.error("Fetch stations error:", error);
    return NextResponse.json(
      { error: `Failed to fetch stations: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { dbConfig } from "@/app/database/db-config";
import mysql from "mysql2/promise";

interface Rule {
  rules_id: number;
  rules_name: string;
}

// Database connection
const db = mysql.createPool(dbConfig);

// JWT secret (must be defined in environment variables)
const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(request: Request) {
  try {
    // Validate JWT_SECRET
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

    // Query tbl_users_rules for rules_id and rules_name
    const query = "SELECT rules_id, rules_name FROM tbl_users_rules ORDER BY rules_id";
    const [rows] = await db.query(query);
    const rules = rows as Rule[];
    // Return rules as JSON array
    return NextResponse.json(rules, { status: 200 });
    return NextResponse.json(rows, { status: 200 });
  } catch (err) {
    console.error("Error fetching rules:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
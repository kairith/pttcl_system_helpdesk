import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import { dbConfig } from "@/app/database/db-config";

export async function POST(request: Request, { params }: { params: Promise<{ users_id: string }> }) {
  const paramsData = await params;
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  console.log("Received token:", token);

  const { password } = await request.json();
  const connection = await mysql.createConnection(dbConfig);
  try {
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT password FROM tbl_users WHERE users_id = ?",
      [paramsData.users_id]
    );
    if (Array.isArray(rows) && rows.length > 0) {
      const userRow = rows[0] as mysql.RowDataPacket;
      const storedPassword = userRow.password;
      const isMatch = await bcrypt.compare(password, storedPassword);
      return NextResponse.json({ success: isMatch });
    }
    return NextResponse.json({ success: false }, { status: 404 });
  } catch (error) {
    console.error("POST verify error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  } finally {
    await connection.end();
  }
}
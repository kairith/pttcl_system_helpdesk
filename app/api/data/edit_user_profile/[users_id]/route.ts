import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import { dbConfig } from "@/app/database/db-config";

export async function GET(request: Request, { params }: { params: Promise<{ users_id: string }> }) {
  const paramsData = await params;
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  console.log("Fetching user with ID:", paramsData.users_id);
  console.log("Received token:", token);

  const connection = await mysql.createConnection(dbConfig);
  try {
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT users_id, users_name, email, password, company FROM tbl_users WHERE users_id = ?",
      [paramsData.users_id]
    );
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    if (Array.isArray(rows) && rows.length > 0) {
      const user = rows[0] as mysql.RowDataPacket;
      return NextResponse.json({
        users_id: user.users_id,
        users_name: user.users_name,
        email: user.email,
        company: user.company,
      });
    }
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  } finally {
    await connection.end();
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ users_id: string }> }) {
  const paramsData = await params;
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  console.log("Received token:", token);

  const body = await request.json();
  console.log("Received body:", body); // Debug log to check the request body
  const { users_name, email, password, company, currentPassword } = body;

  if (!currentPassword) {
    return NextResponse.json({ error: "Current password is required" }, { status: 400 });
  }

  const connection = await mysql.createConnection(dbConfig);
  try {
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const [userRows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT password FROM tbl_users WHERE users_id = ?",
      [paramsData.users_id]
    );
    if (!Array.isArray(userRows) || userRows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const storedPassword = userRows[0].password;
    const isMatch = await bcrypt.compare(currentPassword, storedPassword);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid current password" }, { status: 400 });
    }

    let updatePassword = storedPassword;
    if (password) {
      updatePassword = await bcrypt.hash(password, 10); // Hash new password
    }

    await connection.execute(
      "UPDATE tbl_users SET users_name = ?, email = ?, password = ?, company = ? WHERE users_id = ?",
      [users_name, email, updatePassword, company, paramsData.users_id]
    );
    return NextResponse.json({ message: "User updated successfully" });
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  } finally {
    await connection.end();
  }
}
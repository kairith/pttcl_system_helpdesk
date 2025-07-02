import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const users_id = searchParams.get("users_id");
  if (!users_id) return NextResponse.json({ error: "User ID not provided" }, { status: 400 });

  const connection = await mysql.createConnection(dbConfig);
  try {
    const [rows] = await connection.execute(
      "SELECT users_id, users_name, email, password, company FROM tbl_users WHERE users_id = ?",
      [users_id]
    );
    if (Array.isArray(rows) && rows.length > 0) {
      const user = rows[0];
      return NextResponse.json({
        users_id: user.users_id,
        users_name: user.users_name,
        email: user.email,
        company: user.company,
      }); // Exclude password in response
    }
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  } finally {
    await connection.end();
  }
}

export async function PUT(req) {
  const { searchParams } = new URL(req.url);
  const users_id = searchParams.get("users_id");
  if (!users_id) return NextResponse.json({ error: "User ID not provided" }, { status: 400 });

  const { users_name, email, password, currentPassword, company } = await req.json();
  const connection = await mysql.createConnection(dbConfig);
  try {
    const [user] = await connection.execute(
      "SELECT password FROM tbl_users WHERE users_id = ?",
      [users_id]
    );
    if (!Array.isArray(user) || user.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const storedPassword = user[0].password;
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
      [users_name, email, updatePassword, company, users_id]
    );
    return NextResponse.json({ message: "User updated successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  } finally {
    await connection.end();
  }
}

export async function POST(req) {
  const { searchParams } = new URL(req.url);
  const users_id = searchParams.get("users_id");
  if (!users_id) return NextResponse.json({ error: "User ID not provided" }, { status: 400 });

  const { password } = await req.json();
  const connection = await mysql.createConnection(dbConfig);
  try {
    const [rows] = await connection.execute(
      "SELECT password FROM tbl_users WHERE users_id = ?",
      [users_id]
    );
    if (Array.isArray(rows) && rows.length > 0) {
      const storedPassword = rows[0].password;
      const isMatch = await bcrypt.compare(password, storedPassword);
      return NextResponse.json({ success: isMatch });
    }
    return NextResponse.json({ success: false }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  } finally {
    await connection.end();
  }
}
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mysql from "mysql2/promise";
import { dbConfig } from "@/app/database/db-config";

export async function POST(request: Request) {
  let connection;
  try {
    const body = await request.json();
    const { email, password, rememberMe } = body;

    if (!email || !password) {
      console.log("Missing email or password");
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    connection = await mysql.createConnection(dbConfig);
    console.log("Database connected successfully");

    const query = `
      SELECT u.users_id, u.users_name, u.email, u.password, u.status, u.code, u.rules_id, r.rules_name, r.list_ticket_status, r.add_user_rules
      FROM tbl_users u
      LEFT JOIN tbl_users_rules r ON u.rules_id = r.rules_id
      WHERE u.email = ?
    `;
    const [rows] = await connection.execute(query, [email]);
    const user = (rows as any[])[0];

    if (!user) {
      console.log("No user found for email:", email);
      return NextResponse.json({ error: "Invalid email" }, { status: 401 });
    }

    if (user.status !== 1) {
      // console.log("User inactive, email:", email);
      return NextResponse.json({ error: "Account is inactive" }, { status: 401 });
    }

    if (user.code !== 0) {
      // console.log("User not verified, email:", email);
      return NextResponse.json({ error: "Account not verified" }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password.trim(), user.password);
    if (!passwordMatch) {
      // console.log("Password mismatch for email:", email);
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    if (!user.users_name) {
      // console.log("User has no username, email:", email);
      return NextResponse.json({ error: "User account is missing username" }, { status: 400 });
    }

    const isAdmin = user.add_user_rules === 1;
    const payload = {
      users_id: String(user.users_id),
      users_name: user.users_name, // Add users_name to JWT payload
      email: user.email,
      rules_id: user.rules_id,
      list_ticket_status: user.list_ticket_status || 0,
      isAdmin,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (rememberMe ? 7 * 24 * 60 * 60 : 60 * 60),
    };

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not configured");
    }
    const token = jwt.sign(payload, secret, { algorithm: "HS256" });

    // console.log("Generated token for user:", user.email);
    return NextResponse.json({
      token,
      user: { 
        users_id: String(user.users_id), 
        email, 
        users_name: user.users_name, 
        isAdmin,
        list_ticket_status: user.list_ticket_status || 0 
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "An error occurred during login" }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
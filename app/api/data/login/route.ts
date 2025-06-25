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

    // Validate input
    if (!email || !password) {
      console.log("Missing email or password");
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Connect to the database
    connection = await mysql.createConnection(dbConfig);
    console.log("Database connected successfully");

    // Fetch user from database
    const query = `
      SELECT u.users_id, u.users_name, u.email, u.password, u.status, u.code, u.rules_id, r.rules_name
      FROM tbl_users u
      LEFT JOIN tbl_users_rules r ON u.rules_id = r.rules_id
      WHERE u.email = ?
    `;
    const [rows] = await connection.execute(query, [email]);
    const user = (rows as any[])[0];

    // Check if user exists
    if (!user) {
      console.log("No user found for email:", email);
      return NextResponse.json({ error: "Invalid email" }, { status: 401 });
    }

    // Check user status
    if (user.status !== 1) {
      console.log("User inactive, email:", email);
      return NextResponse.json({ error: "Account is inactive" }, { status: 401 });
    }

    // Check user verification
    if (user.code !== 0) {
      console.log("User not verified, email:", email);
      return NextResponse.json({ error: "Account not verified" }, { status: 401 });
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password.trim(), user.password);
    if (!passwordMatch) {
      console.log("Password mismatch for email:", email);
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Prepare JWT payload
    const isAdmin = user.rules_id === 1461;
    const payload = {
      users_id: String(user.users_id), // Ensure string
      email: user.email,
      rules_id: user.rules_id,
      isAdmin,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (rememberMe ? 7 * 24 * 60 * 60 : 60 * 60),
    };

    // Generate JWT token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not configured");
    }
    const token = jwt.sign(payload, secret, { algorithm: "HS256" });

    console.log("Generated token for user:", user.email);
    return NextResponse.json({
      token,
      user: { users_id: String(user.users_id), email, users_name: user.users_name, isAdmin },
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
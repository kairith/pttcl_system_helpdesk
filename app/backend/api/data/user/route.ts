import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import mysql from "mysql2/promise";
import { dbConfig } from "@/app/database/db-config";

export async function GET(request: Request) {
  let connection;
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }
    const token = authHeader.replace("Bearer ", "");

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not configured");
      
    }
    const decoded = jwt.verify(token, secret) as { users_id: number; rules_id: number };
   

    connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(
      `
      SELECT u.users_id, u.users_name, u.email, u.rules_id, r.*
      FROM tbl_users u
      LEFT JOIN tbl_users_rules r ON u.rules_id = r.rules_id
      WHERE u.users_id = ?
      `,
      [decoded.users_id]
    );
    const user = (rows as any[])[0];

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        users_id: user.users_id,
        users_name: user.users_name,
        email: user.email,
        rules_id: user.rules_id,
      },
      rules: {
        rules_id: user.rules_id,
        rules_name: user.rules_name,
        add_user_status: user.add_user_status,
        edit_user_status: user.edit_user_status,
        delete_user_status: user.delete_user_status,
        list_user_status: user.list_user_status,
        add_ticket_status: user.add_ticket_status,
        edit_ticket_status: user.edit_ticket_status,
        delete_ticket_status: user.delete_ticket_status,
        list_ticket_status: user.list_ticket_status,
        list_ticket_assign: user.list_ticket_assign,
        add_user_rules: user.add_user_rules,
        edit_user_rules: user.edit_user_rules,
        delete_user_rules: user.delete_user_rules,
        list_user_rules: user.list_user_rules,
        add_station: user.add_station,
        edit_station: user.edit_station,
        delete_station: user.delete_station,
        list_station: user.list_station,
        list_dashboard: user.list_dashboard !== undefined ? user.list_dashboard : 1,
        list_track: user.list_track !== undefined ? user.list_track : 1,
        list_report: user.list_report !== undefined ? user.list_report : 1,
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}
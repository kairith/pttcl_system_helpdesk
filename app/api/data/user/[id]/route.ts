import { NextResponse } from "next/server";
import { createConnection } from "mysql2/promise";
import { dbConfig } from "@/app/database/db-config";
// show user by id 
const TABLE_NAME = "tbl_users";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    console.log("Fetching user with ID:", id);
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    console.log("Received token:", token);
    if (!token || typeof token !== "string" || token.trim() === "") {
      return NextResponse.json({ error: "Unauthorized: Invalid or missing token" }, { status: 401 });
    }

    const connection = await createConnection(dbConfig);

    const [rows] = await connection.execute(
      `SELECT users_id, users_name, email, status, rules_id, company FROM ${TABLE_NAME} WHERE users_id = ?`,
      [id]
    );
    console.log("Query result:", rows);
    await connection.end();

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = rows[0] as { users_id: number; users_name: string; email: string; status: number; rules_id?: number; company?: string };
    return NextResponse.json({
      users_id: user.users_id,
      users_name: user.users_name,
      email: user.email,
      status: user.status === 1,
      rules_id: user.rules_id,
      company: user.company,
    });
  } catch (error) {
    console.error(`Error fetching user with ID ${params ? (await params).id : "unknown"}:`, error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}
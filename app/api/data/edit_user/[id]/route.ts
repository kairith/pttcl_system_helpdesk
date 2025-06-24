import { NextResponse } from "next/server";
import { createConnection } from "mysql2/promise";
import { dbConfig } from "@/app/database/db-config";
// edit user by id 
const TABLE_NAME = "tbl_users";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token || typeof token !== "string" || token.trim() === "") {
      return NextResponse.json({ error: "Unauthorized: Invalid or missing token" }, { status: 401 });
    }

    const body = await request.json();
    const { users_name, email, rules_id, company } = body;

    if (!users_name || !email) {
      return NextResponse.json({ error: "Users name and email are required" }, { status: 400 });
    }

    const connection = await createConnection(dbConfig);

    const [result] = await connection.execute(
      `UPDATE ${TABLE_NAME} SET users_name = ?, email = ?, rules_id = ?, company = ? WHERE users_id = ?`,
      [users_name, email, rules_id, company, id]
    );
    await connection.end();

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: "User not found or no changes made" }, { status: 404 });
    }

    return NextResponse.json({ message: "User updated successfully" }, { status: 200 });
  } catch (error) {
    console.error(`Error updating user with ID ${params ? (await params).id : "unknown"}:`, error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
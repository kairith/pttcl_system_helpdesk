import { NextResponse } from "next/server";
import { createConnection } from "mysql2/promise";
import { dbConfig } from "@/app/database/db-config";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token || typeof token !== "string" || token.trim() === "") {
      return NextResponse.json({ error: "Unauthorized: Invalid or missing token" }, { status: 401 });
    }

    const connection = await createConnection(dbConfig);

    const [result] = await connection.execute("DELETE FROM tbl_users WHERE users_id = ?", [id]);
    await connection.end();

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting user with ID ${params ? (await params).id : "unknown"}:`, error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
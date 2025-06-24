import { NextResponse } from "next/server";
import { createConnection } from "mysql2/promise";
import { dbConfig } from "@/app/database/db-config";
// route delete user by id in folder/[id]/route
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  let connection;
  try {
    const { id } = await params;
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token || typeof token !== "string" || token.trim() === "") {
      return NextResponse.json({ error: "Unauthorized: Invalid or missing token" }, { status: 401 });
    }

    connection = await createConnection(dbConfig);

    // Start transaction to ensure both deletes succeed or fail together
    await connection.beginTransaction();

    // Delete from tbl_user_image first (if it exists)
    await connection.execute("DELETE FROM tbl_user_image WHERE users_id = ?", [id]);

    // Delete from tbl_users
    const [result] = await connection.execute("DELETE FROM tbl_users WHERE users_id = ?", [id]);

    // Commit transaction
    await connection.commit();

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User and associated image deleted successfully" }, { status: 200 });
  } catch (error) {
    // Rollback transaction on error
    if (connection) {
      await connection.rollback();
    }
    console.error(`Error deleting user with ID ${params ? (await params).id : "unknown"}:`, error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  } finally {
    // Ensure connection is closed
    if (connection) {
      await connection.end();
    }
  }
}
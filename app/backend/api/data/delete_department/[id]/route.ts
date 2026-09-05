import { NextResponse } from "next/server";
import { createConnection } from "mysql2/promise";
import { dbConfig } from "@/app/database/db-config";
// route delete department by id in folder/[id]/route
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token || typeof token !== "string" || token.trim() === "") {
      return NextResponse.json({ error: "Unauthorized: Invalid or missing token" }, { status: 401 });
    }
    const connection = await createConnection(dbConfig);

    const [result] = await connection.execute(
      "DELETE FROM tbl_departments WHERE id = ?",
      [params.id]
    );

    await connection.end();

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Department deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting department:", error);
    return NextResponse.json(
      { error: "Failed to delete department" },
      { status: 500 }
    );
  }
}

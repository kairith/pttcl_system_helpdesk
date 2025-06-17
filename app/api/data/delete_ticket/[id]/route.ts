import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";
import { dbConfig } from "@/app/database/db-config";

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  let connection;
  try {
    const params = await context.params;
    const authHeader = request.headers.get("authorization");
    console.log("Authorization Header:", authHeader);
    if (!authHeader) {
      return NextResponse.json({ error: "No authorization header provided" }, { status: 401 });
    }

    const token = authHeader.startsWith("Bearer ") ? authHeader.replace("Bearer ", "") : authHeader;
    console.log("Extracted Token:", token);
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET is not set in environment variables");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const decoded = jwt.verify(token, secret) as any;
    console.log("Decoded Token:", decoded);
    const userId = decoded.users_id ?? decoded.userId ?? decoded.id ?? decoded.sub;
    if (!userId) {
      return NextResponse.json({ error: "Invalid token: userId missing" }, { status: 401 });
    }

    connection = await mysql.createConnection(dbConfig);

    const [ticketRows] = await connection.execute(
      "SELECT * FROM tbl_ticket WHERE ticket_id = ?",
      [params.id]
    );
    const ticket = (ticketRows as any[])[0];
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    await connection.beginTransaction();

    const deleteQuery = "DELETE FROM tbl_ticket WHERE ticket_id = ?";
    await connection.execute(deleteQuery, [params.id]);

    await connection.commit();

    return NextResponse.json({ message: "Ticket deleted successfully" }, { status: 200 });
  } catch (error: any) {
    if (connection) await connection.rollback();
    console.error("Error deleting ticket:", error);
    if (error.name === "JsonWebTokenError") {
      return NextResponse.json({ error: "Invalid or malformed token" }, { status: 401 });
    }
    return NextResponse.json({ error: `Failed to delete ticket: ${error.message}` }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}
import { NextResponse } from "next/server";
import { createConnection } from "mysql2/promise";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Await params to resolve the dynamic route parameter
    const { id } = await params;

    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token || typeof token !== "string" || token.trim() === "") {
      return NextResponse.json({ error: "Unauthorized: Invalid or missing token" }, { status: 401 });
    }

    const connection = await createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    const [rows] = await connection.execute(
      "SELECT id, station_id, station_name, station_type, province FROM tbl_station WHERE id = ?",
      [id]
    );

    await connection.end();

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "Station not found" }, { status: 404 });
    }

    return NextResponse.json(rows[0], { status: 200 });
  } catch (error) {
    console.error(`Error fetching station with ID ${params ? (await params).id : "unknown"}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch station" },
      { status: 500 }
    );
  }
}
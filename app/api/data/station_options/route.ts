
// app/api/data/station_options/route.ts
import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { dbConfig } from "@/app/database/db-config";
// choose station type but not use

export async function GET(request: Request) {
  try {
    // Check for token
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Connect to database
    const connection = await mysql.createConnection(dbConfig);

    // Fetch unique station types
    const [typeRows] = await connection.execute(
      "SELECT DISTINCT station_type FROM tbl_station WHERE station_type IS NOT NULL AND station_type != '' ORDER BY station_type"
    );
    const stationTypes = (typeRows as any).map((row: any) => row.station_type);

    // Fetch unique provinces
    const [provinceRows] = await connection.execute(
      "SELECT DISTINCT province FROM tbl_station WHERE province IS NOT NULL AND province != '' ORDER BY province"
    );
    const provinces = (provinceRows as any).map((row: any) => row.province);

    await connection.end();

    return NextResponse.json({ stationTypes, provinces }, { status: 200 });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// 


import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise"; // Install mysql2
import { dbConfig } from "@/app/database/db-config";
// normal display
const db = mysql.createPool(dbConfig)
export async function GET(request: NextRequest) {
  try {
    const [rows] = await db.execute("SELECT station_id, station_name, station_type, province FROM tbl_station");
    // console.log("Database rows:", rows); // Debug: Log the database rows
    return NextResponse.json({ stations: rows }, { status: 200 });
  } catch (error) {
    console.error("Fetch stations error:", error);
    return NextResponse.json(
      { error: `Failed to fetch stations: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}
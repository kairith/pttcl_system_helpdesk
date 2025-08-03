
// app/api/data/edit_station/[station_id]/route.ts
import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { dbConfig } from "@/app/database/db-config";
// edit station bby station id
export async function GET(
  request: Request,
  { params }: { params: Promise<{ station_id: string }> }
) {
  const { station_id } = await params;
  try {
    // console.log(`GET: Processing station_id=${station_id}`);
    // Token check
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // console.log(`GET: Unauthorized for station_id=${station_id}: Missing or invalid Authorization header`);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      // console.log(`GET: Unauthorized for station_id=${station_id}: No token provided`);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Database connection
    // console.log(`GET: Connecting to database for station_id=${station_id}`);
    const connection = await mysql.createConnection(dbConfig);

    // Fetch station data
    // console.log(`GET: Querying station_id=${station_id}`);
    const [stationRows] = await connection.execute<any[]>(
      "SELECT station_id, station_name, station_type, province FROM tbl_station WHERE station_id = ?",
      [station_id]
    );
    if (stationRows.length === 0) {
      // console.log(`GET: No station found for station_id=${station_id}`);
      await connection.end();
      return NextResponse.json({ error: "Station not found" }, { status: 404 });
    }

    // Fetch unique station types and provinces
    // console.log(`GET: Fetching unique station types and provinces`);
    const [typeRows] = await connection.execute<any[]>(
      "SELECT DISTINCT station_type FROM tbl_station WHERE station_type IS NOT NULL AND station_type != '' ORDER BY station_type"
    );
    const [provinceRows] = await connection.execute<any[]>(
      "SELECT DISTINCT province FROM tbl_station WHERE province IS NOT NULL AND province != '' ORDER BY province"
    );

    await connection.end();

    const stationTypes = (typeRows as any[]).map((row: any) => row.station_type);
    const provinces = (provinceRows as any[]).map((row: any) => row.province);

    // console.log(`GET: Success for station_id=${station_id}, types=${stationTypes.length}, provinces=${provinces.length}`);
    return NextResponse.json(
      {
        station: stationRows[0],
        stationTypes,
        provinces,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(`GET: Error for station_id=${station_id}:`, error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ station_id: string }> }
) {
  const { station_id } = await params;
  try {
    // console.log(`PUT: Processing station_id=${station_id}`);
    // Token check
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // console.log(`PUT: Unauthorized for station_id=${station_id}: Missing or invalid Authorization header`);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      // console.log(`PUT: Unauthorized for station_id=${station_id}: No token provided`);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Parse request body
    const { station_name, station_type, province } = await request.json();
    if (!station_name || !station_type || !province) {
      // console.log(`PUT: Bad request for station_id=${station_id}: Missing required fields`);
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Database connection
    // console.log(`PUT: Connecting to database for station_id=${station_id}`);
    const connection = await mysql.createConnection(dbConfig);

    // Update station
    // console.log(`PUT: Updating station_id=${station_id} with name=${station_name}, type=${station_type}, province=${province}`);
    const [result] = await connection.execute<mysql.ResultSetHeader>(
      "UPDATE tbl_station SET station_name = ?, station_type = ?, province = ? WHERE station_id = ?",
      [station_name, station_type, province, station_id]
    );

    await connection.end();

    if ((result as mysql.ResultSetHeader).affectedRows === 0) {
      // console.log(`PUT: No station found for station_id=${station_id}`);
      return NextResponse.json({ error: "Station not found" }, { status: 404 });
    }

    // console.log(`PUT: Station updated successfully for station_id=${station_id}`);
    return NextResponse.json({ message: "Station updated successfully" }, { status: 200 });
  } catch (error) {
    console.error(`PUT: Error for station_id=${station_id}:`, error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

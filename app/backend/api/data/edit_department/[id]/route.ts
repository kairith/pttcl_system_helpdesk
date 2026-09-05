
// app/api/data/edit_department/[id]/route.ts
import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { dbConfig } from "@/app/database/db-config";
// edit department by id
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // console.log(`GET: Processing id=${id}`);
    // Token check
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // console.log(`GET: Unauthorized for id=${id}: Missing or invalid Authorization header`);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      // console.log(`GET: Unauthorized for id=${id}: No token provided`);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Database connection
    // console.log(`GET: Connecting to database for id=${id}`);
    const connection = await mysql.createConnection(dbConfig);

    // Fetch department data
    // console.log(`GET: Querying id=${id}`);
    const [departmentRows] = await connection.execute<any[]>(
      "SELECT id, department_name FROM tbl_departments WHERE id = ?",
      [id]
    );

    await connection.end();

    if (departmentRows.length === 0) {
      // console.log(`GET: No department found for id=${id}`);
      return NextResponse.json({ error: "Department not found" }, { status: 404 });
    }

    // console.log(`GET: Success for id=${id}`);
    return NextResponse.json(
      {
        department: departmentRows[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(`GET: Error for id=${id}:`, error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // console.log(`PUT: Processing id=${id}`);
    // Token check
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // console.log(`PUT: Unauthorized for id=${id}: Missing or invalid Authorization header`);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      // console.log(`PUT: Unauthorized for id=${id}: No token provided`);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Parse request body
    const { department_name } = await request.json();
    if (!department_name) {
      // console.log(`PUT: Bad request for id=${id}: Missing required fields`);
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Database connection
    // console.log(`PUT: Connecting to database for id=${id}`);
    const connection = await mysql.createConnection(dbConfig);

    // Update department
    // console.log(`PUT: Updating id=${id} with name=${department_name}`);
    const [result] = await connection.execute<mysql.ResultSetHeader>(
      "UPDATE tbl_departments SET department_name = ? WHERE id = ?",
      [department_name, id]
    );

    await connection.end();

    if ((result as mysql.ResultSetHeader).affectedRows === 0) {
      // console.log(`PUT: No department found for id=${id}`);
      return NextResponse.json({ error: "Department not found" }, { status: 404 });
    }

    // console.log(`PUT: Department updated successfully for id=${id}`);
    return NextResponse.json({ message: "Department updated successfully" }, { status: 200 });
  } catch (error) {
    console.error(`PUT: Error for id=${id}:`, error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

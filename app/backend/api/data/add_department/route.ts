import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { Department } from '@/app/backend/types/department'; // Adjust path based on your project structure
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { dbConfig } from '@/app/database/db-config'; // Adjust path to your dbConfig file
// the route for add department to web
export async function POST(request: NextRequest) {
  let connection;
  try {
    // Extract and validate token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }
    // Add token validation logic here, e.g., verify with a JWT library
    // const decoded = await verifyToken(token);
    // if (!decoded) {
    //   return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    // }

    // Parse request body
    const body = await request.json();
    const { department_name } = body;

    // Validate input
    if (!department_name) {
      return NextResponse.json(
        { error: 'department_name is required' },
        { status: 400 }
      );
    }

    // Create MySQL connection using dbConfig
    connection = await mysql.createConnection(dbConfig);

    // Check for duplicate department_name
    const [existingRows] = await connection.execute<RowDataPacket[]>(
      'SELECT id FROM tbl_departments WHERE department_name = ?',
      [department_name]
    );
    if (existingRows.length > 0) {
      await connection.end();
      return NextResponse.json({ error: 'Department already exists' }, { status: 400 });
    }

    // Insert new department
    const [result] = await connection.execute<ResultSetHeader>(
      'INSERT INTO tbl_departments (department_name) VALUES (?)',
      [department_name]
    );
    // console.log('Insert result:', result); // Debug log

    // Fetch the newly created department to get the auto-incremented id
    const [newRows] = await connection.execute<RowDataPacket[] & Department[]>(
      'SELECT * FROM tbl_departments WHERE id = ?',
      [result.insertId]
    );
    if (!newRows.length) {
      throw new Error('Failed to retrieve the newly created department');
    }
    const newDepartment = newRows[0];

    await connection.end();

    return NextResponse.json(
      { message: 'Department added successfully', department: newDepartment },
      { status: 201 }
    );
  } catch (error) {
    if (connection) await connection.end();
    console.error('Error adding department:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while adding the department: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

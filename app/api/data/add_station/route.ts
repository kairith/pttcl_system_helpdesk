import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { Station } from '@/app/types/station'; // Adjust path based on your project structure
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { dbConfig } from '@/app/database/db-config'; // Adjust path to your dbConfig file

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
    const { station_id, station_name, station_type, province } = body;

    // Validate input
    if (!station_id || !station_name || !station_type || !province) {
      return NextResponse.json(
        { error: 'All fields (station_id, station_name, station_type, province) are required' },
        { status: 400 }
      );
    }

    // Create MySQL connection using dbConfig
    connection = await mysql.createConnection(dbConfig);

    // Check for duplicate station_id
    const [existingRows] = await connection.execute<RowDataPacket[]>(
      'SELECT station_id FROM tbl_station WHERE station_id = ?',
      [station_id]
    );
    if (existingRows.length > 0) {
      await connection.end();
      return NextResponse.json({ error: 'Station ID already exists' }, { status: 400 });
    }

    // Insert new station
    const [result] = await connection.execute<ResultSetHeader>(
      'INSERT INTO tbl_station (station_id, station_name, station_type, province) VALUES (?, ?, ?, ?)',
      [station_id, station_name, station_type, province]
    );
    console.log('Insert result:', result); // Debug log

    // Fetch the newly created station to get the auto-incremented id
    const [newRows] = await connection.execute<RowDataPacket[] & Station[]>(
      'SELECT * FROM tbl_station WHERE id = ?',
      [result.insertId]
    );
    if (!newRows.length) {
      throw new Error('Failed to retrieve the newly created station');
    }
    const newStation = newRows[0];

    await connection.end();

    return NextResponse.json(
      { message: 'Station added successfully', station: newStation },
      { status: 201 }
    );
  } catch (error) {
    if (connection) await connection.end();
    console.error('Error adding station:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while adding the station: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
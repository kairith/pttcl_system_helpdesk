import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { RowDataPacket } from 'mysql2';
import { User } from '@/app/backend/types/user'; // Adjust the import path as necessary
import { tbl_users_rules } from '@/app/backend/types/rules';
import { dbConfig } from '@/app/database/db-config';

export async function GET() {
  try {
    const connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute<(RowDataPacket & User)[]>('SELECT * FROM tbl_users ');
    console.log('Database rows:', rows); // Debug: Log the rows
    await connection.end();

    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: `Failed to fetch data: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
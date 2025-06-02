import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { RowDataPacket } from 'mysql2';
import { tbl_users_rules } from '../../types/rules';

export async function GET() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '1122',
      database: process.env.DB_DATABASE || 'pttcl_helpdesk_nextjs',
    });

    const [rows] = await connection.execute<(RowDataPacket & tbl_users_rules)[]>('SELECT * FROM tbl_users_rules');
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
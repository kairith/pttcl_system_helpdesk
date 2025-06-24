import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { dbConfig } from '@/app/database/db-config';
// display role in page
export async function GET() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT rules_id, rules_name FROM tbl_users_rules');
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}
'use server';

import mysql from 'mysql2/promise';
import { RowDataPacket } from 'mysql2';

export async function fetchTicketsCount() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '1122',
      database: process.env.DB_DATABASE || 'pttcl_helpdesk_nextjs',
    });

    const [rows] = await connection.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS total FROM tbl_ticket`
    );

    await connection.end();

    return { count: rows[0].total, error: null };
  } catch (err) {
    console.error('Database error:', err);
    return { count: 0, error: `Error fetching data: ${(err as Error).message}` };
  }
}

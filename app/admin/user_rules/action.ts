'use server';

import { tbl_users_rules } from '../../types/rules';
import mysql from 'mysql2/promise';
import { RowDataPacket } from 'mysql2';

export async function fetchUserRules() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '1122',
      database: process.env.DB_DATABASE || 'pttcl_helpdesk_nextjs',
    });

    const [rows] = await connection.execute<(RowDataPacket & tbl_users_rules)[]>('SELECT * FROM tbl_users_rules');

    await connection.end();
    return { rules: rows, error: null };
  } catch (err) {
    console.error('Database error:', err);
    return { rules: [], error: `Error fetching data: ${(err as Error).message}` };
  }
}
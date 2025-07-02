'use server';

import { tbl_users_rules } from '../../../../backend/types/rules';
import mysql from 'mysql2/promise';
import { RowDataPacket } from 'mysql2';
import { dbConfig } from '@/app/database/db-config';

export async function fetchUserRules() {
  try {
    const connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute<(RowDataPacket & tbl_users_rules)[]>('SELECT * FROM tbl_users_rules');

    await connection.end();
    return { rules: rows, error: null };
  } catch (err) {
    console.error('Database error:', err);
    return { rules: [], error: `Error fetching data: ${(err as Error).message}` };
  }
}
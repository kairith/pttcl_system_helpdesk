'use server';

import { Department } from '../../../../../backend/types/department';
import mysql from 'mysql2/promise';
import { RowDataPacket } from 'mysql2';
import { dbConfig } from '@/app/database/db-config';

export async function fetchDepartments() {
  try {
    const connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute<(RowDataPacket & Department)[]>('SELECT * FROM tbl_departments');

    await connection.end();
    return { departments: rows, error: null };
  } catch (err) {
    console.error('Database error:', err);
    return { departments: [], error: `Error fetching data: ${(err as Error).message}` };
  }
}

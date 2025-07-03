'use server';

import { User } from '../../../../backend/types/user';
import mysql from 'mysql2/promise';
import { RowDataPacket } from 'mysql2';
import { dbConfig } from '@/app/database/db-config';

export async function fetchUsers() {
  try {
    const connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute<(RowDataPacket & User & { rules_name: string })[]>(
      'SELECT u.*, r.rules_name FROM tbl_users u LEFT JOIN tbl_users_rules r ON u.rules_id = r.rules_id'
    );

    await connection.end();
    return { users: rows, error: null };  
  } catch (err) {
    console.error('Database error:', err);
    return { users: [], error: `Error fetching data: ${(err as Error).message}` };
  }
}


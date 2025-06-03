'use server';

import { Station } from '../../types/station';
import mysql from 'mysql2/promise';
import { RowDataPacket } from 'mysql2';

export async function fetchStations() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '1122',
      database: process.env.DB_DATABASE || 'pttcl_helpdesk_nextjs',
    });

    const [rows] = await connection.execute<(RowDataPacket & Station)[]>('SELECT * FROM tbl_station');

    await connection.end();
    return { stations: rows, error: null };
  } catch (err) {
    console.error('Database error:', err);
    return { stations: [], error: `Error fetching data: ${(err as Error).message}` };
  }
}
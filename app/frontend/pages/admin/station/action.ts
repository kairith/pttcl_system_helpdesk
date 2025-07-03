'use server';

import { Station } from '../../../../backend/types/station';
import mysql from 'mysql2/promise';
import { RowDataPacket } from 'mysql2';
import { dbConfig } from '@/app/database/db-config';

export async function fetchStations() {
  try {
    const connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute<(RowDataPacket & Station)[]>('SELECT * FROM tbl_station');

    await connection.end();
    return { stations: rows, error: null };
  } catch (err) {
    console.error('Database error:', err);
    return { stations: [], error: `Error fetching data: ${(err as Error).message}` };
  }
}
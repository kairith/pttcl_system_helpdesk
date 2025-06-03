'use server';

import { Ticket } from '../../types/ticket';
import mysql from 'mysql2/promise';
import { RowDataPacket } from 'mysql2';

export async function fetchTickets() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '1122',
      database: process.env.DB_DATABASE || 'pttcl_helpdesk_nextjs',
    });

    const [rows] = await connection.execute<
      (RowDataPacket & Ticket & { users_name: string; creator_name: string })[]
    >(
      `SELECT t.*, 
              REPLACE(GROUP_CONCAT(DISTINCT u.users_name SEPARATOR ', '), ', ', ',') AS users_name,
              GROUP_CONCAT(DISTINCT ti.image_path SEPARATOR ',') AS image_paths
       FROM tbl_ticket t
       LEFT JOIN tbl_users u ON FIND_IN_SET(u.users_id, t.users_id)
       LEFT JOIN tbl_ticket_images ti ON t.ticket_id = ti.ticket_id
       GROUP BY t.id
       ORDER BY t.ticket_id DESC`
    );

    await connection.end();
    return { tickets: rows, error: null };
  } catch (err) {
    console.error('Database error:', err);
    return { tickets: [], error: `Error fetching data: ${(err as Error).message}` };
  }
}
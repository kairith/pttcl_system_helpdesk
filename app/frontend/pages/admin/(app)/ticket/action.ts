'use server';

import { Ticket } from '../../../../../backend/types/ticket';
import mysql from 'mysql2/promise';
import { RowDataPacket } from 'mysql2';
import jwt from 'jsonwebtoken';
import { dbConfig } from '@/app/database/db-config';

export async function fetchTickets(token?: string) {
  try {
    const connection = await mysql.createConnection(dbConfig);

    // Department-scoped visibility: a role with scope_to_department = 1 only
    // sees tickets in its own assigned department. Enforced server-side from
    // the verified JWT — never trust a client-supplied department id.
    let departmentFilterId: number | null = null;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "default-secret") as {
          users_id: number;
        };
        const [userRows] = await connection.execute<RowDataPacket[]>(
          `SELECT u.department_id, r.scope_to_department
           FROM tbl_users u
           LEFT JOIN tbl_users_rules r ON u.rules_id = r.rules_id
           WHERE u.users_id = ?`,
          [decoded.users_id]
        );
        const requester = userRows[0];
        if (requester && requester.scope_to_department) {
          departmentFilterId = requester.department_id ?? -1; // -1 matches nothing if unassigned
        }
      } catch {
        // Invalid/expired token: fall through with no scoping applied here —
        // the page itself already redirects unauthenticated users to login.
      }
    }

    const [rows] = await connection.execute<
      (RowDataPacket & Ticket & { users_name: string; creator_name: string })[]
    >(
      `SELECT t.*,
              REPLACE(GROUP_CONCAT(DISTINCT u.users_name SEPARATOR ', '), ', ', ',') AS users_name,
              GROUP_CONCAT(DISTINCT ti.image_path SEPARATOR ',') AS image_paths
       FROM tbl_ticket t
       LEFT JOIN tbl_users u ON FIND_IN_SET(u.users_id, t.users_id)
       LEFT JOIN tbl_ticket_images ti ON t.ticket_id = ti.ticket_id
       ${departmentFilterId !== null ? "WHERE t.department_id = ?" : ""}
       GROUP BY t.id
       ORDER BY t.ticket_id DESC`,
      departmentFilterId !== null ? [departmentFilterId] : []
    );

    await connection.end();
    return { tickets: rows, error: null };
  } catch (err) {
    console.error('Database error:', err);
    return { tickets: [], error: `Error fetching data: ${(err as Error).message}` };
  }
}

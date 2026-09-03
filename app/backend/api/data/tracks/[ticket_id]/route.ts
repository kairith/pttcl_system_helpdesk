// app/api/data/tracks/[ticket_id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { dbConfig } from '@/app/database/db-config';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ ticket_id: string }> } // 👈 params is a Promise
) {
  // ✅ Must await params in Next 15+ (sync-dynamic-apis)
  const { ticket_id } = await params;

  if (!ticket_id) {
    return NextResponse.json({ error: 'Invalid ticket_id' }, { status: 400 });
  }

  let connection: mysql.Connection | undefined;
  try {
    connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(
      `
      SELECT 
        t.id, t.ticket_id, t.station_id, t.station_name, t.station_type, t.province, 
        t.issue_description, t.issue_type, t.status, t.users_id, t.ticket_open, 
        t.ticket_on_hold, t.ticket_in_progress, t.ticket_pending_vendor, t.ticket_close, 
        t.ticket_time, t.comment, t.user_create_ticket, t.issue_type_id,

        -- Assignee name
        COALESCE(u.users_name, 'Not Assigned') AS users_name,

        -- Creator name
        COALESCE(cu.users_name, 'Unknown') AS created_by_name
      FROM tbl_ticket t
      LEFT JOIN tbl_users u  ON t.users_id = u.users_id
      LEFT JOIN tbl_users cu ON t.user_create_ticket = cu.users_id
      WHERE t.ticket_id = ?
      `,
      [ticket_id]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json({ ticket: rows[0] }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Database error: ' + err.message }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}

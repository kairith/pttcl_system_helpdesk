import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { dbConfig } from '@/app/database/db-config';

export async function GET(request: NextRequest, context: { params: Promise<{ ticket_id: string }> }) {
  const { ticket_id } = await context.params;
  console.log('API route hit for ticket_id:', ticket_id);

  if (!ticket_id) {
    console.error('Invalid ticket_id provided');
    return NextResponse.json({ error: 'Invalid ticket_id' }, { status: 400 });
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Database connected successfully');

    try {
      const [rows] = await connection.execute(
        `SELECT 
           t.id, t.ticket_id, t.station_id, t.station_name, t.station_type, t.province, 
           t.issue_description, t.issue_type, t.status, t.users_id, t.ticket_open, 
           t.ticket_on_hold, t.ticket_in_progress, t.ticket_pending_vendor, t.ticket_close, 
           t.ticket_time, t.comment, t.user_create_ticket, t.issue_type_id,
           COALESCE(u.users_name, 'Not Assigned') AS users_name
         FROM tbl_ticket t
         LEFT JOIN tbl_users u ON t.users_id = u.users_id
         WHERE t.ticket_id = ?`,
        [ticket_id]
      );

      console.log('Query executed, rows:', rows);

      if (!Array.isArray(rows) || rows.length === 0) {
        console.log('No ticket found for ticket_id:', ticket_id);
        return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
      }

      return NextResponse.json({ ticket: rows[0] }, { status: 200 });
    } catch (queryError: any) {
      console.error('Error executing query for ticket_id:', ticket_id, 'Error:', queryError.message, 'Stack:', queryError.stack);
      return NextResponse.json({ error: 'Query failed: ' + queryError.message }, { status: 500 });
    } finally {
      if (connection) {
        await connection.end();
        console.log('Database connection closed');
      }
    }
  } catch (connectionError: any) {
    console.error('Database connection failed:', connectionError.message, 'Stack:', connectionError.stack);
    return NextResponse.json({ error: 'Database connection failed: ' + connectionError.message }, { status: 500 });
  }
}
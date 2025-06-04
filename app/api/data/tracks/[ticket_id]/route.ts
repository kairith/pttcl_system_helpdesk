
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET(request: Request, { params }: { params: { ticket_id: string } }) {
  const { ticket_id } = params;
  console.log('API route hit for ticket_id:', ticket_id);

  // Create MySQL connection
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '1122',
      database: process.env.DB_NAME || 'pttcl_helpdesk_nextjs',
    });
    console.log('Database connected successfully');

    try {
      const [rows] = await connection.execute(
        `SELECT id, ticket_id, station_id, station_name, station_type, province, issue_description, 
                issue_type, SLA_category, status, users_id, ticket_open, ticket_on_hold, 
                ticket_in_progress, ticket_pending_vendor, ticket_close, ticket_time, comment, 
                user_create_ticket, issue_type_id 
         FROM tbl_ticket WHERE ticket_id = ?`,
        [ticket_id]
      );

      await connection.end();

      if (!Array.isArray(rows) || rows.length === 0) {
        return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
      }

      return NextResponse.json({ ticket: rows[0] });
    } catch (error) {
      console.error('Error fetching ticket:', error);
      await connection.end();
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  } catch (connectionError) {
    console.error('Database connection failed:', connectionError);
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
  }
}

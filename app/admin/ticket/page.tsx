import { Ticket } from '../../types/ticket';
import mysql from 'mysql2/promise';
import { RowDataPacket } from 'mysql2';

export default async function Tickets() {
  let tickets: (Ticket & { users_name: string; creator_name: string })[] = [];
  let error: string | null = null;

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
            GROUP BY t.id  -- Use the primary key for grouping
            ORDER BY t.ticket_id DESC`
    );
    console.log('Database rows:', rows); // Debug: Log the rows
    await connection.end();
    tickets = rows;
  } catch (err) {
    console.error('Database error:', err); // Debug: Log the error
    error = `Error fetching data: ${(err as Error).message}`;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  if (tickets.length === 0) {
    return <div className="text-center">No tickets found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Tickets Table</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">Ticket ID</th>
              <th className="py-2 px-4 border-b">Station Name</th>
              <th className="py-2 px-4 border-b">Station Type</th>
              <th className="py-2 px-4 border-b">Province</th>
              <th className="py-2 px-4 border-b">Issue Description</th>
              <th className="py-2 px-4 border-b">Issue Type</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Assignee</th>
              <th className="py-2 px-4 border-b">Opened</th>
              <th className="py-2 px-4 border-b">On Hold</th>
              <th className="py-2 px-4 border-b">In Progress</th>
              <th className="py-2 px-4 border-b">Pending Vendor</th>
              <th className="py-2 px-4 border-b">Closed</th>
              <th className="py-2 px-4 border-b">Last Updated</th>
              <th className="py-2 px-4 border-b">Comment</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{ticket.id}</td>
                <td className="py-2 px-4 border-b">{ticket.ticket_id}</td>
                <td className="py-2 px-4 border-b">{ticket.station_name || 'N/A'}</td>
                <td className="py-2 px-4 border-b">{ticket.station_type}</td>
                <td className="py-2 px-4 border-b">{ticket.province}</td>
                <td className="py-2 px-4 border-b">{ticket.issue_description}</td>
                <td className="py-2 px-4 border-b">{ticket.issue_type}</td>
                <td className="py-2 px-4 border-b">{ticket.status ? 1 : 0}</td>
                <td className="py-2 px-4 border-b">{ticket.users_name || 'N/A'}</td>
                <td className="py-2 px-4 border-b">{new Date(ticket.ticket_open).toLocaleString()}</td>
                <td className="py-2 px-4 border-b">{ticket.ticket_on_hold ? new Date(ticket.ticket_on_hold).toLocaleString() : 'N/A'}</td>
                <td className="py-2 px-4 border-b">{ticket.ticket_in_progress ? new Date(ticket.ticket_in_progress).toLocaleString() : 'N/A'}</td>
                <td className="py-2 px-4 border-b">{ticket.ticket_pending_vendor ? new Date(ticket.ticket_pending_vendor).toLocaleString() : 'N/A'}</td>
                <td className="py-2 px-4 border-b">{ticket.ticket_close ? new Date(ticket.ticket_close).toLocaleString() : 'N/A'}</td>
                <td className="py-2 px-4 border-b">{new Date(ticket.ticket_time).toLocaleString()}</td>
                <td className="py-2 px-4 border-b">{ticket.comment || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
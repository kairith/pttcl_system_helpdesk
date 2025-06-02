import { User } from '../../types/user';
import { tbl_users_rules } from '../../types/rules';
import mysql from 'mysql2/promise';
import { RowDataPacket } from 'mysql2';

export default async function Users() {
  let users: (User & { rules_name: string })[] = [];
  let error: string | null = null;

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '1122',
      database: process.env.DB_DATABASE || 'pttcl_helpdesk_nextjs',
    });

    const [rows] = await connection.execute<(RowDataPacket & User & { rules_name: string })[]>(
      'SELECT u.*, r.rules_name FROM tbl_users u LEFT JOIN tbl_users_rules r ON u.rules_id = r.rules_id'
    );
    console.log('Database rows:', rows); // Debug: Log the rows
    await connection.end();
    users = rows;
  } catch (err) {
    console.error('Database error:', err); // Debug: Log the error
    error = `Error fetching data: ${(err as Error).message}`;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  if (users.length === 0) {
    return <div className="text-center">No users found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Users Table</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b">User ID</th>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Verified</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Rules</th>
              <th className="py-2 px-4 border-b">Company</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.users_id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{user.users_id}</td>
                <td className="py-2 px-4 border-b">{user.users_name}</td>
                <td className="py-2 px-4 border-b">{user.email}</td>
                <td className="py-2 px-4 border-b">{user.code === 0 ? 1 : 0}</td>
                <td className="py-2 px-4 border-b">{user.status ? 1 : 0}</td>
                <td className="py-2 px-4 border-b">{user.rules_name || 'None'}</td>
                <td className="py-2 px-4 border-b">{user.company}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
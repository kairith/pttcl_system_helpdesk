import { tbl_users } from '../../types/user';
import mysql from 'mysql2/promise';
import { RowDataPacket } from 'mysql2';

export default async function Users() {
  let users: tbl_users[] = [];
  let error: string | null = null;

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'your_username',
      password: process.env.DB_PASSWORD || 'your_password',
      database: process.env.DB_DATABASE || 'pttcl_helpdesk_nextjs',
    });

    const [rows] = await connection.execute<(RowDataPacket & tbl_users)[]>('SELECT * FROM tbl_users');
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
              <th className="py-2 px-4 border-b">Rules ID</th>
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
                <td className="py-2 px-4 border-b">{user.rules_id}</td>
                <td className="py-2 px-4 border-b">{user.company}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
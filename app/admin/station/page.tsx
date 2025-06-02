import { Station } from '../../types/station';
import mysql from 'mysql2/promise';
import { RowDataPacket } from 'mysql2';

export default async function Stations() {
  let stations: Station[] = [];
  let error: string | null = null;

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'your_username',
      password: process.env.DB_PASSWORD || 'your_password',
      database: process.env.DB_DATABASE || 'pttcl_helpdesk_nextjs',
    });

    // Verify table name in phpMyAdmin; update if different (e.g., 'stations')
    const [rows] = await connection.execute<(RowDataPacket & Station)[]>('SELECT * FROM tbl_station');
    console.log('Database rows:', rows); // Debug: Log the rows
    await connection.end();
    stations = rows;
  } catch (err) {
    console.error('Database error:', err); // Debug: Log the error
    error = `Error fetching data: ${(err as Error).message}`;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  if (stations.length === 0) {
    return <div className="text-center">No stations found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Stations Table</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">Station ID</th>
              <th className="py-2 px-4 border-b">Station Name</th>
              <th className="py-2 px-4 border-b">Province ID</th>
              <th className="py-2 px-4 border-b">Station Type</th>
            
            </tr>
          </thead>
          <tbody>
            {stations.map((station) => (
              <tr key={station.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{station.id}</td>
                <td className="py-2 px-4 border-b">{station.station_id}</td>
                <td className="py-2 px-4 border-b">{station.station_name}</td>
                <td className="py-2 px-4 border-b">{station.province}</td>
                <td className="py-2 px-4 border-b">{station.station_type}</td>
               
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
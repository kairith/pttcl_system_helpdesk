'use client';

import { useState, useEffect } from 'react';
import { User } from '../../types/user';
import NavSlide from '@/app/components/navbar/navbar';
import { fetchUsers } from '../user/action';

export default function Users() {
  const [users, setUsers] = useState<(User & { rules_name: string })[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSidebarToggle = (isOpen: boolean) => {
    setIsSidebarOpen(isOpen);
  };

  useEffect(() => {
    async function loadUsers() {
      const { users, error } = await fetchUsers();
      setUsers(users);
      setError(error);
    }
    loadUsers();
  }, []);

  if (error) {
    return (
      <div className="flex">
        <NavSlide onToggle={handleSidebarToggle} />
        <main
          className={`flex-1 p-4 min-h-screen transition-all duration-300 ease-in-out ${
            isSidebarOpen ? 'md:ml-64' : 'md:ml-16'
          }`}
        >
          <div
            className={`transition-opacity duration-300 ease-in-out ${
              isSidebarOpen ? 'opacity-100' : 'opacity-70'
            }`}
          >
            <div className="text-red-500 text-center">{error}</div>
          </div>
        </main>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex">
        <NavSlide onToggle={handleSidebarToggle} />
        <main
          className={`flex-1 p-4 min-h-screen transition-all duration-300 ease-in-out ${
            isSidebarOpen ? 'md:ml-64' : 'md:ml-16'
          }`}
        >
          <div
            className={`transition-opacity duration-300 ease-in-out ${
              isSidebarOpen ? 'opacity-100' : 'opacity-70'
            }`}
          >
            <div className="text-center">No users found.</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex">
      <NavSlide onToggle={handleSidebarToggle} />
      <main
        className={`flex-1 p-4 min-h-screen transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'md:ml-64' : 'md:ml-16'
        }`}
      >
        <div
          className={`transition-opacity duration-300 ease-in-out ${
            isSidebarOpen ? 'opacity-100' : 'opacity-70'
          }`}
        >
          <div className="container mx-auto">
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
        </div>
      </main>
    </div>
  );
}
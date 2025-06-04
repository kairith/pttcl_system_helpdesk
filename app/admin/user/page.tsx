"use client";
import React, { useState, useEffect } from "react";
import { User } from "../../types/user";
import { fetchUsers } from "../user/action";
import Header from "@/app/components/common/Header";
interface UsersProps {
  isSidebarOpen: boolean;
}

export default function Users({ isSidebarOpen }: UsersProps) {
  const [users, setUsers] = useState<(User & { rules_name: string })[]>([]);
  const [error, setError] = useState<string | null>(null);

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
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          <main
            className={`flex-1 p-4 sm:p-6 lg:p-8 min-h-screen transition-all duration-300 ease-in-out ${
              isSidebarOpen ? "sm:ml-64" : "sm:ml-0"
            }`}
          >
            <div className="text-red-500 text-center">{error}</div>
          </main>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          <main
            className={`flex-1 p-4 sm:p-6 lg:p-8 min-h-screen transition-all duration-300 ease-in-out ${
              isSidebarOpen ? "sm:ml-64" : "sm:ml-0"
            }`}
          >
            <div className="text-center">No users found.</div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <main
          className={`flex-1 p-4 sm:p-6 lg:p-8 min-h-screen transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "sm:ml-64" : "sm:ml-0"
          }`}
        >
          <div className="container mx-auto">
            <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-white rounded-lg shadow-md">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
                Users Table
              </h1>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 rounded-xl">
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">User ID</th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Name</th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Email</th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Verified</th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Status</th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Rules</th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Company</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.users_id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="p-2 sm:p-3 text-gray-700">{user.users_id}</td>
                        <td className="p-2 sm:p-3 text-gray-700">{user.users_name}</td>
                        <td className="p-2 sm:p-3 text-gray-700">{user.email}</td>
                        <td className="p-2 sm:p-3 text-gray-700">
                          {user.code === 0 ? "Verified" : "Not Verified"}
                        </td>
                        <td className="p-2 sm:p-3 text-gray-700">{user.status ? "Active" : "Inactive"}</td>
                        <td className="p-2 sm:p-3 text-gray-700">{user.rules_name || "None"}</td>
                        <td className="p-2 sm:p-3 text-gray-700">{user.company}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
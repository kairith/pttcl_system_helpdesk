'use client';

import { useState, useEffect } from 'react';
import { tbl_users_rules } from '../../types/rules';
import NavSlide from '@/app/components/navbar/navbar';
import { fetchUserRules } from '../user_rules/action';

export default function UserRules() {
  const [rules, setRules] = useState<tbl_users_rules[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSidebarToggle = (isOpen: boolean) => {
    setIsSidebarOpen(isOpen);
  };

  useEffect(() => {
    async function loadRules() {
      const { rules, error } = await fetchUserRules();
      setRules(rules);
      setError(error);
    }
    loadRules();
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

  if (rules.length === 0) {
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
            <div className="text-center">No rules found.</div>
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
            <h1 className="text-2xl font-bold mb-4">Rules Table</h1>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 border-b">Rules ID</th>
                    <th className="py-2 px-4 border-b">Rules Name</th>
                    <th className="py-2 px-4 border-b">Add User</th>
                    <th className="py-2 px-4 border-b">Edit User</th>
                    <th className="py-2 px-4 border-b">Delete User</th>
                    <th className="py-2 px-4 border-b">List User</th>
                    <th className="py-2 px-4 border-b">Add Ticket</th>
                    <th className="py-2 px-4 border-b">Edit Ticket</th>
                    <th className="py-2 px-4 border-b">Delete Ticket</th>
                    <th className="py-2 px-4 border-b">List Ticket</th>
                    <th className="py-2 px-4 border-b">List Ticket Assign</th>
                    <th className="py-2 px-4 border-b">Add User Rules</th>
                    <th className="py-2 px-4 border-b">Edit User Rules</th>
                    <th className="py-2 px-4 border-b">Delete User Rules</th>
                    <th className="py-2 px-4 border-b">List User Rules</th>
                    <th className="py-2 px-4 border-b">Add Station</th>
                    <th className="py-2 px-4 border-b">Edit Station</th>
                    <th className="py-2 px-4 border-b">Delete Station</th>
                    <th className="py-2 px-4 border-b">List Station</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map((rule) => (
                    <tr key={rule.rules_id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b">{rule.rules_id}</td>
                      <td className="py-2 px-4 border-b">{rule.rules_name}</td>
                      <td className="py-2 px-4 border-b">{rule.add_user_status ? 1 : 0}</td>
                      <td className="py-2 px-4 border-b">{rule.edit_user_status ? 1 : 0}</td>
                      <td className="py-2 px-4 border-b">{rule.delete_user_status ? 1 : 0}</td>
                      <td className="py-2 px-4 border-b">{rule.list_user_status ? 1 : 0}</td>
                      <td className="py-2 px-4 border-b">{rule.add_ticket_status ? 1 : 0}</td>
                      <td className="py-2 px-4 border-b">{rule.edit_ticket_status ? 1 : 0}</td>
                      <td className="py-2 px-4 border-b">{rule.delete_ticket_status ? 1 : 0}</td>
                      <td className="py-2 px-4 border-b">{rule.list_ticket_status ? 1 : 0}</td>
                      <td className="py-2 px-4 border-b">{rule.list_ticket_assign ? 1 : 0}</td>
                      <td className="py-2 px-4 border-b">{rule.add_user_rules ? 1 : 0}</td>
                      <td className="py-2 px-4 border-b">{rule.edit_user_rules ? 1 : 0}</td>
                      <td className="py-2 px-4 border-b">{rule.delete_user_rules ? 1 : 0}</td>
                      <td className="py-2 px-4 border-b">{rule.list_user_rules ? 1 : 0}</td>
                      <td className="py-2 px-4 border-b">{rule.add_station ? 1 : 0}</td>
                      <td className="py-2 px-4 border-b">{rule.edit_station ? 1 : 0}</td>
                      <td className="py-2 px-4 border-b">{rule.delete_station ? 1 : 0}</td>
                      <td className="py-2 px-4 border-b">{rule.list_station ? 1 : 0}</td>
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
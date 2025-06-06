
"use client";
import React, { useState, useEffect } from "react";
import { User } from "../../types/user";
import { fetchUsers } from "../user/action";
import Header from "@/app/components/common/Header";
import { useRouter } from "next/navigation";

interface UsersProps {
  isSidebarOpen: boolean;
}

export default function Users({ isSidebarOpen }: UsersProps) {
  const [users, setUsers] = useState<(User & { rules_name: string })[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filterId, setFilterId] = useState("");
  const [showFilterInput, setShowFilterInput] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function loadUsers() {
      const { users, error } = await fetchUsers();
      setUsers(users || []);
      setError(error);
    }
    loadUsers();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterId(e.target.value);
  };

  const handleFilterToggle = () => {
    setShowFilterInput((prev) => !prev);
    if (showFilterInput) {
      setFilterId(""); // Clear filter when hiding input
    }
  };

  const handleClearFilter = () => {
    setFilterId("");
    setShowFilterInput(false);
  };

  const handleExport = async (format: "excel" | "pdf" | "csv") => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        setError("Please log in as an admin.");
        router.push("/");
        return;
      }

      const response = await fetch(`/api/data/export-users?format=${format}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.error && data.error.includes("expired")) {
          setError("Session expired. Please log in again.");
          router.push("/");
        } else {
          throw new Error(data.error || `Export to ${format} failed`);
        }
      }

      const extension = format === "excel" ? "xlsx" : format;
      const fileName = `users_export.${extension}`;

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
      setShowExportOptions(false);
    } catch (error) {
      setError(`Failed to export users: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const toggleExportOptions = () => {
    setShowExportOptions((prev) => !prev);
  };

  const filteredUsers = filterId
    ? users.filter((user) => user.users_id.toString().includes(filterId))
    : users;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          <main
            className={`flex-1 p-4 sm:p-6 lg:p-8 w-full transition-all duration-300 ${
              isSidebarOpen ? "sm:ml-64" : "sm:ml-0"
            }`}
          >
            <div className="text-red-500 text-center text-sm sm:text-base">{error}</div>
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
          className={`flex-1 p-4 sm:p-6 lg:p-8 w-full transition-all duration-300 ${
            isSidebarOpen ? "sm:ml-64" : "sm:ml-0"
          }`}
        >
          <div className="container mx-auto">
            <div className="mt-19 sm:mt-6 p-4 sm:p-6 bg-white rounded-lg shadow-md">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-8">Users</h1>
              {error && <p className="text-red-600 mb-4">{error}</p>}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
                <button
                  onClick={() => router.push("/admin/user/add_user")}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex-1 sm:flex-none sm:w-40 text-sm sm:text-base"
                >
                  <span className="mr-2">+</span> Create User
                </button>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-1 sm:flex-none">
                  <button
                    onClick={handleFilterToggle}
                    className="bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 flex-1 sm:w-32 text-sm sm:text-base"
                  >
                    <span className="mr-2">🔍</span> Filter
                  </button>
                  {showFilterInput && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={filterId}
                        onChange={handleFilterChange}
                        placeholder="Enter User ID"
                        className="w-full sm:w-40 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                      />
                      <button
                        onClick={handleClearFilter}
                        className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 text-sm sm:text-base"
                      >
                        Reset filter
                      </button>
                    </div>
                  )}
                </div>
                <div className="relative flex items-center gap-3">
                  <button
                    onClick={toggleExportOptions}
                    className="bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 flex-1 sm:flex-none sm:w-32 text-sm sm:text-base flex items-center justify-center"
                  >
                    <span className="mr-2">📄</span> Export
                  </button>
                  {showExportOptions && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleExport("excel")}
                        className="bg-white border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-100 text-sm sm:text-base"
                      >
                        Excel
                      </button>
                      <button
                        onClick={() => handleExport("pdf")}
                        className="bg-white border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-100 text-sm sm:text-base"
                      >
                        PDF
                      </button>
                      <button
                        onClick={() => handleExport("csv")}
                        className="bg-white border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-100 text-sm sm:text-base"
                      >
                        CSV
                      </button>
                    </div>
                  )}
                </div>
              </div>
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
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-4 text-center text-gray-500">
                          No users found.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
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
                      ))
                    )}
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
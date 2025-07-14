
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import HeaderWithSidebar from "@/app/frontend/components/common/Header/Headerwithsidebar";

interface Rule {
  rules_id: number;
  rules_name: string;
}

interface User {
  users_id: number;
  users_name: string;
  email: string;
  status: boolean;
  rules_id?: number;
  company?: string;
}

export default function EditUser() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [rules, setRules] = useState<Rule[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams();
  const router = useRouter();

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  useEffect(() => {
    async function loadData() {
      const token = sessionStorage.getItem("token");
      if (!token) {
        setError("Please log in to access this page.");
        router.push("/");
        return;
      }
      try {
        const userResponse = await fetch(`/api/data/user/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!userResponse.ok) {
          const data = await userResponse.json();
          setError(data.error || "Failed to fetch user data");
          sessionStorage.removeItem("token");
          router.push("/");
          return;
        }
        const userData = await userResponse.json();
        setUser({
          users_id: userData.users_id,
          users_name: userData.users_name,
          email: userData.email,
          status: userData.status === 1,
          rules_id: userData.rules_id,
          company: userData.company,
        });

        const rulesResponse = await fetch("/api/data/rules", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!rulesResponse.ok) throw new Error("Failed to fetch rules");
        const rulesData = await rulesResponse.json();
        if (!Array.isArray(rulesData)) throw new Error("Invalid rules data format");
        setRules(rulesData);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load user or rules");
      }
    }
    loadData();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const token = sessionStorage.getItem("token");
    if (!token) {
      setError("Please log in to access this page.");
      router.push("/");
      return;
    }

    try {
      const response = await fetch(`/api/data/edit_user/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          users_name: user.users_name,
          email: user.email,
          rules_id: user.rules_id,
          company: user.company,
          status: user.status ? 1 : 0,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to update user");
        return;
      }
      router.push("/pages/admin/user");
    } catch (err) {
      console.error("Update error:", err);
      setError("Failed to update user");
    }
  };

  if (!user) {
    return (
      <div className={`min-h-screen bg-gray-50 ${isSidebarOpen ? "sm:ml-64" : ""} transition-all duration-300 overflow-x-hidden box-border`}>
        <HeaderWithSidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="flex w-full">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-full pt-16 transition-all duration-300 box-border">
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-3">
                <svg
                  className="animate-spin h-8 w-8 text-blue-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                  />
                </svg>
                <span className="text-lg font-medium text-gray-600">Loading user data...</span>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen bg-gray-50 ${isSidebarOpen ? "sm:ml-64" : ""} transition-all duration-300 overflow-x-hidden box-border`}>
        <HeaderWithSidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="flex w-full">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-full pt-16 transition-all duration-300 box-border">
            <div className="flex items-center justify-center py-8">
              <div className="bg-white p-6 rounded-lg shadow-md text-center max-w-md w-full border border-gray-200">
                <svg
                  className="mx-auto h-12 w-12 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="mt-4 text-lg font-semibold text-red-600">{error}</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${isSidebarOpen ? "sm:ml-64" : ""} transition-all duration-300 overflow-x-hidden box-border`}>
      <HeaderWithSidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex w-full">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-full pt-16 transition-all duration-300 box-border">
          <div className="flex justify-center items-center min-h-[calc(100vh-128px)]">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md w-full max-w-md border border-gray-200">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">Edit User</h1>
              <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-full min-w-0">
                <div>
                  <label htmlFor="users_name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    id="users_name"
                    type="text"
                    value={user.users_name}
                    onChange={(e) => setUser({ ...user, users_name: e.target.value })}
                    className="w-full max-w-full min-w-0 p-2 bg-gray-100 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter Name"
                    aria-label="User Name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={user.email}
                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                    className="w-full max-w-full min-w-0 p-2 bg-gray-100 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter Email"
                    aria-label="User Email"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="rules_id" className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <select
                    id="rules_id"
                    value={user.rules_id || ""}
                    onChange={(e) => setUser({ ...user, rules_id: parseInt(e.target.value) || undefined })}
                    className="w-full max-w-full min-w-0 p-2 bg-gray-100 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Role"
                  >
                    <option value="">Select a role</option>
                    {rules.map((rule) => (
                      <option key={rule.rules_id} value={rule.rules_id}>
                        {rule.rules_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                    Company
                  </label>
                  <input
                    id="company"
                    type="text"
                    value={user.company || ""}
                    onChange={(e) => setUser({ ...user, company: e.target.value || undefined })}
                    className="w-full max-w-full min-w-0 p-2 bg-gray-100 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter Company"
                    aria-label="Company"
                  />
                </div>
                <div className="flex items-center">
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <input
                    id="status"
                    type="checkbox"
                    checked={user.status}
                    onChange={(e) => setUser({ ...user, status: e.target.checked })}
                    className="ml-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    aria-label="User Status"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </div>
                <button
                  type="submit"
                  className="w-full max-w-full min-w-0 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm font-medium"
                >
                  Save
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

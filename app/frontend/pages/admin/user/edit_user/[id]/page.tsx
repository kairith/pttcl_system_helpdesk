"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Header from "@/app/frontend/components/common/Header/Headerwithsidebar";

interface Rule {
  rules_id: number;
  rules_name: string;
}

interface User {
  users_id: number;
  users_name: string;
  email: string;
  status: boolean;
  rules_id?: number; // Store rules_id for submission
  company?: string;
}

export default function EditUser() {
  const [user, setUser] = useState<User | null>(null);
  const [rules, setRules] = useState<Rule[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      const token = sessionStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }
      try {
        // Fetch user data
        const userResponse = await fetch(`/api/data/user/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!userResponse.ok) {
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
          rules_id: userData.rules_id, // Expect rules_id from API
          company: userData.company,
        });

        // Fetch rules data
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
          rules_id: user.rules_id, // Send rules_id
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

  if (!user) return <div className="text-center p-4">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Edit User</h1>
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="users_name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                id="users_name"
                type="text"
                value={user.users_name}
                onChange={(e) => setUser({ ...user, users_name: e.target.value })}
                className="w-full p-2 bg-gray-100 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full p-2 bg-gray-100 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full p-2 bg-gray-100 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full p-2 bg-gray-100 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter Company"
                aria-label="Company"
              />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <input
                id="status"
                type="checkbox"
                checked={user.status}
                onChange={(e) => setUser({ ...user, status: e.target.checked })}
                className="ml-2"
                aria-label="User Status"
              />
              <span className="ml-2">Active</span>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm"
            >
              Save
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
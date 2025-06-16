"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Header from "@/app/components/common/Header/Header";

export default function EditUser() {
  const [user, setUser] = useState<{ users_id: number; users_name: string; email: string; status: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      const token = sessionStorage.getItem("token");
      console.log("Token:", token); // Debug token
      if (!token) {
        setError("Please log in as an admin.");
        router.push("/");
        return;
      }
      try {
        const response = await fetch(`/api/data/user/${id}`, {
          headers: { "Authorization": `Bearer ${token}` },
        });
        console.log("Fetch response status:", response.status); // Debug status
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        console.log("Fetched user data:", data); // Debug data
        setUser({ users_id: data.users_id, users_name: data.users_name, email: data.email, status: data.status === 1 });
      } catch (err) {
        console.error("Fetch error:", err); // Debug error
        setError("Failed to load user");
      }
    }
    loadUser();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const token = sessionStorage.getItem("token");
    if (!token) {
      setError("Please log in as an admin.");
      router.push("/");
      return;
    }
    try {
      const response = await fetch(`/api/data/edit_user/${id}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ users_name: user.users_name, email: user.email, status: user.status }),
      });
      console.log("Update response status:", response.status); // Debug status
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update user");
      }
      router.push("/admin/user");
    } catch (err) {
      console.error("Update error:", err); // Debug error
      setError("Failed to update user");
    }
  };

  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;
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
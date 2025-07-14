
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import HeaderWithSidebar from "@/app/frontend/components/common/Header/Headerwithsidebar";
import { Toaster, toast } from "react-hot-toast";

interface Permissions {
  add: boolean;
  edit: boolean;
  delete: boolean;
  list: boolean;
  listAssign?: boolean;
}

export default function AddRules() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [permissions, setPermissions] = useState({
    users: { add: false, edit: false, delete: false, list: false },
    tickets: { add: false, edit: false, delete: false, list: false, listAssign: false },
    stations: { add: false, edit: false, delete: false, list: false },
    userRules: { add: false, edit: false, delete: false, list: false },
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      setError("No authentication token found. Please log in.");
      toast.error("No authentication token found. Please log in.");
      setTimeout(() => router.push("/"), 2000);
    }
  }, [router]);

  const handlePermissionChange = (category: string, action: keyof Permissions, value: boolean) => {
    setPermissions((prev) => ({
      ...prev,
      [category]: { ...prev[category as keyof typeof prev], [action]: value },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const token = sessionStorage.getItem("token");
    if (!token) {
      setError("No authentication token found. Please log in.");
      toast.error("No authentication token found. Please log in.");
      setLoading(false);
      setTimeout(() => router.push("/"), 2000);
      return;
    }

    if (!roleName.trim()) {
      setError("Role name is required.");
      toast.error("Role name is required.");
      setLoading(false);
      return;
    }

    const payloadPermissions = {
      users: {
        add: permissions.users.add,
        edit: permissions.users.edit,
        delete: permissions.users.delete,
        list: permissions.users.list,
      },
      tickets: {
        add: permissions.tickets.add,
        edit: permissions.tickets.edit,
        delete: permissions.tickets.delete,
        list: permissions.tickets.list,
        listAssign: permissions.tickets.listAssign,
      },
      stations: {
        add: permissions.stations.add,
        edit: permissions.stations.edit,
        delete: permissions.stations.delete,
        list: permissions.stations.list,
      },
      userRules: {
        add: permissions.userRules.add,
        edit: permissions.userRules.edit,
        delete: permissions.userRules.delete,
        list: permissions.userRules.list,
      },
    };

    try {
      const response = await fetch("/api/data/add_rules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ roleName, permissions: payloadPermissions }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add role");
      }

      const data = await response.json();
      setSuccess(data.message);
      toast.success(data.message, { duration: 2000, position: "top-right" });
      setRoleName("");
      setPermissions({
        users: { add: false, edit: false, delete: false, list: false },
        tickets: { add: false, edit: false, delete: false, list: false, listAssign: false },
        stations: { add: false, edit: false, delete: false, list: false },
        userRules: { add: false, edit: false, delete: false, list: false },
      });
      setTimeout(() => router.push("/pages/admin/user_rules"), 2000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An error occurred";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen bg-gray-50 ${isSidebarOpen ? "sm:ml-64" : ""} transition-all duration-300 overflow-x-hidden box-border`}>
        <HeaderWithSidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="flex w-full">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-full pt-16 transition-all duration-300 box-border">
            <Toaster position="top-right" />
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
                <span className="text-lg font-medium text-gray-600">Adding role...</span>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error && error.includes("authentication")) {
    return (
      <div className={`min-h-screen bg-gray-50 ${isSidebarOpen ? "sm:ml-64" : ""} transition-all duration-300 overflow-x-hidden box-border`}>
        <HeaderWithSidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="flex w-full">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-full pt-16 transition-all duration-300 box-border">
            <Toaster position="top-right" />
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
          <Toaster position="top-right" />
          <div className="flex justify-center items-center min-h-[calc(100vh-128px)]">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md w-full max-w-md sm:max-w-full border border-gray-200">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">
                Add Role
              </h1>
              {error && (
                <div className="mb-4 p-3 rounded text-sm sm:text-base bg-red-100 text-red-800 w-full max-w-full">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 p-3 rounded text-sm sm:text-base bg-green-100 text-green-800 w-full max-w-full">
                  {success}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-full min-w-0">
                <div className="flex flex-col">
                  <label htmlFor="roleName" className="block text-sm font-medium text-gray-700 mb-1">
                    Role Name
                  </label>
                  <input
                    type="text"
                    id="roleName"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    className="w-full max-w-full min-w-0 p-2 border border-gray-300 rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter role name..."
                    required
                    aria-label="Role Name"
                  />
                </div>
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200">
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">Permissions</h2>
                  {["users", "tickets", "stations", "userRules"].map((category) => (
                    <div key={category} className="mb-4">
                      <h3 className="text-lg font-medium text-gray-700 capitalize mb-2">{category}</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {category === "tickets"
                          ? ["add", "edit", "delete", "list", "listAssign"].map((action) => (
                              <label key={action} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={
                                    category === "tickets" && action === "listAssign"
                                      ? permissions.tickets.listAssign
                                      : (permissions[category as keyof typeof permissions] as Record<string, boolean>)[action]
                                  }
                                  onChange={(e) =>
                                    handlePermissionChange(category, action as keyof Permissions, e.target.checked)
                                  }
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  aria-label={`${category} ${action} permission`}
                                />
                                <span className="text-sm text-gray-600 capitalize">{action}</span>
                              </label>
                            ))
                          : ["add", "edit", "delete", "list"].map((action) => (
                              <label key={action} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={
                                    category === "tickets" && action === "listAssign"
                                      ? permissions.tickets.listAssign
                                      : (permissions[category as keyof typeof permissions] as Omit<Permissions, "listAssign">)[action as Exclude<keyof Permissions, "listAssign">]
                                  }
                                  onChange={(e) =>
                                    handlePermissionChange(category, action as keyof Permissions, e.target.checked)
                                  }
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  aria-label={`${category} ${action} permission`}
                                />
                                <span className="text-sm text-gray-600 capitalize">{action}</span>
                              </label>
                            ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center space-x-4 mt-4 sm:mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-40 max-w-full min-w-0 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300 text-sm sm:text-base font-medium"
                    aria-label={loading ? "Adding Role" : "Add Role"}
                  >
                    {loading ? "Adding..." : "Add Role"}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push("/pages/admin/user_rules")}
                    className="w-full sm:w-40 max-w-full min-w-0 bg-gray-400 text-white px-6 py-2 rounded-md hover:bg-gray-500 text-sm sm:text-base font-medium"
                    aria-label="Cancel"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

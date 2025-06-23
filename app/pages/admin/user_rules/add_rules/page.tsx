"use client";
import React, { useState, useEffect } from "react";
import Header from "@/app/components/common/Header/Headerwithsidebar";

interface Permissions {
  add: boolean;
  edit: boolean;
  delete: boolean;
  list: boolean;
}
                                                           
interface AddRulesProps {
  isSidebarOpen: boolean;
}

export default function AddRules({ isSidebarOpen }: AddRulesProps) {
  const [roleName, setRoleName] = useState("");
  const [permissions, setPermissions] = useState({
    users: { add: false, edit: false, delete: false, list: false },
    tickets: { add: false, edit: false, delete: false, list: false, listAssign: false },
    stations: { add: false, edit: false, delete: false, list: false },
    userRules: { add: false, edit: false, delete: false, list: false },
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

    // Log the current permissions state for debugging
    console.log("Current permissions state:", permissions);

    // Ensure all permissions are included in the payload
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleName, permissions: payloadPermissions }),
      });

      if (!response.ok) throw new Error("Failed to add role");
      const data = await response.json();
      setSuccess(data.message);
      setRoleName("");
      setPermissions({
        users: { add: false, edit: false, delete: false, list: false },
        tickets: { add: false, edit: false, delete: false, list: false, listAssign: false },
        stations: { add: false, edit: false, delete: false, list: false },
        userRules: { add: false, edit: false, delete: false, list: false },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="flex">
        {/* Sidebar */}
      
        <main
          className={`flex-1 p-4 sm:p-6 lg:p-8 min-h-screen transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "sm:ml-64" : "sm:ml-0"
          }`}
        >
          <div className="container mx-auto max-w-5xl">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-6">Add Roles</h1>
            {error && (
              <div className="bg-red-100 text-red-600 p-4 rounded-lg mb-4">{error}</div>
            )}
            {success && (
              <div className="bg-green-100 text-green-600 p-4 rounded-lg mb-4">{success}</div>
            )}
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 mb-6">
              <div className="mb-4">
                <label htmlFor="roleName" className="block text-sm font-medium text-gray-700">Add Roles</label>
                <input
                  type="text"
                  id="roleName"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Roles Name..."
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Add
              </button>
            </form>

            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">Permissions</h2>
              {["users", "tickets", "stations", "userRules"].map((category) => (
                <div key={category} className="mb-4">
                  <h3 className="text-lg font-medium text-gray-700 capitalize">{category}</h3>
                  <div className="grid grid-cols-4 gap-4 mt-2">
                    {category === "tickets" ? (
                      ["add", "edit", "delete", "list", "listAssign"].map((action) => (
                        <label key={action} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={
                              category === "tickets" && action === "listAssign"
                                ? permissions.tickets.listAssign
                                : permissions[category as keyof typeof permissions][action as keyof Permissions]
                            }
                            onChange={(e) =>
                              handlePermissionChange(
                                category,
                                action as keyof Permissions,
                                e.target.checked
                              )
                            }
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-600 capitalize">{action}</span>
                        </label>
                      ))
                    ) : (
                      ["add", "edit", "delete", "list"].map((action) => (
                        <label key={action} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={permissions[category as keyof typeof permissions][action as keyof Permissions]}
                            onChange={(e) =>
                              handlePermissionChange(
                                category,
                                action as keyof Permissions,
                                e.target.checked
                              )
                            }
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-600 capitalize">{action}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
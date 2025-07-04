
"use client";
import { useState, useEffect, Fragment } from "react";
import { User } from "@/app/backend/types/user";
import { fetchUsers } from "./action";
import Header from "@/app/frontend/components/common/Header/Headerwithsidebar";
import { useRouter } from "next/navigation";
import { TrashIcon, PencilIcon } from "@heroicons/react/24/solid";
import { Dialog, Transition } from "@headlessui/react";
import { toast } from "react-toastify";

interface UsersProps {
  isSidebarOpen: boolean;
}

interface Permissions {
  users: {
    add: boolean;
    edit: boolean;
    delete: boolean;
    list: boolean;
  };
}

export default function Users({ isSidebarOpen }: UsersProps) {
  const [users, setUsers] = useState<(User & { rules_name: string })[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filterId, setFilterId] = useState("");
  const [filterName, setFilterName] = useState("");
  const [showFilterInput, setShowFilterInput] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const [filterIdError, setFilterIdError] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<Permissions | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) {
          toast.error("Please log in to access this page.");
          router.push("/");
          return;
        }
        console.log("AdminUserPage: Fetching with token:", token.substring(0, 10) + "...");

        const response = await fetch("/api/data/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          const data = await response.json();
          if (data.error?.includes("Invalid token")) {
            toast.error("Session expired. Please log in again.");
            router.push("/");
            return;
          }
          throw new Error(data.error || "Failed to fetch permissions");
        }
        const { rules } = await response.json();
        const userPermissions: Permissions = {
          users: {
            add: !!rules.add_user_status,
            edit: !!rules.edit_user_status,
            delete: !!rules.delete_user_status,
            list: !!rules.list_user_status,
          },
        };
        setPermissions(userPermissions);
        console.log("AdminUserPage: Permissions:", JSON.stringify(userPermissions, null, 2));

        if (!userPermissions.users.list) {
          toast.error("You do not have permission to view users. contact admin for access.");
          router.push("/");
          return;
        }

        const { users, error } = await fetchUsers();
        console.log("AdminUserPage: Fetched users:", JSON.stringify(users, null, 2));
        setUsers(users || []);
        setError(error);
        if (error) toast.error(error);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "An unknown error occurred.";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [router]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    if (value && !/^\d+$/.test(value)) {
      setFilterIdError("User ID must be numeric");
    } else {
      setFilterIdError(null);
      setFilterId(value);
    }
    console.log("AdminUserPage: Filter ID updated:", value);
  };

  const handleFilterNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilterName(value);
    console.log("AdminUserPage: Filter Name updated:", value);
  };

  const handleFilterToggle = () => {
    setShowFilterInput((prev) => !prev);
    if (showFilterInput) {
      setFilterId("");
      setFilterName("");
      setFilterIdError(null);
    }
    console.log("AdminUserPage: Filter input toggled:", !showFilterInput);
  };

  const handleClearFilter = () => {
    setFilterId("");
    setFilterName("");
    setFilterIdError(null);
    setShowFilterInput(false);
    console.log("AdminUserPage: Filters cleared");
  };

  const handleExport = async (format: "excel" | "pdf" | "csv") => {
    if (!permissions?.users.list) {
      toast.error("You do not have permission to export users. contact admin for access.");
      return;
    }
    setIsLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to access this page.");
        router.push("/");
        return;
      }

      const response = await fetch(`/api/data/export-users?format=${format}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.error?.includes("expired") || data.error?.includes("Invalid token")) {
          toast.error("Session expired. Please log in again.");
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
      toast.success(`Users exported as ${format.toUpperCase()}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      setError(`Failed to export users: ${errorMsg}`);
      toast.error(`Failed to export users: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExportOptions = () => {
    setShowExportOptions((prev) => !prev);
  };

  const handleEditUser = (id: number) => {
    if (!permissions?.users.edit) {
      toast.error("You do not have permission to edit users. contact admin for access.");
      return;
    }
    const token = sessionStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to access this page.");
      router.push("/");
      return;
    }
    router.push(`/pages/admin/user/edit_user/${id}`);
  };

  const handleDeleteUser = async () => {
    if (!deleteUserId || !permissions?.users.delete) {
      toast.error("You do not have permission to delete users. contact admin for access.");
      return;
    }
    setIsLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to access this page.");
        router.push("/");
        return;
      }
      const response = await fetch(`/api/data/delete_user/${deleteUserId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const data = await response.json();
        if (data.error?.includes("expired") || data.error?.includes("Invalid token")) {
          toast.error("Session expired. Please log in again.");
          router.push("/");
        } else {
          throw new Error(data.error || "Failed to delete user");
        }
      }
      const { users, error } = await fetchUsers();
      setUsers(users || []);
      setError(error);
      if (error) toast.error(error);
      else toast.success(`User ${deleteUserId} deleted successfully`);
      closeDeleteModal();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      setError(`Failed to delete user: ${errorMsg}`);
      toast.error(`Failed to delete user: ${errorMsg}`);
      closeDeleteModal();
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteModal = (id: number) => {
    setDeleteUserId(id);
  };

  const closeDeleteModal = () => {
    setDeleteUserId(null);
  };

  const filteredUsers = users.filter((user) => {
    const matchesId = filterId
      ? user.users_id.toString().includes(filterId)
      : true;
    const matchesName = filterName
      ? user.users_name.toLowerCase().includes(filterName.toLowerCase()) ||
        user.email.toLowerCase().includes(filterName.toLowerCase())
      : true;
    return matchesId && matchesName;
  });

  console.log("AdminUserPage: Filtered users:", JSON.stringify(filteredUsers, null, 2));

  if (isLoading) {
    return <div className="p-4 text-gray-500">Loading...</div>;
  }

  if (!permissions?.users.list) {
    return null; // Redirect handles this
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
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-8">
                Users
              </h1>
              {error && <p className="text-red-600 mb-4">{error}</p>}
              {(permissions.users.add || permissions.users.list) && (
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
                  {permissions.users.add && (
                    <button
                      onClick={() => router.push("/pages/admin/user/add_user")}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex-1 sm:flex-none sm:w-40 text-sm sm:text-base flex items-center justify-center"
                      aria-label="Create new user"
                    >
                      <span className="mr-2">+</span> Create User
                    </button>
                  )}
                  {permissions.users.list && (
                    <>
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-1 sm:flex-none">
                        <button
                          onClick={handleFilterToggle}
                          className="bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 flex-1 sm:w-32 text-sm sm:text-base flex items-center justify-center"
                          aria-label="Toggle filter input"
                        >
                          <span className="mr-2">🔍</span> Filter
                        </button>
                        {showFilterInput && (
                          <div className="flex flex-col sm:flex-row gap-2">
                            <div>
                              <input
                                type="text"
                                value={filterId}
                                onChange={handleFilterChange}
                                placeholder="Enter User ID"
                                className="w-full sm:w-40 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                                aria-label="Filter by User ID"
                              />
                              {filterIdError && (
                                <p className="text-red-600 text-xs mt-1">
                                  {filterIdError}
                                </p>
                              )}
                            </div>
                            <input
                              type="text"
                              value={filterName}
                              onChange={handleFilterNameChange}
                              placeholder="Enter Name/Email"
                              className="w-full sm:w-40 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                              aria-label="Filter by Name or Email"
                            />
                            <button
                              onClick={handleClearFilter}
                              className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 text-sm sm:text-base"
                              aria-label="Reset filter"
                            >
                              Reset Filter
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="relative flex items-center gap-3">
                        <button
                          onClick={toggleExportOptions}
                          className="bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 flex-1 sm:flex-none sm:w-32 text-sm sm:text-base flex items-center justify-center"
                          aria-label="Toggle export options"
                        >
                          <span className="mr-2">📄</span> Export
                        </button>
                        {showExportOptions && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleExport("excel")}
                              className="bg-white border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-100 text-sm sm:text-base"
                              aria-label="Export as Excel"
                            >
                              Excel
                            </button>
                            <button
                              onClick={() => handleExport("pdf")}
                              className="bg-white border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-100 text-sm sm:text-base"
                              aria-label="Export as PDF"
                            >
                              PDF
                            </button>
                            <button
                              onClick={() => handleExport("csv")}
                              className="bg-white border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-100 text-sm sm:text-base"
                              aria-label="Export as CSV"
                            >
                              CSV
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
              {permissions.users.list && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100 rounded-xl">
                        <th className="text-left p-2 sm:p-3 font-bold text-gray-800">
                          User ID
                        </th>
                        {(permissions.users.edit || permissions.users.delete) && (
                          <th className="text-left p-2 sm:p-3 font-bold text-gray-800">
                            Actions
                          </th>
                        )}
                        <th className="text-left p-2 sm:p-3 font-bold text-gray-800">
                          Name
                        </th>
                        <th className="text-left p-2 sm:p-3 font-bold text-gray-800">
                          Email
                        </th>
                        <th className="text-left p-2 sm:p-3 font-bold text-gray-800">
                          Verified
                        </th>
                        <th className="text-left p-2 sm:p-3 font-bold text-gray-800">
                          Status
                        </th>
                        <th className="text-left p-2 sm:p-3 font-bold text-gray-800">
                          Rules
                        </th>
                        <th className="text-left p-2 sm:p-3 font-bold text-gray-800">
                          Company
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td
                            colSpan={(permissions.users.edit || permissions.users.delete) ? 8 : 7}
                            className="p-4 text-center text-gray-500"
                          >
                            No users found.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user) => (
                          <tr
                            key={user.users_id}
                            className="border-b border-gray-200 hover:bg-gray-50"
                          >
                            <td className="p-2 sm:p-3 text-gray-700">
                              {user.users_id}
                            </td>
                            {(permissions.users.edit || permissions.users.delete) && (
                              <td className="p-2 sm:p-3 text-gray-700 flex gap-2">
                                {permissions.users.edit && (
                                  <button
                                    onClick={() => handleEditUser(user.users_id)}
                                    className="p-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                                    aria-label={`Edit user ${user.users_name}`}
                                  >
                                    <PencilIcon className="w-4 h-4" />
                                  </button>
                                )}
                                {permissions.users.delete && (
                                  <button
                                    onClick={() => openDeleteModal(user.users_id)}
                                    className="p-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors"
                                    aria-label={`Delete user ${user.users_name}`}
                                  >
                                    <TrashIcon className="w-4 h-4" />
                                  </button>
                                )}
                              </td>
                            )}
                            <td className="p-2 sm:p-3 text-gray-700">
                              {user.users_name}
                            </td>
                            <td className="p-2 sm:p-3 text-gray-700">
                              {user.email}
                            </td>
                            <td className="p-2 sm:p-3 text-gray-700">
                              {user.code === 0 ? "Verified" : "Not Verified"}
                            </td>
                            <td className="p-2 sm:p-3 text-gray-700">
                              {user.status ? "Active" : "Inactive"}
                            </td>
                            <td className="p-2 sm:p-3 text-gray-700">
                              {user.rules_name || "None"}
                            </td>
                            <td className="p-2 sm:p-3 text-gray-700">
                              {user.company || "None"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
          {permissions?.users.delete && (
            <Transition appear show={deleteUserId !== null} as={Fragment}>
              <Dialog
                as="div"
                className="relative z-10"
                onClose={closeDeleteModal}
              >
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div
                    style={{
                      position: "fixed",
                      inset: 0,
                      backgroundColor: "rgba(0, 0, 0, 0.5)",
                      backdropFilter: "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
                    }}
                  />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                  <div className="flex min-h-full items-center justify-center p-4 text-center">
                    <Transition.Child
                      as={Fragment}
                      enter="ease-out duration-300"
                      enterFrom="opacity-0 scale-95"
                      enterTo="opacity-100 scale-100"
                      leave="ease-in duration-200"
                      leaveFrom="opacity-100 scale-100"
                      leaveTo="opacity-0 scale-95"
                    >
                      <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                        <Dialog.Title
                          as="h3"
                          className="text-lg font-medium leading-6 text-gray-900"
                        >
                          Confirm Deletion
                        </Dialog.Title>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">
                            Are you sure you want to delete user&nbsp;
                            <span className="font-medium">
                              {users.find((u) => u.users_id === deleteUserId)?.users_name || deleteUserId}
                            </span>?
                            This action cannot be undone.
                          </p>
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                          <button
                            type="button"
                            className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            onClick={closeDeleteModal}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            onClick={handleDeleteUser}
                          >
                            Delete
                          </button>
                        </div>
                      </Dialog.Panel>
                    </Transition.Child>
                  </div>
                </div>
              </Dialog>
            </Transition>
          )}
        </main>
      </div>
    </div>
  );
}

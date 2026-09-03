"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { User } from "@/app/backend/types/user";
import { fetchUsers } from "./action";
import UsersHeader from "@/app/frontend/components/Admin/AllUser_components/UserHeader";
import FilterControls from "@/app/frontend/components/Admin/AllUser_components/FilterControls";
import ExportOptions from "@/app/frontend/components/Admin/AllUser_components/ExportOptions";
import UsersTable from "@/app/frontend/components/Admin/AllUser_components/UsersTables";
import DeleteModal from "@/app/frontend/components/Admin/AllUser_components/DeleteModel";
import Card from "@/app/frontend/components/common/Card/Card";
import { useUserData } from "@/app/frontend/components/common/Header/UserDataProvider";

interface Permissions {
  users: {
    add: boolean;
    edit: boolean;
    delete: boolean;
    list: boolean;
  };
}

export default function UsersPage() {
  const { rules, authLoading } = useUserData();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [users, setUsers] = useState<(User & { rules_name: string })[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filterId, setFilterId] = useState("");
  const [filterName, setFilterName] = useState("");
  const [showFilterInput, setShowFilterInput] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [filterIdError, setFilterIdError] = useState<string | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState(10); // Default to 10 rows
  const [currentPage, setCurrentPage] = useState(1); // Default to page 1
  const router = useRouter();

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  const permissions = useMemo<Permissions | null>(() => {
    if (!rules) return null;
    return {
      users: {
        add: !!rules.add_user_status,
        edit: !!rules.edit_user_status,
        delete: !!rules.delete_user_status,
        list: !!rules.list_user_status,
      },
    };
  }, [rules]);

  useEffect(() => {
    if (!permissions) return;
    const currentPermissions = permissions;

    async function loadData() {
      try {
        setIsLoading(true);
        if (!currentPermissions.users.list) {
          setError("You do not have permission to view users.");
          toast.error("You do not have permission to view users.");
          return;
        }

        const { users, error } = await fetchUsers();
        setUsers(users || []);
        setError(error);
        if (error) toast.error(error);
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "An unknown error occurred.";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [permissions]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    if (value && !/^\d+$/.test(value)) {
      setFilterIdError("User ID must be numeric");
    } else {
      setFilterIdError(null);
      setFilterId(value);
    }
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleFilterNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilterName(value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleFilterToggle = () => {
    setShowFilterInput((prev) => !prev);
    if (showFilterInput) {
      setFilterId("");
      setFilterName("");
      setFilterIdError(null);
    }
    setCurrentPage(1); // Reset to first page when clearing filter
  };

  const handleClearFilter = () => {
    setFilterId("");
    setFilterName("");
    setFilterIdError(null);
    setShowFilterInput(false);
    setCurrentPage(1); // Reset to first page
  };

  const handleExport = async (format: "excel" | "pdf" | "csv") => {
    if (!permissions?.users.list) {
      toast.error("You do not have permission to export users.");
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
        cache: "no-store",
      });

      if (!response.ok) {
        const data = await response.json();
        if (
          data.error?.includes("expired") ||
          data.error?.includes("Invalid token")
        ) {
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

  const handleEditUser = (id: string) => {
    if (!permissions?.users.edit) {
      toast.error("You do not have permission to edit users.");
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
      toast.error("You do not have permission to delete users.");
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
        if (
          data.error?.includes("expired") ||
          data.error?.includes("Invalid token")
        ) {
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
      setCurrentPage(1); // Reset to first page after deletion
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      setError(`Failed to delete user: ${errorMsg}`);
      toast.error(`Failed to delete user: ${errorMsg}`);
      closeDeleteModal();
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteModal = (id: string) => {
    setDeleteUserId(id);
  };

  const closeDeleteModal = () => {
    setDeleteUserId(null);
  };

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when rows per page changes
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

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  if (authLoading || isLoading) {
    return (
      <div className="text-gray-500 text-center text-sm sm:text-base">
        Loading users...
      </div>
    );
  }

  if (!permissions?.users.list || error) {
    return (
      <div className="text-red-600 text-center text-sm sm:text-base">
        {error || "You do not have permission to view users."}
      </div>
    );
  }

  return (
    <Card className="p-4 sm:p-6">
      {/* First row: Title + Rows per page */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
          Users
        </h1>
        {/* Rows Per Page Dropdown */}
        <div className="flex items-center space-x-2">
          <label htmlFor="rowsPerPage" className="text-gray-600 text-sm">
            Rows per page:
          </label>
          <select
            id="rowsPerPage"
            value={rowsPerPage}
            onChange={handleRowsPerPageChange}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
            aria-label="Select rows per page"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Second row: Create + Filter + Export */}
      {(permissions?.users.add || permissions?.users.list) && (
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8 w-full max-w-full">
          {permissions.users.add && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/pages/admin/user/add_user")}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex-1 sm:flex-none sm:w-40 text-sm sm:text-base flex items-center justify-center"
                aria-label="Create new user"
              >
                <span className="mr-2">+</span> Create User
              </button>
            </div>
          )}

          {permissions.users.list && (
            <>
              {/* Filter Button + Input */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleFilterToggle}
                  className="bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 flex-1 sm:flex-none sm:w-32 text-sm sm:text-base flex items-center justify-center"
                  aria-label="Toggle filter input"
                >
                  <span className="mr-2">🔍</span> Filter
                </button>
                {showFilterInput && (
                  <div className="flex gap-2 w-full sm:w-auto">
                    <input
                      type="text"
                      value={filterId}
                      onChange={handleFilterChange}
                      placeholder="Enter User ID"
                      className="w-full sm:w-40 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                      aria-label="Filter by user ID"
                    />
                    <input
                      type="text"
                      value={filterName}
                      onChange={handleFilterNameChange}
                      placeholder="Enter Name or Email"
                      className="w-full sm:w-40 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                      aria-label="Filter by name or email"
                    />
                    <button
                      onClick={handleClearFilter}
                      className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 text-sm sm:text-base"
                      aria-label="Reset filter"
                    >
                      Reset
                    </button>
                  </div>
                )}
              </div>

              {/* Export Button + Options */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowExportOptions((prev) => !prev)}
                  className="bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 flex-1 sm:flex-none sm:w-32 text-sm sm:text-base flex items-center justify-center"
                  aria-label="Toggle export options"
                >
                  <span className="mr-2">📄</span> Export
                </button>
                {showExportOptions && (
                  <div className="flex gap-2 w-full sm:w-auto">
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
            </>
          )}
        </div>
      )}

      {/* Users Table here */}
      <UsersTable
        users={paginatedUsers}
        permissions={permissions}
        onEdit={handleEditUser}
        onDelete={openDeleteModal}
      />
    </Card>
  );
}

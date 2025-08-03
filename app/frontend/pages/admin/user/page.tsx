"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { User } from "@/app/backend/types/user";
import { fetchUsers } from "./action";
import HeaderResponsive from "@/app/frontend/components/common/Header/headerResponsive";
import UsersHeader from "@/app/frontend/components/Admin/AllUser_components/UserHeader";
import FilterControls from "@/app/frontend/components/Admin/AllUser_components/FilterControls";
import ExportOptions from "@/app/frontend/components/Admin/AllUser_components/ExportOptions";
import UsersTable from "@/app/frontend/components/Admin/AllUser_components/UsersTables";
import DeleteModal from "@/app/frontend/components/Admin/AllUser_components/DeleteModel";
import Card from "@/app/frontend/components/common/Card/Card";

interface Permissions {
  users: {
    add: boolean;
    edit: boolean;
    delete: boolean;
    list: boolean;
  };
}

export default function UsersPage() {
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
  const [permissions, setPermissions] = useState<Permissions | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState(10); // Default to 10 rows
  const [currentPage, setCurrentPage] = useState(1); // Default to page 1
  const router = useRouter();

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  useEffect(() => {
    async function loadData() {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) {
          toast.error("Please log in to access this page.");
          router.push("/");
          return;
        }

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

        if (!userPermissions.users.list) {
          setError("You do not have permission to view users.");
          toast.error("You do not have permission to view users.");
          return;
        }

        const { users, error } = await fetchUsers();
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
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + rowsPerPage);

  if (isLoading) {
    return (
      <HeaderResponsive>
        <div className="flex w-full">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-full pt-16 transition-all duration-300 box-border">
            <div className="text-gray-500 text-center text-sm sm:text-base">
              Loading users...
            </div>
          </main>
        </div>
      </HeaderResponsive>
    );
  }

  if (!permissions?.users.list || error) {
    return (
      <HeaderResponsive>
        <div className="flex w-full">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-full pt-16 transition-all duration-300 box-border">
            <div className="text-red-600 text-center text-sm sm:text-base">
              {error || "You do not have permission to view users."}
            </div>
          </main>
        </div>
      </HeaderResponsive>
    );
  }

  return (
    <HeaderResponsive>
      <div className="flex w-full">
        <main className="flex-1 mt-12 sm:p-6 lg:p-8 w-full max-w-full pt-16 transition-all duration-300 box-border">
          <Card className="mt-6 sm:mt-8 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <UsersHeader
                permissions={permissions}
                onFilterToggle={handleFilterToggle}
                onExportToggle={() => setShowExportOptions((prev) => !prev)}
              />
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
            {permissions.users.list && (
              <>
                <FilterControls
                  showFilterInput={showFilterInput}
                  filterId={filterId}
                  filterName={filterName}
                  filterIdError={filterIdError}
                  onFilterIdChange={handleFilterChange}
                  onFilterNameChange={handleFilterNameChange}
                  onClearFilter={handleClearFilter}
                />
                <ExportOptions
                  showExportOptions={showExportOptions}
                  permissions={permissions}
                  onExport={handleExport}
                />
                <UsersTable
                  users={paginatedUsers}
                  permissions={permissions}
                  onEdit={handleEditUser}
                  onDelete={openDeleteModal}
                  // startIndex={startIndex}
                />
                {filteredUsers.length > 0 && (
                  <div className="flex justify-between items-center mt-4">
                    <button
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded ${
                        currentPage === 1
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-blue-500 text-white hover:bg-blue-600"
                      }`}
                      aria-label="Previous page"
                    >
                      Previous
                    </button>
                    <span className="text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded ${
                        currentPage === totalPages
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-blue-500 text-white hover:bg-blue-600"
                      }`}
                      aria-label="Next page"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
            <DeleteModal
              isOpen={deleteUserId !== null}
              users={users}
              deleteUserId={deleteUserId}
              onClose={closeDeleteModal}
              onConfirm={handleDeleteUser}
            />
          </Card>
        </main>
      </div>
    </HeaderResponsive>
  );
}
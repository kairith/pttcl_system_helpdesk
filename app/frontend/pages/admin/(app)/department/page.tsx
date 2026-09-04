"use client";

import React, { useState, useEffect, useMemo, Fragment } from "react";
import { fetchDepartments } from "./action";
import { useRouter } from "next/navigation";
import { TrashIcon, PencilIcon } from "@heroicons/react/24/solid";
import { Dialog, Transition } from "@headlessui/react";
import { Department } from "@/app/backend/types/department";
import LoadingScreen from "@/app/frontend/components/ui/loadingScreen";
import Card from "@/app/frontend/components/common/Card/Card";
import { useUserData } from "@/app/frontend/components/common/Header/UserDataProvider";

interface Permissions {
  departments: {
    add: boolean;
    edit: boolean;
    delete: boolean;
    list: boolean;
  };
}

export default function Departments() {
  const { rules, authLoading } = useUserData();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filterName, setFilterName] = useState("");
  const [showFilterInput, setShowFilterInput] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [deleteDepartmentId, setDeleteDepartmentId] = useState<number | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState(10); // Default to 10 rows
  const [currentPage, setCurrentPage] = useState(1); // Default to page 1
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  const permissions = useMemo<Permissions | null>(() => {
    if (!rules) return null;
    return {
      departments: {
        add: !!rules.add_department,
        edit: !!rules.edit_department,
        delete: !!rules.delete_department,
        list: !!rules.list_department,
      },
    };
  }, [rules]);

  // Fetch departments once permissions resolve
  useEffect(() => {
    if (!permissions) return;
    const currentPermissions = permissions;
    setIsLoading(true);
    async function loadData() {
      try {
        // Fetch departments only if list permission exists
        if (currentPermissions.departments.list) {
          const { departments, error } = await fetchDepartments();
          setDepartments(departments || []);
          setError(error);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred."
        );
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [permissions]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterName(e.target.value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleFilterToggle = () => {
    setShowFilterInput((prev) => !prev);
    if (showFilterInput) {
      setFilterName("");
      setCurrentPage(1); // Reset to first page when clearing filter
    }
  };

  const handleClearFilter = () => {
    setFilterName("");
    setShowFilterInput(false);
    setCurrentPage(1); // Reset to first page
  };

  const handleExport = async (format: "xlsx" | "pdf" | "csv") => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }

      const response = await fetch(
        `/api/data/export-departments?format=${format}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        if (
          data.error?.includes("expired") ||
          data.error?.includes("Invalid token")
        ) {
          router.push("/");
        } else {
          throw new Error(data.error || `Export to ${format} failed`);
        }
      }

      const fileName = `departments_export.${format}`;
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
      setShowExportOptions(false);
    } catch (error) {
      setError(
        `Failed to export departments: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleDeleteDepartment = (id: number) => {
    setDeleteDepartmentId(id); // Open the modal
  };

  const confirmDeleteDepartment = async () => {
    if (!deleteDepartmentId) return;

    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }

      const response = await fetch(
        `/api/data/delete_department/${deleteDepartmentId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        if (
          data.error?.includes("expired") ||
          data.error?.includes("Invalid token")
        ) {
          router.push("/");
        } else {
          throw new Error(data.error || "Failed to delete department");
        }
      }

      const { departments, error } = await fetchDepartments();
      setDepartments(departments || []);
      setError(error);
      closeDeleteModal();
      setCurrentPage(1); // Reset to first page after deletion
    } catch (error) {
      setError(
        `Failed to delete department: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      closeDeleteModal();
    }
  };

  const closeDeleteModal = () => {
    setDeleteDepartmentId(null);
  };

  const handleEditDepartment = (id: number) => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }
    router.push(`/pages/admin/department/edit_department/${id}`);
  };

  const handleCreateDepartment = () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }
    router.push("/pages/admin/department/add_department");
  };

  const toggleExportOptions = () => {
    setShowExportOptions((prev) => !prev);
  };

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when rows per page changes
  };

  const filteredDepartments = filterName
    ? departments.filter((department) =>
        department.department_name.toString().includes(filterName)
      )
    : departments;

  // Pagination logic
  const totalPages = Math.ceil(filteredDepartments.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedDepartments = filteredDepartments.slice(startIndex, startIndex + rowsPerPage);

  if (authLoading || isLoading) {
    return (
        <LoadingScreen />
    );
  }

  return (
    <>
      <div className="w-full max-w-full">
            <Card className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                  Departments
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
              {error && <p className="text-red-600 mb-4">{error}</p>}
              {(permissions?.departments.add || permissions?.departments.list) && (
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8 w-full max-w-full">
                  {permissions.departments.add && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleCreateDepartment}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex-1 sm:flex-none sm:w-40 text-sm sm:text-base flex items-center justify-center"
                        aria-label="Create new department"
                      >
                        <span className="mr-2">+</span> Department
                      </button>
                    </div>
                  )}
                  {permissions.departments.list && (
                    <>
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
                              value={filterName}
                              onChange={handleFilterChange}
                              placeholder="Enter Department Name"
                              className="w-full sm:w-40 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                              aria-label="Filter by department name"
                            />
                            <button
                              onClick={handleClearFilter}
                              className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 text-sm sm:text-base"
                              aria-label="Reset filter"
                            >
                              Reset filter
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={toggleExportOptions}
                          className="bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 flex-1 sm:flex-none sm:w-32 text-sm sm:text-base flex items-center justify-center"
                          aria-label="Toggle export options"
                        >
                          <span className="mr-2">📄</span> Export
                        </button>
                        {showExportOptions && (
                          <div className="flex gap-2 w-full sm:w-auto">
                            <button
                              onClick={() => handleExport("xlsx")}
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
              {permissions?.departments.list && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100 rounded-xl">
                        <th className="text-left p-2 sm:p-3 font-bold text-gray-800 min-w-[80px]">
                          No
                        </th>
                        {(permissions.departments.edit ||
                          permissions.departments.delete) && (
                          <th className="text-left p-2 sm:p-3 font-bold text-gray-800 min-w-[100px]">
                            Action
                          </th>
                        )}
                        <th className="text-left p-2 sm:p-3 font-bold text-gray-800 min-w-[150px]">
                          Department Name
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedDepartments.length === 0 ? (
                        <tr>
                          <td
                            colSpan={
                              permissions.departments.edit ||
                              permissions.departments.delete
                                ? 3
                                : 2
                            }
                            className="p-4 text-center text-gray-500"
                          >
                            No departments found.
                          </td>
                        </tr>
                      ) : (
                        paginatedDepartments.map((department, index) => (
                          <tr
                            key={department.id}
                            className="border-b border-gray-200"
                          >
                            <td className="p-2 sm:p-3 text-gray-700 min-w-0">
                              {startIndex + index + 1}
                            </td>
                            {(permissions.departments.edit ||
                              permissions.departments.delete) && (
                              <td className="p-2 sm:p-3 text-gray-700 flex gap-2 min-w-0">
                                {permissions.departments.edit && (
                                  <button
                                    onClick={() =>
                                      handleEditDepartment(department.id)
                                    }
                                    className="p-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                                    aria-label={`Edit department ${department.department_name}`}
                                  >
                                    <PencilIcon className="w-4 h-4" />
                                  </button>
                                )}
                                {permissions.departments.delete && (
                                  <button
                                    onClick={() =>
                                      handleDeleteDepartment(department.id)
                                    }
                                    className="p-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors"
                                    aria-label={`Delete department ${department.department_name}`}
                                  >
                                    <TrashIcon className="w-4 h-4" />
                                  </button>
                                )}
                              </td>
                            )}
                            <td className="p-2 sm:p-3 text-gray-700 min-w-0">
                              {department.department_name}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
              {permissions?.departments.list && filteredDepartments.length > 0 && (
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
      </Card>
      </div>
      {/* Delete Confirmation Modal */}
      {permissions?.departments.delete && (
            <Transition appear show={deleteDepartmentId !== null} as={Fragment}>
              <Dialog as="div" className="relative z-10" onClose={closeDeleteModal}>
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
                            Are you sure you want to delete this department?
                            This action cannot be undone.
                          </p>
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                          <button
                            type="button"
                            className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                            onClick={closeDeleteModal}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                            onClick={confirmDeleteDepartment}
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
    </>
  );
}

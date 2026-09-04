
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function EditDepartment() {

  const [department, setDepartment] = useState<{
    department_name: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { id } = useParams();
  const router = useRouter();



  useEffect(() => {
    async function loadDepartment() {
      setIsLoading(true);
      const token = sessionStorage.getItem("token");
      if (!token) {
        setError("Please log in as an admin.");
        toast.error("Please log in as an admin.");
        router.push("/");
        return;
      }
      try {
        const response = await fetch(`/api/data/edit_department/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setDepartment({
          department_name: data.department.department_name,
        });
      } catch (err) {
        const errorMsg = err && typeof err === "object" && "message" in err
          ? String((err as { message?: unknown }).message)
          : "Failed to load department";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setIsLoading(false);
      }
    }
    loadDepartment();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!department) {
      setError("No department data loaded");
      toast.error("No department data loaded");
      return;
    }
    if (!department.department_name.trim()) {
      setError("Department name is required");
      toast.error("Department name is required");
      return;
    }
    const token = sessionStorage.getItem("token");
    if (!token) {
      setError("Please log in as an admin.");
      toast.error("Please log in as an admin.");
      router.push("/");
      return;
    }
    try {
      const response = await fetch(`/api/data/edit_department/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          department_name: department.department_name,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update department");
      }
      toast.success("Department updated successfully!");
      router.push("/pages/admin/department");
    } catch (err) {
      const errorMsg = err && typeof err === "object" && "message" in err
        ? String((err as { message?: unknown }).message)
        : "Failed to update department";
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  if (isLoading) {
    return (
        <div className="flex w-full">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-full pt-16 transition-all duration-300 box-border">
            <ToastContainer position="top-right" autoClose={3000} />
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
                <span className="text-lg font-medium text-gray-600">Loading department data...</span>
              </div>
            </div>
          </main>
        </div>
    );
  }

  if (error) {
    return (
        <div className="flex w-full">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-full pt-16 transition-all duration-300 box-border">
            <ToastContainer position="top-right" autoClose={3000} />
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
    );
  }

  return (
      <div className="flex w-full">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-full pt-16 transition-all duration-300 box-border">
          <ToastContainer position="top-right" autoClose={3000} />
          <div className="flex justify-center items-center min-h-[calc(100vh-128px)]">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md w-full max-w-md sm:max-w-full border border-gray-200">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">
                Edit Department
              </h1>
              {error && (
                <div className="mb-4 p-3 rounded text-sm sm:text-base bg-red-100 text-red-800 w-full max-w-full">
                  {error}
                </div>
              )}
              {department && (
                <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-full min-w-0">
                  <div className="space-y-4">
                    <div className="flex flex-col">
                      <label htmlFor="department_name" className="block text-sm font-medium text-gray-700 mb-1">
                        Department Name
                      </label>
                      <input
                        id="department_name"
                        type="text"
                        value={department.department_name}
                        onChange={(e) => setDepartment({ ...department, department_name: e.target.value })}
                        className="w-full max-w-full min-w-0 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                        placeholder="Enter department name"
                        aria-label="Department Name"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-center space-x-4 mt-4 sm:mt-6">
                    <button
                      type="submit"
                      className="w-full sm:w-40 max-w-full min-w-0 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 text-sm sm:text-base font-medium"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push("/pages/admin/department")}
                      className="w-full sm:w-40 max-w-full min-w-0 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 text-sm sm:text-base font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </main>
      </div>
  );
}


"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import HeaderWithSidebar from "@/app/frontend/components/common/Header/Headerwithsidebar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AddStation() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    station_id: "",
    station_name: "",
    station_type: "",
    province: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const { station_id, station_name, station_type, province } = formData;
    if (
      !station_id.trim() ||
      !station_name.trim() ||
      !station_type.trim() ||
      !province.trim()
    ) {
      setError("All fields are required");
      setIsLoading(false);
      return;
    }
    if (!/^[A-Z0-9]+$/.test(station_id)) {
      setError("Station ID must be alphanumeric and uppercase");
      setIsLoading(false);
      return;
    }

    const token = sessionStorage.getItem("token");
    if (!token) {
      setError("Please log in to add a station.");
      toast.error("Please log in to add a station.");
      router.push("/");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/data/add_station", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add station");
      }

      toast.success("Station added successfully!");
      router.push("/pages/admin/station");
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "An unexpected error occurred";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen bg-gray-50 ${isSidebarOpen ? "sm:ml-64" : ""} transition-all duration-300 overflow-x-hidden box-border`}>
        <HeaderWithSidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
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
                <span className="text-lg font-medium text-gray-600">Creating station...</span>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error && error.includes("log in")) {
    return (
      <div className={`min-h-screen bg-gray-50 ${isSidebarOpen ? "sm:ml-64" : ""} transition-all duration-300 overflow-x-hidden box-border`}>
        <HeaderWithSidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
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
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${isSidebarOpen ? "sm:ml-64" : ""} transition-all duration-300 overflow-x-hidden box-border`}>
      <HeaderWithSidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex w-full">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-full pt-16 transition-all duration-300 box-border">
          <ToastContainer position="top-right" autoClose={3000} />
          <div className="flex justify-center items-center min-h-[calc(100vh-128px)]">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md w-full max-w-md sm:max-w-2xl border border-gray-200">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">
                Add Station
              </h1>
              {error && (
                <div className="mb-4 p-3 rounded text-sm sm:text-base bg-red-100 text-red-800 w-full max-w-full">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-full min-w-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="flex flex-col">
                    <label
                      htmlFor="station_id"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Station ID
                    </label>
                    <input
                      id="station_id"
                      type="text"
                      name="station_id"
                      value={formData.station_id}
                      onChange={handleChange}
                      className="w-full max-w-full min-w-0 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                      placeholder="e.g., F001"
                      aria-label="Station ID"
                      required
                    />
                  </div>
                  <div className="flex flex-col">
                    <label
                      htmlFor="station_name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Station Name
                    </label>
                    <input
                      id="station_name"
                      type="text"
                      name="station_name"
                      value={formData.station_name}
                      onChange={handleChange}
                      className="w-full max-w-full min-w-0 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                      placeholder="Enter station name"
                      aria-label="Station Name"
                      required
                    />
                  </div>
                  <div className="flex flex-col">
                    <label
                      htmlFor="province"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Province
                    </label>
                    <input
                      id="province"
                      type="text"
                      name="province"
                      value={formData.province}
                      onChange={handleChange}
                      className="w-full max-w-full min-w-0 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                      placeholder="Enter province"
                      aria-label="Province"
                      required
                    />
                  </div>
                  <div className="flex flex-col">
                    <label
                      htmlFor="station_type"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Type
                    </label>
                    <select
                      id="station_type"
                      name="station_type"
                      value={formData.station_type}
                      onChange={handleChange}
                      className="w-full max-w-full min-w-0 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                      aria-label="Station Type"
                      required
                    >
                      <option value="">Select type</option>
                      <option value="COCO">COCO</option>
                      <option value="DODO">DODO</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-center mt-4 sm:mt-6">
                  <button
                    type="submit"
                    className="w-full sm:w-40 max-w-full min-w-0 bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300 text-sm sm:text-base font-medium"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating..." : "Create Station"}
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

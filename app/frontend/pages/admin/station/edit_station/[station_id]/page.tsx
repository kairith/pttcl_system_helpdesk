
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import HeaderWithSidebar from "@/app/frontend/components/common/Header/Headerwithsidebar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function EditStation() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [station, setStation] = useState<{
    station_id: string;
    station_name: string;
    station_type: string;
    province: string;
  } | null>(null);
  const [stationTypes, setStationTypes] = useState<string[]>([]);
  const [provinces, setProvinces] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { station_id } = useParams();
  const router = useRouter();

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  useEffect(() => {
    async function loadStation() {
      setIsLoading(true);
      const token = sessionStorage.getItem("token");
      if (!token) {
        setError("Please log in as an admin.");
        toast.error("Please log in as an admin.");
        router.push("/");
        return;
      }
      try {
        const response = await fetch(`/api/data/edit_station/${station_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setStation({
          station_id: data.station.station_id,
          station_name: data.station.station_name,
          station_type: data.station.station_type,
          province: data.station.province,
        });
        setStationTypes(data.stationTypes || []);
        setProvinces(data.provinces || []);
      } catch (err) {
        const errorMsg = err && typeof err === "object" && "message" in err
          ? String((err as { message?: unknown }).message)
          : "Failed to load station";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setIsLoading(false);
      }
    }
    loadStation();
  }, [station_id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!station) {
      setError("No station data loaded");
      toast.error("No station data loaded");
      return;
    }
    if (!station.station_name.trim() || !station.station_type.trim() || !station.province.trim()) {
      setError("All fields are required");
      toast.error("All fields are required");
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
      const response = await fetch(`/api/data/edit_station/${station_id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          station_name: station.station_name,
          station_type: station.station_type,
          province: station.province,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update station");
      }
      toast.success("Station updated successfully!");
      router.push("/pages/admin/station");
    } catch (err) {
      const errorMsg = err && typeof err === "object" && "message" in err
        ? String((err as { message?: unknown }).message)
        : "Failed to update station";
      setError(errorMsg);
      toast.error(errorMsg);
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
                <span className="text-lg font-medium text-gray-600">Loading station data...</span>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
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
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md w-full max-w-md sm:max-w-full border border-gray-200">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">
                Edit Station
              </h1>
              {error && (
                <div className="mb-4 p-3 rounded text-sm sm:text-base bg-red-100 text-red-800 w-full max-w-full">
                  {error}
                </div>
              )}
              {station && (
                <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-full min-w-0">
                  <div className="space-y-4">
                    <div className="flex flex-col">
                      <label htmlFor="station_id" className="block text-sm font-medium text-gray-700 mb-1">
                        Station ID
                      </label>
                      <input
                        id="station_id"
                        type="text"
                        value={station.station_id}
                        disabled
                        className="w-full max-w-full min-w-0 p-2 border border-gray-300 bg-gray-200 rounded-md text-gray-500 text-sm sm:text-base"
                        aria-label="Station ID"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label htmlFor="station_name" className="block text-sm font-medium text-gray-700 mb-1">
                        Station Name
                      </label>
                      <input
                        id="station_name"
                        type="text"
                        value={station.station_name}
                        onChange={(e) => setStation({ ...station, station_name: e.target.value })}
                        className="w-full max-w-full min-w-0 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                        placeholder="Enter station name"
                        aria-label="Station Name"
                        required
                      />
                    </div>
                    <div className="flex flex-col">
                      <label htmlFor="station_type" className="block text-sm font-medium text-gray-700 mb-1">
                        Station Type
                      </label>
                      <select
                        id="station_type"
                        value={station.station_type}
                        onChange={(e) => setStation({ ...station, station_type: e.target.value })}
                        className="w-full max-w-full min-w-0 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                        aria-label="Station Type"
                        required
                      >
                        <option value="">Select Station Type</option>
                        {stationTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col">
                      <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">
                        Province
                      </label>
                      <select
                        id="province"
                        value={station.province}
                        onChange={(e) => setStation({ ...station, province: e.target.value })}
                        className="w-full max-w-full min-w-0 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                        aria-label="Province"
                        required
                      >
                        <option value="">Select Province</option>
                        {provinces.map((prov) => (
                          <option key={prov} value={prov}>
                            {prov}
                          </option>
                        ))}
                      </select>
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
                      onClick={() => router.push("/pages/admin/station")}
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
    </div>
  );
}

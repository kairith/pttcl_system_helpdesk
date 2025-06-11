"use client";
import React, { useState, useEffect } from "react";
import { Station } from "../../types/station";
import { fetchStations } from "./action";
import Header from "@/app/components/common/Header/Header";
import { useRouter } from "next/navigation";

interface StationsProps {
  isSidebarOpen: boolean;
}

export default function Stations({ isSidebarOpen }: StationsProps) {
  const [stations, setStations] = useState<Station[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filterId, setFilterId] = useState("");
  const [showFilterInput, setShowFilterInput] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function loadStations() {
      const { stations, error } = await fetchStations();
      setStations(stations || []);
      setError(error);
    }
    loadStations();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterId(e.target.value);
  };

  const handleFilterToggle = () => {
    setShowFilterInput((prev) => !prev);
    if (showFilterInput) {
      setFilterId(""); // Clear filter when hiding input
    }
  };

  const handleClearFilter = () => {
    setFilterId("");
    setShowFilterInput(false);
  };

  const handleExport = async (format: "xlsx" | "pdf" | "csv") => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        setError("Please log in as an admin.");
        router.push("/");
        return;
      }

      const response = await fetch(`/api/data/export-stations?format=${format}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.error && data.error.includes("expired")) {
          setError("Session expired. Please log in again.");
          router.push("/");
        } else {
          throw new Error(data.error || `Export to ${format} failed`);
        }
      }

      const fileName = `stations_export.${format}`;

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
      setShowExportOptions(false);
    } catch (error) {
      setError(`Failed to export stations: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const toggleExportOptions = () => {
    setShowExportOptions((prev) => !prev);
  };

  const filteredStations = filterId
    ? stations.filter((station) => station.station_id.toString().includes(filterId))
    : stations;

  const handleCreateStation = () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      alert("Please log in to create a station.");
      router.push("/");
      return;
    }
    router.push("/admin/station/add_station");
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          <main
            className={`flex-1 p-4 sm:p-6 lg:p-8 w-full transition-all duration-300 ${
              isSidebarOpen ? "sm:ml-64" : "sm:ml-0"
            }`}
          >
            <div className="text-red-500 text-center text-sm sm:text-base">{error}</div>
          </main>
        </div>
      </div>
    );
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
                Stations</h1>
              {error && <p className="text-red-600 mb-4">{error}</p>}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="relative flex items-center gap-3">
                  <button
                    onClick={handleCreateStation}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex-1 sm:flex-none sm:w-40 text-sm sm:text-base flex items-center justify-center"
                  >
                    <span className="mr-2">+</span> Create Station
                  </button>
                </div>
                <div className="relative flex items-center gap-3">
                  <button
                    onClick={handleFilterToggle}
                    className="bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 flex-1 sm:flex-none sm:w-32 text-sm sm:text-base flex items-center justify-center"
                  >
                    <span className="mr-2">🔍</span> Filter
                  </button>
                  {showFilterInput && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={filterId}
                        onChange={handleFilterChange}
                        placeholder="Enter Station ID"
                        className="w-full sm:w-40 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                      />
                      <button
                        onClick={handleClearFilter}
                        className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 text-sm sm:text-base"
                      >
                        Reset filter
                      </button>
                    </div>
                  )}
                </div>
                <div className="relative flex items-center gap-3">
                  <button
                    onClick={toggleExportOptions}
                    className="bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 flex-1 sm:flex-none sm:w-32 text-sm sm:text-base flex items-center justify-center"
                  >
                    <span className="mr-2">📄</span> Export
                  </button>
                  {showExportOptions && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleExport("xlsx")}
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
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 rounded-xl">
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">ID</th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Station ID</th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Station Name</th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Province</th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Station Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStations.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-gray-500">
                          No stations found.
                        </td>
                      </tr>
                    ) : (
                      filteredStations.map((station, index) => (
                        <tr
                          key={station.id}
                          className={`border-b border-gray-200 hover:bg-gray-50 ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }`}
                        >
                          <td className="p-2 sm:p-3 text-gray-700">{station.id}</td>
                          <td className="p-2 sm:p-3 text-gray-700">{station.station_id}</td>
                          <td className="p-2 sm:p-3 text-gray-700">{station.station_name}</td>
                          <td className="p-2 sm:p-3 text-gray-700">{station.province}</td>
                          <td className="p-2 sm:p-3 text-gray-700">{station.station_type}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
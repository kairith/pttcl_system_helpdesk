
// app/pages/admin/station/page.tsx
"use client";
import React, { useState, useEffect, Fragment } from "react";
import { fetchStations } from "./action";
import Header from "@/app/components/common/Header/Headerwithsidebar";
import { useRouter } from "next/navigation";
import { TrashIcon, PencilIcon } from "@heroicons/react/24/solid";
import { Dialog, Transition } from "@headlessui/react";

interface Station {
  id: number;
  station_id: string;
  station_name: string;
  station_type: string;
  province: string;
}

interface StationsProps {
  isSidebarOpen: boolean;
}

export default function Stations({ isSidebarOpen }: StationsProps) {
  const [stations, setStations] = useState<Station[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filterId, setFilterId] = useState("");
  const [showFilterInput, setShowFilterInput] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [deleteStationId, setDeleteStationId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadStations() {
      const { stations, error } = await fetchStations();
      setStations(
        (stations || []).map((station: any) => ({
          ...station,
          station_type: String(station.station_type),
        }))
      );
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
      setFilterId("");
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
          Authorization: `Bearer ${token}`,
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

  const handleDeleteStation = async (id: string) => {
    setDeleteStationId(id); // Open the modal
  };

  const confirmDeleteStation = async () => {
    if (!deleteStationId) return;

    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        setError("Please log in as an admin.");
        router.push("/");
        return;
      }

      console.log(`Deleting station_id=${deleteStationId}`);
      const response = await fetch(`/api/data/delete_station/${deleteStationId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.error && data.error.includes("expired")) {
          setError("Session expired. Please log in again.");
          router.push("/");
        } else {
          throw new Error(data.error || "Failed to delete station");
        }
      }

      const { stations, error } = await fetchStations();
      setStations(
        (stations || []).map((station: any) => ({
          ...station,
          station_type: String(station.station_type),
        }))
      );
      setError(error);
      closeDeleteModal();
    } catch (error) {
      setError(`Failed to delete station: ${error instanceof Error ? error.message : "Unknown error"}`);
      closeDeleteModal();
    }
  };

  const closeDeleteModal = () => {
    setDeleteStationId(null);
  };

  const handleEditStation = (station_id: string) => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      setError("Please log in as an admin.");
      router.push("/");
      return;
    }
    console.log(`Navigating to edit station_id=${station_id}`);
    router.push(`/pages/admin/station/edit_station/${station_id}`);
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
      setError("Please log in to create a station.");
      router.push("/");
      return;
    }
    router.push("/pages/admin/station/add_station");
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
                Stations
              </h1>
              {error && <p className="text-red-600 mb-4">{error}</p>}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="relative flex items-center gap-3">
                  <button
                    onClick={handleCreateStation}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex-1 sm:flex-none sm:w-40 text-sm sm:text-base flex items-center justify-center"
                    aria-label="Create new station"
                  >
                    <span className="mr-2">+</span> Create Station
                  </button>
                </div>
                <div className="relative flex items-center gap-3">
                  <button
                    onClick={handleFilterToggle}
                    className="bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 flex-1 sm:flex-none sm:w-32 text-sm sm:text-base flex items-center justify-center"
                    aria-label="Toggle filter input"
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
                        aria-label="Filter by station ID"
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
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 rounded-xl">
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">ID</th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Action</th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Station ID</th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Station Name</th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Province</th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Station Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStations.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-gray-500">
                          No stations found.
                        </td>
                      </tr>
                    ) : (
                      filteredStations.map((station) => (
                        <tr
                          key={station.station_id}
                          className={`border-b border-gray-200 hover:bg-gray-50`}
                        >
                          <td className="p-2 sm:p-3 text-gray-700">{station.id}</td>
                          <td className="p-2 sm:p-3 text-gray-700 flex gap-2">
                            <button
                              onClick={() => handleEditStation(station.station_id)}
                              className="p-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                              aria-label={`Edit station ${station.station_name}`}
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteStation(station.station_id)}
                              className="p-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors"
                              aria-label={`Delete station ${station.station_name}`}
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </td>
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

      {/* Delete Confirmation Modal */}
      <Transition appear show={deleteStationId !== null} as={Fragment}>
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
                      Are you sure you want to delete station ID {deleteStationId}? This action cannot be undone.
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
                      onClick={confirmDeleteStation}
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
    </div>
  );
}


"use client";

import React, { useState, useEffect, Fragment } from "react";
import { fetchStations } from "./action";
import HeaderResponsive from "@/app/frontend/components/common/Header/headerResponsive";
import { useRouter } from "next/navigation";
import { TrashIcon, PencilIcon } from "@heroicons/react/24/solid";
import { Dialog, Transition } from "@headlessui/react";
import { Station } from "@/app/backend/types/station";
import LoadingScreen from "@/app/frontend/components/ui/loadingScreen";

interface Permissions {
  stations: {
    add: boolean;
    edit: boolean;
    delete: boolean;
    list: boolean;
  };
}

export default function Stations() {

  const [stations, setStations] = useState<Station[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filterId, setFilterId] = useState("");
  const [showFilterInput, setShowFilterInput] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [deleteStationId, setDeleteStationId] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<Permissions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();



  // Fetch permissions and stations on mount
  useEffect(() => {
    setIsLoading(true);
    async function loadData() {
      try {
        // Get token
        const token = sessionStorage.getItem("token");
        if (!token) {
          router.push("/");
          return;
        }
        // Fetch user and permissions
        const response = await fetch("/api/data/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          const data = await response.json();
          if (data.error?.includes("Invalid token")) {
            router.push("/");
            return;
          }
          throw new Error(data.error || "Failed to fetch permissions");
        }
        const { rules } = await response.json();
        const userPermissions: Permissions = {
          stations: {
            add: !!rules.add_station,
            edit: !!rules.edit_station,
            delete: !!rules.delete_station,
            list: !!rules.list_station,
          },
        };

        setPermissions(userPermissions);

        // Fetch stations only if list permission exists
        if (userPermissions.stations.list) {
          const { stations, error } = await fetchStations();
          setStations(
            (stations || []).map((station: any) => ({
              ...station,
              station_type: String(station.station_type),
            }))
          );
          setError(error);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred."
        );
      }
      finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [router]);

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
        router.push("/");
        return;
      }

      const response = await fetch(
        `/api/data/export-stations?format=${format}`,
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
      setError(
        `Failed to export stations: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleDeleteStation = (id: string) => {
    setDeleteStationId(id); // Open the modal
  };

  const confirmDeleteStation = async () => {
    if (!deleteStationId) return;

    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }

      const response = await fetch(
        `/api/data/delete_station/${deleteStationId}`,
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
      setError(
        `Failed to delete station: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      closeDeleteModal();
    }
  };

  const closeDeleteModal = () => {
    setDeleteStationId(null);
  };

  const handleEditStation = (station_id: string) => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }
    router.push(`/pages/Users/station/edit_station/${station_id}`);
  };

  const handleCreateStation = () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }
    router.push("/pages/Users/station/add_station");
  };

  const toggleExportOptions = () => {
    setShowExportOptions((prev) => !prev);
  };

  const filteredStations = filterId
    ? stations.filter((station) =>
        station.station_id.toString().includes(filterId)
      )
    : stations;
  if (isLoading) {
    return (
      <HeaderResponsive>
        <LoadingScreen></LoadingScreen>
      </HeaderResponsive>
    );
  }
  return (
    <HeaderResponsive>
      <div className="flex w-full">
        <main className="flex-1 mt-17 sm:p-6 lg:p-8 w-full max-w-full pt-16 transition-all duration-300 box-border">
          <div className="w-full max-w-full">
            <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-8">
                Stations
              </h1>
              {error && <p className="text-red-600 mb-4">{error}</p>}
              {(permissions?.stations.add || permissions?.stations.list) && (
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8 w-full max-w-full">
                  {permissions.stations.add && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleCreateStation}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex-1 sm:flex-none sm:w-40 text-sm sm:text-base flex items-center justify-center"
                        aria-label="Create new station"
                      >
                        <span className="mr-2">+</span> Create Station
                      </button>
                    </div>
                  )}
                  {permissions.stations.list && (
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
              {permissions?.stations.list && (
                <div className="overflow-x-auto w-full max-w-full">
                  <table className="w-full text-sm table-auto">
                    <thead>
                      <tr className="bg-gray-100 rounded-xl">
                        <th className="text-left p-2 sm:p-3 font-bold text-gray-800 min-w-[80px]">
                          ID
                        </th>
                        {(permissions.stations.edit ||
                          permissions.stations.delete) && (
                          <th className="text-left p-2 sm:p-3 font-bold text-gray-800 min-w-[100px]">
                            Action
                          </th>
                        )}
                        <th className="text-left p-2 sm:p-3 font-bold text-gray-800 min-w-[120px]">
                          Station ID
                        </th>
                        <th className="text-left p-2 sm:p-3 font-bold text-gray-800 min-w-[150px]">
                          Station Name
                        </th>
                        <th className="text-left p-2 sm:p-3 font-bold text-gray-800 min-w-[120px]">
                          Province
                        </th>
                        <th className="text-left p-2 sm:p-3 font-bold text-gray-800 min-w-[120px]">
                          Station Type
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStations.length === 0 ? (
                        <tr>
                          <td
                            colSpan={
                              permissions.stations.edit ||
                              permissions.stations.delete
                                ? 6
                                : 5
                            }
                            className="p-4 text-center text-gray-500"
                          >
                            No stations found.
                          </td>
                        </tr>
                      ) : (
                        filteredStations.map((station) => (
                          <tr
                            key={station.station_id}
                            className="border-b border-gray-200 hover:bg-gray-50"
                          >
                            <td className="p-2 sm:p-3 text-gray-700 min-w-0">
                              {station.id}
                            </td>
                            {(permissions.stations.edit ||
                              permissions.stations.delete) && (
                              <td className="p-2 sm:p-3 text-gray-700 flex gap-2 min-w-0">
                                {permissions.stations.edit && (
                                  <button
                                    onClick={() =>
                                      handleEditStation(station.station_id)
                                    }
                                    className="p-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                                    aria-label={`Edit station ${station.station_name}`}
                                  >
                                    <PencilIcon className="w-4 h-4" />
                                  </button>
                                )}
                                {permissions.stations.delete && (
                                  <button
                                    onClick={() =>
                                      handleDeleteStation(station.station_id)
                                    }
                                    className="p-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors"
                                    aria-label={`Delete station ${station.station_name}`}
                                  >
                                    <TrashIcon className="w-4 h-4" />
                                  </button>
                                )}
                              </td>
                            )}
                            <td className="p-2 sm:p-3 text-gray-700 min-w-0">
                              {station.station_id}
                            </td>
                            <td className="p-2 sm:p-3 text-gray-700 min-w-0">
                              {station.station_name}
                            </td>
                            <td className="p-2 sm:p-3 text-gray-700 min-w-0">
                              {station.province}
                            </td>
                            <td className="p-2 sm:p-3 text-gray-700 min-w-0">
                              {station.station_type}
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
          {/* Delete Confirmation Modal */}
          {permissions?.stations.delete && (
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
                            Are you sure you want to delete station ID{" "}
                            {deleteStationId}? This action cannot be undone.
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
          )}
        </main>
      </div>
    </HeaderResponsive>
  );
}

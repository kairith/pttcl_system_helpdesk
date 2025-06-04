"use client";
import React, { useState, useEffect } from "react";
import { Station } from "../../types/station";
import { fetchStations } from "./action";
import Header from "@/app/components/common/Header";

interface StationsProps {
  isSidebarOpen: boolean;
}

export default function Stations({ isSidebarOpen }: StationsProps) {
  const [stations, setStations] = useState<Station[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState("October");

  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value);
    // TODO: Update fetchStations to filter by period if needed
  };

  useEffect(() => {
    async function loadStations() {
      const { stations, error } = await fetchStations();
      setStations(stations);
      setError(error);
    }
    loadStations();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="flex">
          <main
            className={`flex-1 p-4 sm:p-6 lg:p-8 min-h-screen transition-all duration-300 ease-in-out ${
              isSidebarOpen ? "sm:ml-64" : "sm:ml-0"
            }`}
          >
            <div className="flex items-center justify-center h-full">
              <div className="bg-white p-6 rounded-lg shadow-md text-center max-w-md w-full">
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

  if (stations.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="flex">
          <main
            className={`flex-1 p-4 sm:p-6 lg:p-8 min-h-screen transition-all duration-300 ease-in-out ${
              isSidebarOpen ? "sm:ml-64" : "sm:ml-0"
            }`}
          >
            <div className="flex items-center justify-center h-full">
              <div className="bg-white p-6 rounded-lg shadow-md text-center max-w-md w-full">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="mt-4 text-lg font-semibold text-gray-600">No stations found.</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="flex">
        <main
          className={`flex-1 p-4 sm:p-6 lg:p-8 min-h-screen transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "sm:ml-64" : "sm:ml-0"
          }`}
        >
          <div className="container mx-auto max-w-7xl">
            <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                  Stations Table
                </h1>
                <select
                  value={selectedPeriod}
                  onChange={(e) => handlePeriodChange(e.target.value)}
                  className="w-full sm:w-48 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors duration-200"
                >
                  <option value="October">October</option>
                  <option value="November">November</option>
                  <option value="December">December</option>
                </select>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-200 text-gray-800 font-semibold rounded-t-lg">
                      <th className="text-left p-3 sm:p-4 first:rounded-tl-lg">ID</th>
                      <th className="text-left p-3 sm:p-4">Station ID</th>
                      <th className="text-left p-3 sm:p-4">Station Name</th>
                      <th className="text-left p-3 sm:p-4">Province</th>
                      <th className="text-left p-3 sm:p-4 last:rounded-tr-lg">Station Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stations.map((station, index) => (
                      <tr
                        key={station.id}
                        className={`border-b border-gray-200 hover:bg-blue-50 transition-colors duration-150 ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <td className="p-3 sm:p-4 text-gray-700">{station.id}</td>
                        <td className="p-3 sm:p-4 text-gray-700">{station.station_id}</td>
                        <td className="p-3 sm:p-4 text-gray-700">{station.station_name}</td>
                        <td className="p-3 sm:p-4 text-gray-700">{station.province}</td>
                        <td className="p-3 sm:p-4 text-gray-700">{station.station_type}</td>
                      </tr>
                    ))}
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
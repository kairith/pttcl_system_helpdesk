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
      setStations(stations || []);
      setError(error);
    }
    loadStations();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
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
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="flex">
        <main
          className={`flex-1 p-4 sm:p-6 lg:p-8 w-full transition-all duration-300 ${
            isSidebarOpen ? "sm:ml-64" : "sm:ml-0"
          }`}
        >
          <div className="container mx-auto">
            <div className="mt-19 sm:mt-6 p-4 sm:p-6 bg-white rounded-lg shadow-md">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-8 gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-0">
                  Stations
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
              {error && <p className="text-red-600 mb-4">{error}</p>}
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[600px]">
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
                    {stations.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-gray-500">
                          No stations found.
                        </td>
                      </tr>
                    ) : (
                      stations.map((station, index) => (
                        <tr
                          key={station.id}
                          className={`border-b border-gray-200 hover:bg-blue-50 transition-colors duration-150 ${
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
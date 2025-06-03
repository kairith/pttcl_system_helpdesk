'use client';

import { useState, useEffect } from 'react';
import { Station } from '../../types/station';
import NavSlide from '@/app/components/navbar/navbar';
import { fetchStations } from './action';

export default function Stations() {
  const [stations, setStations] = useState<Station[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('October');

  const handleSidebarToggle = (isOpen: boolean) => {
    setIsSidebarOpen(isOpen);
  };

  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value);
    // Optionally, add logic to filter stations based on selected period
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
      <div className="flex">
        <NavSlide onToggle={handleSidebarToggle} />
        <main
          className={`flex-1 p-4 min-h-screen transition-all duration-300 ease-in-out ${
            isSidebarOpen ? 'md:ml-64' : 'md:ml-16'
          }`}
        >
          <div
            className={`transition-opacity duration-300 ease-in-out ${
              isSidebarOpen ? 'opacity-100' : 'opacity-70'
            }`}
          >
            <div className="text-red-500 text-center">{error}</div>
          </div>
        </main>
      </div>
    );
  }

  if (stations.length === 0) {
    return (
      <div className="flex">
        <NavSlide onToggle={handleSidebarToggle} />
        <main
          className={`flex-1 p-4 min-h-screen transition-all duration-300 ease-in-out ${
            isSidebarOpen ? 'md:ml-64' : 'md:ml-16'
          }`}
        >
          <div
            className={`transition-opacity duration-300 ease-in-out ${
              isSidebarOpen ? 'opacity-100' : 'opacity-70'
            }`}
          >
            <div className="text-center">No stations found.</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex">
      <NavSlide onToggle={handleSidebarToggle} />
      <main
        className={`flex-1 p-4 min-h-screen transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'md:ml-64' : 'md:ml-16'
        }`}
      >
        <div
          className={`transition-opacity duration-300 ease-in-out ${
            isSidebarOpen ? 'opacity-100' : 'opacity-70'
          }`}
        >
          <div className="container mx-auto">
            <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Stations Table</h1>
                <select
                  value={selectedPeriod}
                  onChange={(e) => handlePeriodChange(e.target.value)}
                  className="bg-gray-50 border border-gray-300 rounded px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="October">October</option>
                  <option value="November">November</option>
                  <option value="December">December</option>
                </select>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100 rounded-xl">
                      <th className="text-left p-3 font-bold text-gray-800">ID</th>
                      <th className="text-left p-3 font-bold text-gray-800">Station ID</th>
                      <th className="text-left p-3 font-bold text-gray-800">Station Name</th>
                      <th className="text-left p-3 font-bold text-gray-800">Province</th>
                      <th className="text-left p-3 font-bold text-gray-800">Station Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stations.map((station) => (
                      <tr key={station.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="p-3 text-gray-700">{station.id}</td>
                        <td className="p-3 text-gray-700">{station.station_id}</td>
                        <td className="p-3 text-gray-700">{station.station_name}</td>
                        <td className="p-3 text-gray-700">{station.province}</td>
                        <td className="p-3 text-gray-700">{station.station_type}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
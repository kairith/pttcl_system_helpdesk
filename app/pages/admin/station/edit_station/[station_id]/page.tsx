
// app/pages/admin/station/edit_station/[station_id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import HeaderWithSidebar from "@/app/components/common/Header/Headerwithsidebar";

export default function EditStation() {
  const [station, setStation] = useState<{
    
    station_id: string;
    station_name: string;
    station_type: string;
    province: string;
  } | null>(null);
  const [stationTypes, setStationTypes] = useState<string[]>([]);
  const [provinces, setProvinces] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { station_id } = useParams();
  const router = useRouter();

  useEffect(() => {
    async function loadStation() {
      const token = sessionStorage.getItem("token");
      if (!token) {
        setError("Please log in as an admin.");
        router.push("/");
        return;
      }
      try {
        console.log(`Fetching data for station_id=${station_id}`);
        const response = await fetch(`/api/data/edit_station/${station_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          const errorData = await response.json();
          console.log(`Fetch failed for station_id=${station_id}:`, errorData);
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(`Fetch success for station_id=${station_id}:`, data);
        setStation({
          station_id: data.station.station_id,
          station_name: data.station.station_name,
          station_type: data.station.station_type,
          province: data.station.province,
        });
        setStationTypes(data.stationTypes || []);
        setProvinces(data.provinces || []);
      } catch (err) {
        console.error(`Fetch error for station_id=${station_id}:`, err);
        setError(
          err && typeof err === "object" && "message" in err
            ? String((err as { message?: unknown }).message)
            : "Failed to load station"
        );
      }
    }
    loadStation();
  }, [station_id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!station) {
      setError("No station data loaded");
      return;
    }
    if (!station.station_name.trim() || !station.station_type.trim() || !station.province.trim()) {
      setError("All fields are required");
      return;
    }
    const token = sessionStorage.getItem("token");
    if (!token) {
      setError("Please log in as an admin.");
      router.push("/");
      return;
    }
    try {
      console.log(`Submitting update for station_id=${station_id}:`, station);
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
        console.log(`Update failed for station_id=${station_id}:`, data);
        throw new Error(data.error || "Failed to update station");
      }
      console.log(`Update success for station_id=${station_id}`);
      router.push("/pages/admin/station");
    } catch (err) {
      console.error(`Update error for station_id=${station_id}:`, err);
      setError(
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: unknown }).message)
          : "Failed to update station"
      );
    }
  };

  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;
  if (!station) return <div className="text-center p-4">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderWithSidebar />
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Edit Station</h1>
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="station_id" className="block text-sm font-medium text-gray-700">
                Station ID
              </label>
              <input
                id="station_id"
                type="text"
                value={station.station_id}
                disabled
                className="w-full p-2 bg-gray-200 border-0 rounded-md text-gray-500"
                aria-label="Station ID"
              />
            </div>
            <div>
              <label htmlFor="station_name" className="block text-sm font-medium text-gray-700">
                Station Name
              </label>
              <input
                id="station_name"
                type="text"
                value={station.station_name}
                onChange={(e) => setStation({ ...station, station_name: e.target.value })}
                className="w-full p-2 bg-gray-100 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter Station Name"
                aria-label="Station Name"
                required
              />
            </div>
            <div>
              <label htmlFor="station_type" className="block text-sm font-medium text-gray-700">
                Station Type
              </label>
              <select
                id="station_type"
                value={station.station_type}
                onChange={(e) => setStation({ ...station, station_type: e.target.value })}
                className="w-full p-2 bg-gray-100 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <div>
              <label htmlFor="province" className="block text-sm font-medium text-gray-700">
                Province
              </label>
              <select
                id="province"
                value={station.province}
                onChange={(e) => setStation({ ...station, province: e.target.value })}
                className="w-full p-2 bg-gray-100 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <div className="flex space-x-4">
              <button
                type="submit"
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => router.push("/pages/admin/station")}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

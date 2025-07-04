"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/frontend/components/common/Header/Headerwithsidebar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AddStation() {
  const [formData, setFormData] = useState({
    station_id: "",
    station_name: "",
    station_type: "",
    province: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

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
      router.push("/pages/Users/station");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-100">
      <Header />
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
        <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-6 sm:p-8 ">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
            Add Station
          </h1>
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="station_id"
                  className="block text-sm font-medium text-gray-700"
                >
                  Station ID
                </label>
                <input
                  id="station_id"
                  type="text"
                  name="station_id"
                  value={formData.station_id}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-100 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="EX F001"
                  aria-label="Stadion ID"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="station_name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Station Name
                </label>
                <input
                  id="station_name"
                  type="text"
                  name="station_name"
                  value={formData.station_name}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-100 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="..."
                  aria-label="Stetion Nerne"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="province"
                  className="block text-sm font-medium text-gray-700"
                >
                  Province
                </label>
                <input
                  id="province"
                  type="text"
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-100 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="..."
                  aria-label="Proaince"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="station_type"
                  className="block text-sm font-medium text-gray-700"
                >
                  Type
                </label>
                <select
                  id="station_type"
                  name="station_type"
                  value={formData.station_type}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-100 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select type...</option>
                  <option value="COCO">COCO</option>
                  <option value="DODO">DODO</option>
                </select>
              </div>
            </div>
            <div className="text-center mt-6">
              <button
                type="submit"
                className="w-40 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 text-sm sm:text-base"
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Create Station"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

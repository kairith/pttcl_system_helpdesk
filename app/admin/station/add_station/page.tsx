'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/common/Header/Header';

export default function AddStation() {
  const [formData, setFormData] = useState({
    station_id: '',
    station_name: '',
    station_type: '',
    province: '',
  });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = sessionStorage.getItem('token');
    if (!token) {
      alert('Please log in to add a station.');
      router.push('/');
      return;
    }

    try {
      const response = await fetch('/api/data/add_station', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add station');
      }

      alert('Station added successfully!');
      router.push('/admin/station'); // Redirect to a station list page (adjust as needed)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
        <div className="bg-blue-50 p-6 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Add Station</h1>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Station ID</label>
              <input
                type="text"
                name="station_id"
                value={formData.station_id}
                onChange={handleChange}
                className="w-full p-2 bg-gray-100 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter Station ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Station Name</label>
              <input
                type="text"
                name="station_name"
                value={formData.station_name}
                onChange={handleChange}
                className="w-full p-2 bg-gray-100 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter Station Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Station Type</label>
              <input
                type="text"
                name="station_type"
                value={formData.station_type}
                onChange={handleChange}
                className="w-full p-2 bg-gray-100 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter Station Type"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Province</label>
              <input
                type="text"
                name="province"
                value={formData.province}
                onChange={handleChange}
                className="w-full p-2 bg-gray-100 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter Province"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 text-sm sm:text-base"
            >
              Create Station
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
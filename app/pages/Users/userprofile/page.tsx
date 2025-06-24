
"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";

interface User {
  users_id: number;
  users_name: string;
  email: string;
  company?: string | null;
  user_image?: string | null;
}

interface Ticket {
  ticket_id: number;
  station_name: string;
  station_type: string;
  issue_description: string;
  status: string;
  users_id: number;
}

export default function UserProfilePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const users_id = searchParams.get("users_id");
  const [user, setUser] = useState<User | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]); // Initialize as empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = typeof window !== "undefined" ? sessionStorage.getItem("token") : null;
  const backgroundImage = "/images/background.png"; // Corrected path

  useEffect(() => {
    const fetchData = async () => {
      if (!users_id) {
        setError("User ID not provided");
        toast.error("User ID not provided. Please provide a valid user ID.");
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`/api/data/userprofile/${users_id}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch user profile");
        }
        const data = await response.json();
        console.log("Fetched tickets for user_id", users_id, ": ", data.tickets); // Debug log
        setUser(data.user || null); // Safeguard for user
        setTickets(data.tickets || []); // Default to empty array if undefined
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [users_id, token]);

  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-4" style={{ backgroundImage: `url(${backgroundImage})` }}>
        <Toaster position="top-right" />
        <div className="max-w-md mx-auto bg-white bg-opacity-90 rounded-lg shadow-lg p-6 text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Error</h1>
          <p className="mb-4">{error}</p>
          <Link href="/" className="text-blue-600 hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }
  if (!user) return <div className="text-center p-4">User not found</div>;

return (
  <div className="min-h-screen bg-gray-100">
    <Toaster position="top-right" />

    {/* Background Header (Cover Photo) */}
    <div className="relative w-full h-100   ">
      <img
        src="/images/background.png" // Replace with the cover photo URL
        alt="Cover Photo"
        className="w-full h-full object-cover"
      />
    
    </div>

    {/* Profile Section */}
    <div className="relative -mt-16 z-10 bg-white max-w-4xl mx-auto rounded-xl p-6 shadow-xl">
      {/* Profile Picture and Info */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        {/* Avatar */}
        <div className="w-40 h-40 relative -mt-16">
          <img
            src={user.user_image || "/Uploads/user_image/Default-avatar.jpg"}
            alt={`Profile of ${user.users_name}`}
            className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg"
          />
        </div>

        {/* Info and Actions */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl font-bold text-gray-800">{user.users_name}</h2>
           
            <a
              href={`/pages/Users/edit_user_profile?users_id=${user.users_id}`}
              className="p-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition"
            >
              ✏️ Edit Profile
            </a>
          </div>
          
          {user.email && <p className="text-gray-500">{user.email}</p>}
          {user.company && <p className="text-gray-500">{user.company}</p>}
        </div>
      </div>

      {/* Ticket Table */}
      <div className="mt-10">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">User Ticket</h3>
        {tickets.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full text-sm text-gray-700">
              <thead className="bg-gray-100 text-gray-600 text-left">
                <tr>
                  <th className="px-4 py-3">No</th>
                  <th className="px-4 py-3">Ticket ID</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Station ID</th>
                  <th className="px-4 py-3">Station Type</th>
                  <th className="px-4 py-3">Issue Description</th>
                  <th className="px-4 py-3">Issue Type</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket, index) => (
                  <tr key={ticket.ticket_id} className="border-t bg-white hover:bg-gray-50 transition">
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2">{ticket.ticket_id}</td>
                    <td className="px-4 py-2">{ticket.status}</td>
                    <td className="px-4 py-2">{ticket.station_name}</td>
                    <td className="px-4 py-2">{ticket.station_type}</td>
                    <td className="px-4 py-2">{ticket.issue_description}</td>
                    <td className="px-4 py-2">
                      {ticket.issue_description.toLowerCase().includes("software")
                        ? "Software"
                        : "Hardware"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No tickets assigned.</p>
        )}
      </div>
    </div>
  </div>
);


}

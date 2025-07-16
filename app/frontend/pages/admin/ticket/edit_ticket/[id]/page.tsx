"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Ticket } from "@/app/backend/types/ticket";
import HeaderResponsive from "@/app/frontend/components/common/Header/headerResponsive";
import { Toaster, toast } from "react-hot-toast";

export default function EditTicketPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [formData, setFormData] = useState({
    station_id: "",
    station_name: "",
    users_name: "",
    issue_type: "",
    issue_description: "",
    comment: "",
    status: "",
  });
  const [availableUsers, setAvailableUsers] = useState<{ id: string; name: string }[]>([]);
  const [availableIssueTypes, setAvailableIssueTypes] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  useEffect(() => {
    const fetchTicket = async () => {
      setLoading(true);
      setError(null);
      const token = sessionStorage.getItem("token");
      if (!token) {
        setError("No authentication token found. Please log in.");
        toast.error("No authentication token found. Please log in.");
        setLoading(false);
        setTimeout(() => router.push("/"), 2000);
        return;
      }
      try {
        const response = await fetch(`/api/data/tickets/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch ticket");
        }
        const data = await response.json();
        setTicket(data.ticket);
        setFormData({
          station_id: data.ticket.station_id || "",
          station_name: data.ticket.station_name || "",
          users_name: data.ticket.users_name || "",
          issue_type: data.ticket.issue_type || "",
          issue_description: data.ticket.issue_description || "",
          comment: data.ticket.comment || "",
          status: data.ticket.status || "",
        });
        setAvailableUsers(data.availableUsers || []);
        setAvailableIssueTypes(data.availableIssueTypes || []);
      } catch (err: any) {
        const errorMsg = err.message || "Unknown error";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const token = sessionStorage.getItem("token");
    if (!token) {
      setError("No authentication token found. Please log in.");
      toast.error("No authentication token found. Please log in.");
      setLoading(false);
      setTimeout(() => router.push("/"), 2000);
      return;
    }
    try {
      const response = await fetch(`/api/data/tickets/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update ticket");
      }
      toast.success("Ticket updated successfully!", {
        duration: 2000,
        position: "top-right",
      });
      setTimeout(() => router.push("/pages/admin/ticket"), 2000);
    } catch (err: any) {
      const errorMsg = err.message || "Unknown error";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <HeaderResponsive>
        <div className="flex w-full">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-full pt-16 transition-all duration-300 box-border">
            <Toaster position="top-right" />
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-3">
                <svg
                  className="animate-spin h-8 w-8 text-blue-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                  />
                </svg>
                <span className="text-lg font-medium text-gray-600">Loading ticket data...</span>
              </div>
            </div>
          </main>
        </div>
      </HeaderResponsive>
    );
  }

  if (error) {
    return (
     <HeaderResponsive>
        <div className="flex w-full">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-full pt-16 transition-all duration-300 box-border">
            <Toaster position="top-right" />
            <div className="flex items-center justify-center py-8">
              <div className="bg-white p-6 rounded-lg shadow-md text-center max-w-md w-full border border-gray-200">
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
      </HeaderResponsive>
    );
  }

  if (!ticket) return null;

  return (
    <HeaderResponsive>
      <div className="flex w-full">
        <main className="flex-1 mt-17 sm:p-6 lg:p-8 w-full max-w-full pt-16 transition-all duration-300 box-border">
          <Toaster position="top-right" />
          <div className="flex justify-center items-center min-h-[calc(100vh-128px)]">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md w-full max-w-md sm:max-w-full border border-gray-200">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">
                Edit Ticket
              </h1>
              <p className="text-sm text-gray-500 mb-4 sm:mb-6 text-center">
                Ticket ID: {ticket.ticket_id}
              </p>
              {error && (
                <div className="mb-4 p-3 rounded text-sm sm:text-base bg-red-100 text-red-800 w-full max-w-full">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-full min-w-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Station ID
                    </label>
                    <input
                      type="text"
                      name="station_id"
                      value={formData.station_id}
                      onChange={handleChange}
                      className="w-full max-w-full min-w-0 p-2 border border-gray-300 rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Station ID"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Station Name
                    </label>
                    <input
                      type="text"
                      name="station_name"
                      value={formData.station_name}
                      onChange={handleChange}
                      className="w-full max-w-full min-w-0 p-2 border border-gray-300 rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Station Name"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assign
                    </label>
                    <select
                      name="users_name"
                      value={formData.users_name}
                      onChange={handleChange}
                      className="w-full max-w-full min-w-0 p-2 border border-gray-300 rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Assign User"
                    >
                      <option value="">Select User</option>
                      {availableUsers.map((user) => (
                        <option key={user.id} value={user.name}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Issue Type
                    </label>
                    <select
                      name="issue_type"
                      value={formData.issue_type}
                      onChange={handleChange}
                      className="w-full max-w-full min-w-0 p-2 border border-gray-300 rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Issue Type"
                    >
                      <option value="">Select Issue Type</option>
                      {availableIssueTypes.map((type) => (
                        <option key={type.id} value={type.name}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full max-w-full min-w-0 p-2 border border-gray-300 rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Status"
                    >
                      <option value="">Select Status</option>
                      <option value="open">Open</option>
                      <option value="in progress">In Progress</option>
                      <option value="close">Close</option>
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Issue Description
                    </label>
                    <textarea
                      name="issue_description"
                      value={formData.issue_description}
                      onChange={handleChange}
                      disabled
                      className="w-full max-w-full min-w-0 p-2 border border-gray-300 rounded-md text-sm sm:text-base bg-gray-100 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Issue Description"
                      aria-disabled="true"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Comment
                    </label>
                    <input
                      type="text"
                      name="comment"
                      value={formData.comment}
                      onChange={handleChange}
                      className="w-full max-w-full min-w-0 p-2 border border-gray-300 rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Comment"
                    />
                  </div>
                </div>
                <div className="flex justify-center space-x-4 mt-4 sm:mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-40 max-w-full min-w-0 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300 text-sm sm:text-base font-medium"
                    aria-label={loading ? "Updating Ticket" : "Update Ticket"}
                  >
                    {loading ? "Updating..." : "Update Ticket"}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push("/pages/admin/ticket")}
                    className="w-full sm:w-40 max-w-full min-w-0 bg-gray-400 text-white px-6 py-2 rounded-md hover:bg-gray-500 text-sm sm:text-base font-medium"
                    aria-label="Cancel"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
   </HeaderResponsive>
  );
}

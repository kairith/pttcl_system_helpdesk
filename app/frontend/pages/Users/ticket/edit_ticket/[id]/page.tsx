
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Toaster, toast } from "react-hot-toast";
import { Ticket } from "@/app/backend/types/ticket";
import LoadingSpinner from "@/app/frontend/components/ui/loading";
import HeaderWithSidebar from "@/app/frontend/components/common/Header/Headerwithsidebar";

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
        toast.error("No authentication token found. Please log in.", {
          duration: 2000,
          position: "top-right",
        });
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
        console.log("EditTicketPage: Fetched ticket:", data);
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
        toast.error(errorMsg, { duration: 2000, position: "top-right" });
      } finally {
        setLoading(false);
        console.log("EditTicketPage: loading set to false after ticket fetch");
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
    console.log("EditTicketPage: Form submitted with data:", formData);

    const token = sessionStorage.getItem("token");
    if (!token) {
      setError("No authentication token found. Please log in.");
      toast.error("No authentication token found. Please log in.", {
        duration: 2000,
        position: "top-right",
      });
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
      setTimeout(() => router.push("/pages/Users/ticket"), 2000);
    } catch (err: any) {
      const errorMsg = err.message || "Unknown error";
      setError(errorMsg);
      toast.error(errorMsg, { duration: 2000, position: "top-right" });
      console.error("EditTicketPage: Submission error:", errorMsg);
    } finally {
      setLoading(false);
      console.log("EditTicketPage: loading set to false after submission");
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen bg-gray-50 ${isSidebarOpen ? "sm:ml-64" : ""} transition-all duration-300`}>
        <HeaderWithSidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="flex w-full">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-full pt-16 transition-all duration-300">
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
      </div>
    );
  }
  if (error) {
    return (
      <div className={`min-h-screen bg-gray-50 ${isSidebarOpen ? "sm:ml-64" : ""} transition-all duration-300`}>
        <HeaderWithSidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <Toaster position="top-right" />
        <div className="flex w-full">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-full pt-16 transition-all duration-300">
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
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div className={`min-h-screen bg-gray-50 ${isSidebarOpen ? "sm:ml-64" : ""} transition-all duration-300`}>
      <HeaderWithSidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <Toaster position="top-right" />
      <div className="flex w-full">
        <main className="flex-1 mt-12 sm:p-6 lg:p-8 w-full max-w-full pt-16 transition-all duration-300">
          <div className="flex justify-center items-center min-h-[calc(100vh-128px)]">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md w-full max-w-md sm:max-w-2xl border border-gray-200">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 text-center">
                Edit Ticket
              </h1>
              <p className="text-sm text-gray-500 mb-6 text-center">Ticket ID: {ticket.ticket_id}</p>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label htmlFor="station_id" className="block text-gray-600 font-medium text-sm mb-1">
                      Station ID
                    </label>
                    <input
                      type="text"
                      id="station_id"
                      name="station_id"
                      value={formData.station_id}
                      onChange={handleChange}
                      disabled
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-sm focus:ring-blue-500 focus:border-blue-500"
                      aria-label="Station ID"
                      aria-describedby={error ? "error-message" : undefined}
                    />
                  </div>
                  <div>
                    <label htmlFor="station_name" className="block text-gray-600 font-medium text-sm mb-1">
                      Station Name
                    </label>
                    <input
                      type="text"
                      id="station_name"
                      name="station_name"
                      value={formData.station_name}
                      onChange={handleChange}
                      disabled
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-sm focus:ring-blue-500 focus:border-blue-500"
                      aria-label="Station Name"
                      aria-describedby={error ? "error-message" : undefined}
                    />
                  </div>
                  <div>
                    <label htmlFor="users_name" className="block text-gray-600 font-medium text-sm mb-1">
                      Assign
                    </label>
                    <select
                      id="users_name"
                      name="users_name"
                      value={formData.users_name}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-sm focus:ring-blue-500 focus:border-blue-500"
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
                  <div>
                    <label htmlFor="issue_type" className="block text-gray-600 font-medium text-sm mb-1">
                      Issue Type
                    </label>
                    <select
                      id="issue_type"
                      name="issue_type"
                      value={formData.issue_type}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-sm focus:ring-blue-500 focus:border-blue-500"
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
                  <div>
                    <label htmlFor="status" className="block text-gray-600 font-medium text-sm mb-1">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-sm focus:ring-blue-500 focus:border-blue-500"
                      aria-label="Status"
                    >
                      <option value="">Select Status</option>
                      <option value="open">Open</option>
                      <option value="in progress">In Progress</option>
                      <option value="close">Close</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="issue_description" className="block text-gray-600 font-medium text-sm mb-1">
                      Issue Description
                    </label>
                    <textarea
                      id="issue_description"
                      name="issue_description"
                      value={formData.issue_description}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-sm h-28 resize-none focus:ring-blue-500 focus:border-blue-500"
                      aria-label="Issue Description"
                    />
                  </div>
                  <div>
                    <label htmlFor="comment" className="block text-gray-600 font-medium text-sm mb-1">
                      Comment
                    </label>
                    <input
                      type="text"
                      id="comment"
                      name="comment"
                      value={formData.comment}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-sm focus:ring-blue-500 focus:border-blue-500"
                      aria-label="Comment"
                      aria-describedby={error ? "error-message" : undefined}
                    />
                  </div>
                </div>
                <div className="flex gap-4 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      console.log("EditTicketPage: Cancel button clicked");
                      router.push("/pages/Users/ticket");
                    }}
                    className="w-full sm:w-32 max-w-full min-w-0 px-4 sm:px-6 py-2 text-sm sm:text-base font-medium text-white bg-gray-400 rounded-md hover:bg-gray-500 disabled:bg-gray-300 focus:ring-4 focus:ring-gray-200 pointer-events-auto"
                    disabled={loading}
                    aria-label="Cancel edit"
                     >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-32 max-w-full min-w-0 px-4 sm:px-6 py-2 text-sm sm:text-base font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300 focus:ring-4 focus:ring-blue-200 pointer-events-auto"
                    disabled={loading}
                    onClick={() => console.log("EditTicketPage: Update Ticket button clicked")}
                    aria-label={loading ? "Updating Ticket" : "Update Ticket"}
                    >
                    {loading ? "Updating..." : "Update Ticket"}
                  </button>
                </div>
                {error && (
                  <p id="error-message" className="text-red-500 text-sm mt-2">
                    {error}
                  </p>
                )}
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

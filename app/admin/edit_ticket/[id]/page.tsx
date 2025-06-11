"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Ticket } from "@/app/types/ticket"; // Adjust path as needed

export default function EditTicketPage() {
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

  useEffect(() => {
    const fetchTicket = async () => {
      setLoading(true);
      setError(null);
      const token = sessionStorage.getItem("token");
      if (!token) {
        setError("No authentication token found. Please log in.");
        setLoading(false);
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
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = sessionStorage.getItem("token");
    if (!token) {
      setError("No authentication token found. Please log in.");
      setLoading(false);
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
      router.push("/admin/track");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (error) return <div className="text-center p-4 text-red-500">{error}</div>;
  if (!ticket) return null;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-2xl">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Update Ticket</h2>
        <p className="text-sm text-gray-600 mb-4">Ticket ID: {ticket.ticket_id}</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Station ID</label>
              <input
                type="text"
                name="station_id"
                value={formData.station_id}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-50 rounded-md border border-gray-300 mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Station Name</label>
              <input
                type="text"
                name="station_name"
                value={formData.station_name}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-50 rounded-md border border-gray-300 mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Assign</label>
              <select
                name="users_name"
                value={formData.users_name}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-50 rounded-md border border-gray-300 mt-1"
              >
                <option value="">Select User</option>
                {availableUsers.map((user) => (
                  <option key={user.id} value={user.name}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Issue Type</label>
            <select
              name="issue_type"
              value={formData.issue_type}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-50 rounded-md border border-gray-300 mt-1"
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
            <label className="block text-sm font-medium text-gray-700">Issue Description</label>
            <textarea
              name="issue_description"
              value={formData.issue_description}
              onChange={handleChange}
              disabled
              className="w-full px-3 py-2 bg-gray-50 rounded-md border border-gray-300 mt-1 h-24"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Comment</label>
            <input
              type="text"
              name="comment"
              value={formData.comment}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-50 rounded-md border border-gray-300 mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-50 rounded-md border border-gray-300 mt-1"
            >
              <option value="">Select Status</option>
              <option value="open">Open</option>
              <option value="in progress">In Progress</option>
              <option value="close">Close</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300 transition-colors mt-4"
          >
            {loading ? "Updating..." : "Update Ticket"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/ticket")}
            className="w-full py-2 mt-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            Cancel
          </button>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </form>
      </div>
    </div>
  );
}
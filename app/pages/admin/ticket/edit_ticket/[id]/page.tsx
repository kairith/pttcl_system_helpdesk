"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Ticket } from "@/app/types/ticket";
import LoadingSpinner from "@/app/components/ui/loading";

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
        router.push("/");
        return <LoadingSpinner/>;
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
      router.push("/");
      return <LoadingSpinner/>;
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
      router.push("/pages/admin/ticket");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner/>;
  if (error) return <div className="text-center p-4 text-red-500">{error}</div>;
  if (!ticket) return null;

  return (
    <div className="min-h-screen bg-[#F4F6FA] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Edit Ticket</h1>
        <p className="text-sm text-gray-500 mb-6">Ticket ID: {ticket.ticket_id}</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-gray-600 font-medium text-sm mb-1">Station ID</label>
              <input
                type="text"
                name="station_id"
                value={formData.station_id}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-sm"
              />
            </div>
            <div>
              <label className="block text-gray-600 font-medium text-sm mb-1">Station Name</label>
              <input
                type="text"
                name="station_name"
                value={formData.station_name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-sm"
              />
            </div>
            <div>
              <label className="block text-gray-600 font-medium text-sm mb-1">Assign</label>
              <select
                name="users_name"
                value={formData.users_name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-sm"
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-600 font-medium text-sm mb-1">Issue Type</label>
              <select
                name="issue_type"
                value={formData.issue_type}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-sm"
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
              <label className="block text-gray-600 font-medium text-sm mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-sm"
              >
                <option value="">Select Status</option>
                <option value="open">Open</option>
                <option value="in progress">In Progress</option>
                <option value="close">Close</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-600 font-medium text-sm mb-1">Issue Description</label>
            <textarea
              name="issue_description"
              value={formData.issue_description}
              onChange={handleChange}
              disabled
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-sm h-28 resize-none"
            />
          </div>

          <div>
            <label className="block text-gray-600 font-medium text-sm mb-1">Comment</label>
            <input
              type="text"
              name="comment"
              value={formData.comment}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-sm"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              {loading ? "Updating..." : "Update Ticket"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/pages/admin/ticket")}
              className="w-full bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
          </div>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </form>
      </div>
    </div>
  );
}

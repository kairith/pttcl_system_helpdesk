"use client";
import Header from "@/app/frontend/components/common/Header/Headerwithsidebar";

import LoadingSpinner from "@/app/frontend/components/ui/loading";
import { useState } from "react";

// Assuming Ticket type based on usage
interface Ticket {
  ticket_id: string;
  station_id: string | null;
  station_name: string | null;
  station_type: string | null;
  province: string | null;
  issue_description: string | null;
  issue_type: string | null;
  issue_type_id: string | null;
  comment: string | null;
  users_name: string | null;
  status: string | null;
  users_id: string | null;
  ticket_open: string | null;
  ticket_on_hold: string | null;
  ticket_in_progress: string | null;
  ticket_pending_vendor: string | null;
  ticket_close: string | null;
  ticket_time: string | null;
  user_create_ticket: string | null;
}

export default function TrackTicketPage() {
  const [ticketId, setTicketId] = useState<string>("");
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketId) {
      setError("Please enter a ticket ID");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/data/tracks/${encodeURIComponent(ticketId)}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }
      const data = await response.json();
      if (data.ticket) {
        setTicket(data.ticket);
      } else {
        setError("Ticket not found");
        setTicket(null);
      }
    } catch (err: any) {
      setError(err.message || "Error fetching ticket");
      setTicket(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <main className="pt-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto py-6">
          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Track Ticket</h1>
            <form
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4"
            >
              <input
                type="text"
                placeholder="Enter Ticket ID"
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
                className="w-full sm:w-auto px-4 py-2 bg-gray-50 rounded-full outline-none text-gray-600 border border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
              >
                {loading ? "Searching..." : "Search"}
              
              </button>
            </form>
            {error && <p className="mt-2 text-red-500 text-sm">{error}</p>}
          </div>

          {ticket && (
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Ticket Details:{" "}
                <span className="text-blue-600">{ticket.ticket_id}</span>
              </h2>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Ticket ID
                    </label>
                    <p className="text-gray-800 break-words">{ticket.ticket_id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Station ID
                    </label>
                    <p className="text-gray-800 break-words">{ticket.station_id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Station Name
                    </label>
                    <p className="text-gray-800 break-words">
                      {ticket.station_name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Station Type
                    </label>
                    <p className="text-gray-800 break-words">
                      {ticket.station_type || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Province
                    </label>
                    <p className="text-gray-800 break-words">
                      {ticket.province || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Issue Description
                    </label>
                    <p className="text-gray-800 break-words">
                      {ticket.issue_description || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Issue Type
                    </label>
                    <p className="text-gray-800 break-words">
                      {ticket.issue_type || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Issue Type ID
                    </label>
                    <p className="text-gray-800 break-words">
                      {ticket.issue_type_id || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Status
                    </label>
                    <p className="text-gray-800 break-words">
                      {ticket.status || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Assign to
                    </label>
                    <p className="text-gray-800 break-words">{ticket.users_name || 'Not Assigned'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Ticket Open
                    </label>
                    <p className="text-gray-800 break-words">
                      {ticket.ticket_open || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Comment
                    </label>
                    <p className="text-gray-800 break-words">
                      {ticket.comment || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Ticket On Hold
                    </label>
                    <p className="text-gray-800 break-words">
                      {ticket.ticket_on_hold || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Ticket In Progress
                    </label>
                    <p className="text-gray-800 break-words">
                      {ticket.ticket_in_progress || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Ticket Pending Vendor
                    </label>
                    <p className="text-gray-800 break-words">
                      {ticket.ticket_pending_vendor || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Ticket Close
                    </label>
                    <p className="text-gray-800 break-words">
                      {ticket.ticket_close || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Ticket Time
                    </label>
                    <p className="text-gray-800 break-words">
                      {ticket.ticket_time || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Created By User ID
                    </label>
                    <p className="text-gray-800 break-words">
                      {ticket.user_create_ticket || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
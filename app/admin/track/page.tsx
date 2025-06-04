// app/admin/track/page.tsx
'use client';
import Header from '@/app/components/common/Header';
import NavSlide from '@/app/components/navbar/navbar';
import { useState } from 'react';

interface Ticket {
  id: number;
  ticket_id: string;
  station_id: string;
  station_name: string;
  station_type: string;
  province: string;
  issue_description: string;
  issue_type: string;
  SLA_category: string;
  status: string;
  users_id: string;
  ticket_open: string | null;
  ticket_on_hold: string | null;
  ticket_in_progress: string | null;
  ticket_pending_vendor: string | null;
  ticket_close: string | null;
  ticket_time: string | null;
  comment: string | null;
  user_create_ticket: string;
  issue_type_id: number;
}

export default function TrackTicketPage() {
  const [ticketId, setTicketId] = useState<string>('');
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketId) {
      setError('Please enter a ticket ID');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/data/tracks/${encodeURIComponent(ticketId)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }
      const data = await response.json();
      if (data.ticket) {
        setTicket(data.ticket);
      } else {
        setError('Ticket not found');
        setTicket(null);
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching ticket');
      setTicket(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <main className="pt-16 max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Track Ticket</h1>
          <form onSubmit={handleSearch} className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Enter Ticket ID"
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value)}
              className="flex-1 px-4 py-2 bg-gray-50 rounded-full outline-none text-gray-600"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-blue-300"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
          {error && <p className="mt-2 text-red-500">{error}</p>}
        </div>

        {ticket && (
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Ticket Details : {ticket.ticket_id}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Ticket ID</label>
                  <p className="text-gray-800">{ticket.ticket_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Station ID</label>
                  <p className="text-gray-800">{ticket.station_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Station Name</label>
                  <p className="text-gray-800">{ticket.station_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Station Type</label>
                  <p className="text-gray-800">{ticket.station_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Province</label>
                  <p className="text-gray-800">{ticket.province}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Issue Description</label>
                  <p className="text-gray-800">{ticket.issue_description}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Issue Type</label>
                  <p className="text-gray-800">{ticket.issue_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Issue Type ID</label>
                  <p className="text-gray-800">{ticket.issue_type_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Comment</label>
                  <p className="text-gray-800">{ticket.comment || 'N/A'}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <p className="text-gray-800">{ticket.status}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">User ID</label>
                  <p className="text-gray-800">{ticket.users_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Ticket Open</label>
                  <p className="text-gray-800">{ticket.ticket_open || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Ticket On Hold</label>
                  <p className="text-gray-800">{ticket.ticket_on_hold || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Ticket In Progress</label>
                  <p className="text-gray-800">{ticket.ticket_in_progress || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Ticket Pending Vendor</label>
                  <p className="text-gray-800">{ticket.ticket_pending_vendor || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Ticket Close</label>
                  <p className="text-gray-800">{ticket.ticket_close || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Ticket Time</label>
                  <p className="text-gray-800">{ticket.ticket_time || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">User Create Ticket ID</label>
                  <p className="text-gray-800">{ticket.user_create_ticket}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
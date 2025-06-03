'use client';

import { useState, useEffect } from 'react';
import { Ticket } from '../../types/ticket';
import NavSlide from '@/app/components/navbar/navbar';
import { fetchTickets } from '../ticket/action';

export default function Tickets() {
  const [tickets, setTickets] = useState<(Ticket & { users_name: string; creator_name: string })[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSidebarToggle = (isOpen: boolean) => {
    setIsSidebarOpen(isOpen);
  };

  useEffect(() => {
    async function loadTickets() {
      const { tickets, error } = await fetchTickets();
      setTickets(tickets);
      setError(error);
    }
    loadTickets();
  }, []);

  if (error) {
    return (
      <div className="flex">
        <NavSlide onToggle={handleSidebarToggle} />
        <main
          className={`flex-1 p-4 min-h-screen transition-all duration-300 ease-in-out ${
            isSidebarOpen ? 'md:ml-64' : 'md:ml-16'
          }`}
        >
          <div
            className={`transition-opacity duration-300 ease-in-out ${
              isSidebarOpen ? 'opacity-100' : 'opacity-70'
            }`}
          >
            <div className="text-red-500 text-center">{error}</div>
          </div>
        </main>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="flex">
        <NavSlide onToggle={handleSidebarToggle} />
        <main
          className={`flex-1 p-4 min-h-screen transition-all duration-300 ease-in-out ${
            isSidebarOpen ? 'md:ml-64' : 'md:ml-16'
          }`}
        >
          <div
            className={`transition-opacity duration-300 ease-in-out ${
              isSidebarOpen ? 'opacity-100' : 'opacity-70'
            }`}
          >
            <div className="text-center">No tickets found.</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex">
      <NavSlide onToggle={handleSidebarToggle} />
      <main
        className={`flex-1 p-4 min-h-screen transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'md:ml-64' : 'md:ml-16'
        }`}
      >
        <div
          className={`transition-opacity duration-300 ease-in-out ${
            isSidebarOpen ? 'opacity-100' : 'opacity-70'
          }`}
        >
          <div className="container mx-auto">
            <h1 className="text-2xl font-bold mb-4">Tickets Table</h1>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 border-b">ID</th>
                    <th className="py-2 px-4 border-b">Ticket ID</th>
                    <th className="py-2 px-4 border-b">Station Name</th>
                    <th className="py-2 px-4 border-b">Station Type</th>
                    <th className="py-2 px-4 border-b">Province</th>
                    <th className="py-2 px-4 border-b">Issue Description</th>
                    <th className="py-2 px-4 border-b">Issue Type</th>
                    <th className="py-2 px-4 border-b">Status</th>
                    <th className="py-2 px-4 border-b">Assignee</th>
                    <th className="py-2 px-4 border-b">Opened</th>
                    <th className="py-2 px-4 border-b">On Hold</th>
                    <th className="py-2 px-4 border-b">In Progress</th>
                    <th className="py-2 px-4 border-b">Pending Vendor</th>
                    <th className="py-2 px-4 border-b">Closed</th>
                    <th className="py-2 px-4 border-b">Last Updated</th>
                    <th className="py-2 px-4 border-b">Comment</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b">{ticket.id}</td>
                      <td className="py-2 px-4 border-b">{ticket.ticket_id}</td>
                      <td className="py-2 px-4 border-b">{ticket.station_name || 'N/A'}</td>
                      <td className="py-2 px-4 border-b">{ticket.station_type}</td>
                      <td className="py-2 px-4 border-b">{ticket.province}</td>
                      <td className="py-2 px-4 border-b">{ticket.issue_description}</td>
                      <td className="py-2 px-4 border-b">{ticket.issue_type}</td>
                      <td className="py-2 px-4 border-b">{ticket.status ? 1 : 0}</td>
                      <td className="py-2 px-4 border-b">{ticket.users_name || 'N/A'}</td>
                      <td className="py-2 px-4 border-b">{new Date(ticket.ticket_open).toLocaleString()}</td>
                      <td className="py-2 px-4 border-b">{ticket.ticket_on_hold ? new Date(ticket.ticket_on_hold).toLocaleString() : 'N/A'}</td>
                      <td className="py-2 px-4 border-b">{ticket.ticket_in_progress ? new Date(ticket.ticket_in_progress).toLocaleString() : 'N/A'}</td>
                      <td className="py-2 px-4 border-b">{ticket.ticket_pending_vendor ? new Date(ticket.ticket_pending_vendor).toLocaleString() : 'N/A'}</td>
                      <td className="py-2 px-4 border-b">{ticket.ticket_close ? new Date(ticket.ticket_close).toLocaleString() : 'N/A'}</td>
                      <td className="py-2 px-4 border-b">{new Date(ticket.ticket_time).toLocaleString()}</td>
                      <td className="py-2 px-4 border-b">{ticket.comment || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
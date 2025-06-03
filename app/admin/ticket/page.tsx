'use client';

import { useState, useEffect } from 'react';
import { Ticket } from '../../types/ticket';
import NavSlide from '@/app/components/navbar/navbar';
import { fetchTickets } from '../ticket/action';

export default function Tickets() {
  const [tickets, setTickets] = useState<(Ticket & { users_name: string; creator_name: string })[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('October');

  const handleSidebarToggle = (isOpen: boolean) => {
    setIsSidebarOpen(isOpen);
  };

  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value);
    // Optionally, add logic to filter tickets based on selected period
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
            <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Tickets Table</h1>
                <select
                  value={selectedPeriod}
                  onChange={(e) => handlePeriodChange(e.target.value)}
                  className="bg-gray-50 border border-gray-300 rounded px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="October">October</option>
                  <option value="November">November</option>
                  <option value="December">December</option>
                </select>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100 rounded-xl">
                      <th className="text-left p-3 font-bold text-gray-800">ID</th>
                      <th className="text-left p-3 font-bold text-gray-800">Ticket ID</th>
                      <th className="text-left p-3 font-bold text-gray-800">Station Name</th>
                      <th className="text-left p-3 font-bold text-gray-800">Station Type</th>
                      <th className="table-cell p-3 font-bold text-gray-800">Province</th>
                      <th className="text-left p-3 font-bold text-gray-800">Issue Description</th>
                      <th className="text-left p-3 font-bold text-gray-800">Issue Type</th>
                      <th className="text-left p-3 font-bold text-gray-800">Status</th>
                      <th className="text-left p-3 font-bold text-gray-800">Assignee</th>
                      <th className="text-left p-3 font-bold text-gray-800">Opened</th>
                      <th className="text-left p-3 font-bold text-gray-800">On Hold</th>
                      <th className="text-left p-3 font-bold text-gray-800">In Progress</th>
                      <th className="text-left p-3 font-bold text-gray-800">Pending Vendor</th>
                      <th className="text-left p-3 font-bold text-gray-800">Closed</th>
                      <th className="text-left p-3 font-bold text-gray-800">Last Updated</th>
                      <th className="text-left p-3 font-bold text-gray-800">Comment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((ticket) => (
                      <tr key={ticket.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="p-3 text-gray-700">{ticket.id}</td>
                        <td className="p-3 text-gray-700">{ticket.ticket_id}</td>
                        <td className="p-3 text-gray-700">{ticket.station_name || 'N/A'}</td>
                        <td className="p-3 text-gray-700">{ticket.station_type}</td>
                        <td className="p-3 text-gray-700">{ticket.province}</td>
                        <td className="p-3 text-gray-700">{ticket.issue_description}</td>
                        <td className="p-3 text-gray-700">{ticket.issue_type}</td>
                        <td className="p-3 text-gray-700">{ticket.status}</td>
                        <td className="p-3 text-gray-700">{ticket.users_name || 'N/A'}</td>
                        <td className="p-3 text-gray-700">{new Date(ticket.ticket_open).toLocaleString()}</td>
                        <td className="p-3 text-gray-700">{ticket.ticket_on_hold ? new Date(ticket.ticket_on_hold).toLocaleString() : 'N/A'}</td>
                        <td className="p-3 text-gray-700">{ticket.ticket_in_progress ? new Date(ticket.ticket_in_progress).toLocaleString() : 'N/A'}</td>
                        <td className="p-3 text-gray-700">{ticket.ticket_pending_vendor ? new Date(ticket.ticket_pending_vendor).toLocaleString() : 'N/A'}</td>
                        <td className="p-3 text-gray-700">{ticket.ticket_close ? new Date(ticket.ticket_close).toLocaleString() : 'N/A'}</td>
                        <td className="p-3 text-gray-700">{new Date(ticket.ticket_time).toLocaleString()}</td>
                        <td className="p-3 text-gray-700">{ticket.comment || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
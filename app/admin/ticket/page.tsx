'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Ticket } from '../../types/ticket';
import { fetchTickets } from '../ticket/action';
import Header from '@/app/components/common/Header';

interface TicketsProps {
  isSidebarOpen: boolean;
}

export default function Tickets({ isSidebarOpen }: TicketsProps) {
  const [tickets, setTickets] = useState<(Ticket & { users_name: string; creator_name: string })[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<(Ticket & { users_name: string; creator_name: string })[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [ticketIdFilter, setTicketIdFilter] = useState('');
  const [showFilterInput, setShowFilterInput] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function loadTickets() {
      const { tickets, error } = await fetchTickets();
      setTickets(tickets || []);
      setFilteredTickets(tickets || []);
      setError(error);
    }
    loadTickets();
  }, []);

  const handleCreateTicket = () => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      alert('Please log in to create a ticket.');
      router.push('/');
      return;
    }
    router.push('/admin/ticket/add_ticket');
  };

  const handleFilterToggle = () => {
    setShowFilterInput((prev) => !prev);
    if (showFilterInput) {
      setTicketIdFilter(''); // Clear filter when hiding input
      setFilteredTickets(tickets);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTicketIdFilter(value);
    if (!value.trim()) {
      setFilteredTickets(tickets);
    } else {
      const filtered = tickets.filter((ticket) =>
        String(ticket.ticket_id || '')
          .toLowerCase()
          .includes(value.toLowerCase())
      );
      setFilteredTickets(filtered);
    }
  };

  const handleClearFilter = () => {
    setTicketIdFilter('');
    setShowFilterInput(false);
    setFilteredTickets(tickets);
  };

  const handleExport = async (format: 'xlsx' | 'pdf' | 'csv') => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      alert('Please log in to export tickets.');
      router.push('/');
      return;
    }

    setIsExporting(true);
    try {
      console.log('Exporting with format:', format); // Debug format
      const response = await fetch(`/api/data/export-ticket?format=${format}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Export failed: ${errorData.error || 'Unknown error'}`);
        return;
      }

      const blob = await response.blob();
      if (blob.size === 0) {
        alert('Export failed: Empty file received.');
        return;
      }

      // Map format to correct extension
      const extensionMap: Record<string, string> = {
        excel: 'xlsx',
        pdf: 'pdf',
        csv: 'csv',
      };
      const extension = extensionMap[format] || 'bin';

      // Prefer Content-Disposition filename from API
      let fileName = `tickets_export.${extension}`;
      const contentDisposition = response.headers.get('Content-Disposition');
      if (contentDisposition && contentDisposition.includes('filename=')) {
        const match = contentDisposition.match(/filename="([^"]+)"/);
        if (match && match[1]) {
          fileName = match[1];
        }
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setShowExportOptions(false);
    } catch (error) {
      alert('An error occurred during export. Please try again.');
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          <main
            className={`flex-1 p-4 sm:p-6 lg:p-8 w-full transition-all duration-300 ${
              isSidebarOpen ? 'sm:ml-64' : 'sm:ml-0'
            }`}
          >
            <div className="text-red-500 text-center text-sm sm:text-base">{error}</div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <main
          className={`flex-1 p-4 sm:p-6 lg:p-8 w-full transition-all duration-300 ${
            isSidebarOpen ? 'sm:ml-64' : 'sm:ml-0'
          }`}
        >
          <div className="container mx-auto">
            <div className="mt-19 sm:mt-6 p-4 sm:p-6 bg-white rounded-lg shadow-md">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-8">Tickets</h1>
              {error && <p className="text-red-600 mb-4">{error}</p>}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
                <button
                  onClick={handleCreateTicket}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex-1 sm:flex-none sm:w-40 text-sm sm:text-base disabled:opacity-50"
                  disabled={isExporting}
                >
                  <span className="mr-2">+</span> Create Ticket
                </button>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-1 sm:flex-none">
                  <button
                    onClick={handleFilterToggle}
                    className="bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 flex-1 sm:w-32 text-sm sm:text-base disabled:opacity-50"
                    disabled={isExporting}
                  >
                    <span className="mr-2">🔍</span> Filter
                  </button>
                  {showFilterInput && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={ticketIdFilter}
                        onChange={handleFilterChange}
                        placeholder="Enter Ticket ID"
                        className="w-full sm:w-40 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                        disabled={isExporting}
                      />
                      <button
                        onClick={handleClearFilter}
                        className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 text-sm sm:text-base disabled:opacity-50"
                        disabled={isExporting}
                      >
                        Reset filter
                      </button>
                    </div>
                  )}
                </div>
                <div className="relative flex items-center gap-3">
                  <button
                    onClick={() => setShowExportOptions((prev) => !prev)}
                    className="bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 flex-1 sm:flex-none sm:w-32 text-sm sm:text-base flex items-center justify-center disabled:opacity-50"
                    disabled={isExporting}
                  >
                    <span className="mr-2">📄</span> Export
                  </button>
                  {showExportOptions && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleExport('xlsx')}
                        className="bg-white border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-100 text-sm sm:text-base disabled:opacity-50"
                        disabled={isExporting}
                      >
                        Excel
                      </button>
                      <button
                        onClick={() => handleExport('pdf')}
                        className="bg-white border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-100 text-sm sm:text-base disabled:opacity-50"
                        disabled={isExporting}
                      >
                        PDF
                      </button>
                      <button
                        onClick={() => handleExport('csv')}
                        className="bg-white border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-100 text-sm sm:text-base disabled:opacity-50"
                        disabled={isExporting}
                      >
                        CSV
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[1200px]">
                  <thead>
                    <tr className="bg-gray-100 rounded-xl">
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">ID</th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Ticket ID</th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Station ID</th>
                      {/* <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Station Type</th> */}
                      {/* <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Province</th> */}
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Issue Description</th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Issue Type</th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Status</th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Assign</th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Opened</th>
                      {/* <th className="text-left p-2 sm:p-3 font-bold text-gray-800">On Hold</th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">In Progress</th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Pending Vendor</th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Closed</th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Last Updated</th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Comment</th> */}
                      {/* <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Issue Type ID</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.length === 0 ? (
                      <tr>
                        <td colSpan={17} className="p-4 text-center text-gray-500">
                          No tickets found.
                        </td>
                      </tr>
                    ) : (
                      filteredTickets.map((ticket) => (
                        <tr key={ticket.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="p-2 sm:p-3 text-gray-700">{ticket.id}</td>
                          <td className="p-2 sm:p-3 text-gray-700">{ticket.ticket_id}</td>
                          {/* <td className="p-2 sm:p-3 text-gray-700">{ticket.station_name || 'N/A'}</td> */}
                          <td className="p-2 sm:p-3 text-gray-700">{ticket.station_id}</td>
                          {/* <td className="p-2 sm:p-3 text-gray-700">{ticket.province}</td> */}
                          <td className="p-2 sm:p-3 text-gray-700">{ticket.issue_description}</td>
                          <td className="p-2 sm:p-3 text-gray-700">{ticket.issue_type}</td>
                          <td className="p-2 sm:p-3 text-gray-700">{ticket.status}</td>
                          <td className="p-2 sm:p-3 text-gray-700">{ticket.users_name || 'N/A'}</td>
                          <td className="p-2 sm:p-3 text-gray-700">
                            {ticket.ticket_open && ticket.ticket_open !== '0000-00-00 00:00:00'
                              ? new Date(ticket.ticket_open).toLocaleString()
                              : 'N/A'}
                          </td>
                          {/* <td className="p-2 sm:p-3 text-gray-700">
                            {ticket.ticket_on_hold && ticket.ticket_on_hold !== '0000-00-00 00:00:00'
                              ? new Date(ticket.ticket_on_hold).toLocaleString()
                              : 'N/A'}
                          </td> */}
                          {/* <td className="p-2 sm:p-3 text-gray-700">
                            {ticket.ticket_in_progress && ticket.ticket_in_progress !== '0000-00-00 00:00:00'
                              ? new Date(ticket.ticket_in_progress).toLocaleString()
                              : 'N/A'}
                          </td> */}
                          {/* <td className="p-2 sm:p-3 text-gray-700">
                            {ticket.ticket_pending_vendor && ticket.ticket_pending_vendor !== '0000-00-00 00:00:00'
                              ? new Date(ticket.ticket_pending_vendor).toLocaleString()
                              : 'N/A'}
                          </td> */}
                          {/* <td className="p-2 sm:p-3 text-gray-700">
                            {ticket.ticket_close && ticket.ticket_close !== '0000-00-00 00:00:00'
                              ? new Date(ticket.ticket_close).toLocaleString()
                              : 'N/A'}
                          </td> */}
                          {/* <td className="p-2 sm:p-3 text-gray-700">
                            {ticket.ticket_time && ticket.ticket_time !== '0000-00-00 00:00:00'
                              ? new Date(ticket.ticket_time).toLocaleString()
                              : 'N/A'}
                          </td> */}
                          {/* <td className="p-2 sm:p-3 text-gray-700">{ticket.comment || 'N/A'}</td> */}
                          {/* <td className="p-2 sm:p-3 text-gray-700">{ticket.issue_type_id}</td> */}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
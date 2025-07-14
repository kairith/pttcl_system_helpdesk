"use client";
import { useState } from "react";
import Card from "@/app/frontend/components/common/Card/Card";

interface TicketData {
  id: number;
  ticket_id: string;
  status?: string;
  station_id: string;
  station_type: string;
  issue_description: string;
  issue_type: string;
}

interface TicketDetailsTableProps {
  ticketData: TicketData[];
}

const TicketDetailsTable: React.FC<TicketDetailsTableProps> = ({ ticketData }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // default 10

  const totalPages = Math.ceil(ticketData.length / itemsPerPage);

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing rows per page
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTickets = ticketData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <Card className="mt-6 sm:mt-8 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">New Ticket</h2>
        {/* Rows Per Page Dropdown */}
        <div className="flex items-center space-x-2">
          <label htmlFor="rowsPerPage" className="text-gray-600 text-sm">
            Rows per page:
          </label>
          <select
            id="rowsPerPage"
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100 rounded-xl">
              <th className="text-left p-2 sm:p-3 font-bold text-gray-800">No</th>
              <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Ticket ID</th>
              <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Station ID</th>
              <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Station Type</th>
              <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Issue Description</th>
              <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Issue Type</th>
              <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Status</th>
            </tr>
          </thead>
          <tbody>
            {currentTickets.map((ticket, index) => (
              <tr key={ticket.id} className="border-b border-gray-200">
                <td className="p-2 sm:p-3 text-gray-700">{startIndex + index + 1}</td>
                <td className="p-2 sm:p-3 text-gray-700">{ticket.ticket_id}</td>
                <td className="p-2 sm:p-3 text-gray-700">{ticket.station_id}</td>
                <td className="p-2 sm:p-3 text-gray-700">{ticket.station_type}</td>
                <td className="p-2 sm:p-3 text-gray-700">{ticket.issue_description}</td>
                <td className="p-2 sm:p-3 text-gray-700">{ticket.issue_type}</td>
                <td className="p-2 sm:p-3 text-gray-700">{ticket.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Buttons */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded ${
            currentPage === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          Previous
        </button>
        <span className="text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded ${
            currentPage === totalPages ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          Next
        </button>
      </div>
    </Card>
  );
};

export default TicketDetailsTable;

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Ticket } from "../../types/ticket";
import { fetchTickets } from "../ticket/action";
import Header from "@/app/components/common/Header";

interface TicketsProps {
  isSidebarOpen: boolean;
}

export default function Tickets({ isSidebarOpen }: TicketsProps) {
  const [tickets, setTickets] = useState<(Ticket & { users_name: string; creator_name: string })[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<(Ticket & { users_name: string; creator_name: string })[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showFilterInput, setShowFilterInput] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const router = useRouter();

  
  // New filter states
  const [stationIdFilter, setStationIdFilter] = useState("");
  const [stationNameFilter, setStationNameFilter] = useState("");
  const [stationTypeFilter, setStationTypeFilter] = useState("");
  const [provinceFilter, setProvinceFilter] = useState("");
  const [issueDescriptionFilter, setIssueDescriptionFilter] = useState("");
  const [issueTypeFilter, setIssueTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [usersIdFilter, setUsersIdFilter] = useState("");
  const [ticketOpenFrom, setTicketOpenFrom] = useState("");
  const [ticketOpenTo, setTicketOpenTo] = useState("");
  const [ticketCloseFrom, setTicketCloseFrom] = useState("");
  const [ticketCloseTo, setTicketCloseTo] = useState("");
  const [ticketOnHoldFilter, setTicketOnHoldFilter] = useState("");
  const [ticketInProgressFilter, setTicketInProgressFilter] = useState("");
  const [ticketPendingVendorFilter, setTicketPendingVendorFilter] =
    useState("");
  const [ticketTimeFilter, setTicketTimeFilter] = useState("");
  const [commentFilter, setCommentFilter] = useState("");
  const [userCreateTicketFilter, setUserCreateTicketFilter] = useState("");
  const [issueTypeIdFilter, setIssueTypeIdFilter] = useState("");
  const [usersNameFilter, setUsersNameFilter] = useState("");
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
    const token = sessionStorage.getItem("token");
    if (!token) {
      alert("Please log in to create a ticket.");
      router.push("/");
      return;
    }
    router.push("/admin/ticket/add_ticket");
  };

  const handleFilterToggle = () => {
    setShowFilterInput((prev) => !prev);
    if (showFilterInput) {
      // Reset all filters
      setUsersNameFilter("");
      setStationIdFilter("");
      setStationNameFilter("");
      setStationTypeFilter("");
      setProvinceFilter("");
      setIssueDescriptionFilter("");
      setIssueTypeFilter("");
      setStatusFilter("");
      setUsersIdFilter("");
      setTicketOpenFrom("");
      setTicketOpenTo("");
      setTicketCloseFrom("");
      setTicketCloseTo("");
      setTicketOnHoldFilter("");
      setTicketInProgressFilter("");
      setTicketPendingVendorFilter("");
      setTicketTimeFilter("");
      setCommentFilter("");
      setUserCreateTicketFilter("");
      setIssueTypeIdFilter("");
      setFilteredTickets(tickets);
    }
  };

const handleFilter = () => {
  let result = [...tickets];

  if (stationIdFilter) {
    result = result.filter((ticket) =>
      String(ticket.station_id || "")
        .toLowerCase()
        .includes(stationIdFilter.toLowerCase())
    );
  }
  if (stationNameFilter) {
    result = result.filter((ticket) =>
      String(ticket.station_name || "")
        .toLowerCase()
        .includes(stationNameFilter.toLowerCase())
    );
  }
  if (stationTypeFilter) {
    result = result.filter((ticket) =>
      String(ticket.station_type || "")
        .toLowerCase()
        .includes(stationTypeFilter.toLowerCase())
    );
  }
  if (provinceFilter) {
    result = result.filter((ticket) =>
      String(ticket.province || "")
        .toLowerCase()
        .includes(provinceFilter.toLowerCase())
    );
  }
  if (issueDescriptionFilter) {
    result = result.filter((ticket) =>
      String(ticket.issue_description || "")
        .toLowerCase()
        .includes(issueDescriptionFilter.toLowerCase())
    );
  }
  if (issueTypeFilter) {
    result = result.filter((ticket) =>
      String(ticket.issue_type || "")
        .toLowerCase()
        .includes(issueTypeFilter.toLowerCase())
    );
  }
  if (statusFilter) {
    result = result.filter((ticket) =>
      String(ticket.status || "")
        .toLowerCase()
        .includes(statusFilter.toLowerCase())
    );
  }
  if (usersIdFilter) {
    result = result.filter((ticket) =>
      String(ticket.users_id || "")
        .toLowerCase()
        .includes(usersIdFilter.toLowerCase())
    );
  }
  if (usersNameFilter) {
    result = result.filter((ticket) =>
      String(ticket.users_name || "")
        .toLowerCase()
        .includes(usersNameFilter.toLowerCase())
    );
  }
  if (ticketOpenFrom || ticketOpenTo) {
    result = result.filter((ticket) => {
      const ticketDate = new Date(ticket.ticket_open || "");
      const fromDate = ticketOpenFrom ? new Date(ticketOpenFrom) : null;
      const toDate = ticketOpenTo ? new Date(ticketOpenTo) : null;
      return (
        (!fromDate || ticketDate >= fromDate) &&
        (!toDate || ticketDate <= toDate)
      );
    });
  }
  if (ticketCloseFrom || ticketCloseTo) {
    result = result.filter((ticket) => {
      const ticketDate = new Date(ticket.ticket_close || "");
      const fromDate = ticketCloseFrom ? new Date(ticketCloseFrom) : null;
      const toDate = ticketCloseTo ? new Date(ticketCloseTo) : null;
      return (
        (!fromDate || ticketDate >= fromDate) &&
        (!toDate || ticketDate <= toDate)
      );
    });
  }
  if (ticketOnHoldFilter) {
    result = result.filter((ticket) =>
      ticket.ticket_on_hold
        ? new Date(ticket.ticket_on_hold)
            .toISOString()
            .includes(ticketOnHoldFilter)
        : false
    );
  }
  if (ticketInProgressFilter) {
    result = result.filter((ticket) =>
      ticket.ticket_in_progress
        ? new Date(ticket.ticket_in_progress)
            .toISOString()
            .includes(ticketInProgressFilter)
        : false
    );
  }
  if (ticketPendingVendorFilter) {
    result = result.filter((ticket) =>
      ticket.ticket_pending_vendor
        ? new Date(ticket.ticket_pending_vendor)
            .toISOString()
            .includes(ticketPendingVendorFilter)
        : false
    );
  }
  if (ticketTimeFilter) {
    result = result.filter((ticket) =>
      ticket.ticket_time
        ? new Date(ticket.ticket_time)
            .toISOString()
            .includes(ticketTimeFilter)
        : false
    );
  }
  if (commentFilter) {
    result = result.filter((ticket) =>
      String(ticket.comment || "")
        .toLowerCase()
        .includes(commentFilter.toLowerCase())
    );
  }
  if (userCreateTicketFilter) {
    result = result.filter((ticket) =>
      String(ticket.user_create_ticket || "")
        .toLowerCase()
        .includes(userCreateTicketFilter.toLowerCase())
    );
  }
  if (issueTypeIdFilter) {
    result = result.filter((ticket) =>
      String(ticket.issue_type_id || "")
        .toLowerCase()
        .includes(issueTypeIdFilter.toLowerCase())
    );
  }

  setFilteredTickets(result);
};

  const handleClearFilter = () => {
    setStationIdFilter("");
    setStationNameFilter("");
    setStationTypeFilter("");
    setProvinceFilter("");
    setIssueDescriptionFilter("");
    setIssueTypeFilter("");
    setStatusFilter("");
    setUsersIdFilter("");
    setTicketOpenFrom("");
    setTicketOpenTo("");
    setTicketCloseFrom("");
    setTicketCloseTo("");
    setTicketOnHoldFilter("");
    setTicketInProgressFilter("");
    setTicketPendingVendorFilter("");
    setTicketTimeFilter("");
    setCommentFilter("");
    setUserCreateTicketFilter("");
    setIssueTypeIdFilter("");
    setShowFilterInput(false);
    setFilteredTickets(tickets);
  };

  const handleExport = async (format: "xlsx" | "pdf" | "csv") => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      alert("Please log in to export tickets.");
      router.push("/");
      return;
    }

    setIsExporting(true);
    try {
      const response = await fetch(`/api/data/export-ticket?format=${format}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Export failed: ${errorData.error || "Unknown error"}`);
        return;
      }

      const blob = await response.blob();
      if (blob.size === 0) {
        alert("Export failed: Empty file received.");
        return;
      }

      const extensionMap: Record<string, string> = {
        xlsx: "xlsx",
        pdf: "pdf",
        csv: "csv",
      };
      const extension = extensionMap[format] || "bin";

      let fileName = `tickets_export.${extension}`;
      const contentDisposition = response.headers.get("Content-Disposition");
      if (contentDisposition && contentDisposition.includes("filename=")) {
        const match = contentDisposition.match(/filename="([^"]+)"/);
        if (match && match[1]) fileName = match[1];
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setShowExportOptions(false);
    } catch (error) {
      alert("An error occurred during export. Please try again.");
      console.error("Export error:", error);
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
              isSidebarOpen ? "sm:ml-64" : "sm:ml-0"
            }`}
          >
            <div className="text-red-500 text-center text-sm sm:text-base">
              {error}
            </div>
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
            isSidebarOpen ? "sm:ml-64" : "sm:ml-0"
          }`}
        >
          <div className="container mx-auto">
            <div className="mt-19 sm:mt-6 p-4 sm:p-6 bg-white rounded-lg shadow-md">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-8">
                Tickets
              </h1>
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
                        onClick={() => handleExport("xlsx")}
                        className="bg-white border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-100 text-sm sm:text-base disabled:opacity-50"
                        disabled={isExporting}
                      >
                        Excel
                      </button>
                      <button
                        onClick={() => handleExport("pdf")}
                        className="bg-white border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-100 text-sm sm:text-base disabled:opacity-50"
                        disabled={isExporting}
                      >
                        PDF
                      </button>
                      <button
                        onClick={() => handleExport("csv")}
                        className="bg-white border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-100 text-sm sm:text-base disabled:opacity-50"
                        disabled={isExporting}
                      >
                        CSV
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {showFilterInput && (
  <div
    className={`mb-6 overflow-hidden transition-all duration-300 ease-in-out ${
      showFilterInput ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
    }`}
  >
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 w-full pt-2">
      {/* Station ID */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700">Station ID</label>
        <input
          type="text"
          value={stationIdFilter}
          onChange={(e) => setStationIdFilter(e.target.value)}
          placeholder="Station ID"
          className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base w-full"
          disabled={isExporting}
        />
        {stationIdFilter && (
          <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto">
            {[
              ...new Set(tickets.map((ticket) => ticket.station_id)),
            ]
              .filter((id) =>
                id
                  ?.toString()
                  .toLowerCase()
                  .includes(stationIdFilter.toLowerCase())
              )
              .map((id) => (
                <div
                  key={id}
                  onClick={() => setStationIdFilter(id || '')}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                >
                  {id || 'N/A'}
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Station Name */}
      <div className="relative">
  <label className="block text-sm font-medium text-gray-700">Station Name</label>
  <select
    value={stationNameFilter}
    onChange={(e) => setStationNameFilter(e.target.value)}
    className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base w-full"
    disabled={isExporting}
  >
    <option value="">Station Name</option>
    {[
      ...new Set(tickets.map((ticket) => ticket.station_name)),
    ].map((name) => (
      <option key={name} value={name || ''}>
        {name || 'N/A'}
      </option>
    ))}
  </select>
</div>



      {/* Station Type */}
      {/* <div className="relative">
        <label className="block text-sm font-medium text-gray-700">Station Type</label>
        <input
          type="text"
          value={stationTypeFilter}
          onChange={(e) => setStationTypeFilter(e.target.value)}
          placeholder="Station Type"
          className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base w-full"
          disabled={isExporting}
        />
        {stationTypeFilter && (
          <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto">
            {[
              ...new Set(tickets.map((ticket) => ticket.station_type)),
            ]
              .filter((type) =>
                type
                  ?.toString()
                  .toLowerCase()
                  .includes(stationTypeFilter.toLowerCase())
              )
              .map((type) => (
                <div
                  key={type}
                  onClick={() => setStationTypeFilter(type || '')}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                >
                  {type || 'N/A'}
                </div>
              ))}
          </div>
        )}
      </div> */}

      {/* Province */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700">Province</label>
        <select
          value={provinceFilter}
          onChange={(e) => setProvinceFilter(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base w-full"
          disabled={isExporting}
        >
          <option value="">Province</option>
          {[
            ...new Set(tickets.map((ticket) => ticket.province)),
          ].map((prov) => (
            <option key={prov} value={prov || ''}>
              {prov || 'N/A'}
            </option>
          ))}
        </select>
      </div>

      {/* Issue Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Issue Type</label>
        <select
          value={issueTypeFilter}
          onChange={(e) => setIssueTypeFilter(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base w-full"
          disabled={isExporting}
        >
          <option value="">Issue Type</option>
          {[
            ...new Set(tickets.map((ticket) => ticket.issue_type)),
          ].map((type) => (
            <option key={type} value={type || ''}>
              {type || 'N/A'}
            </option>
          ))}
        </select>
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Ticket Status</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base w-full"
          disabled={isExporting}
        >
          <option value="">Ticket Status</option>
          {[...new Set(tickets.map((ticket) => ticket.status))].map((status) => (
            <option key={status} value={status || ''}>
              {status || 'N/A'}
            </option>
          ))}
        </select>
      </div>

      {/* Assign */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Assign</label>
        <select
          value={usersNameFilter}
          onChange={(e) => setUsersNameFilter(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base w-full"
          disabled={isExporting}
        >
          <option value="">Assign</option>
          {[
            ...new Set(tickets.map((ticket) => ticket.users_name)),
          ].map((users_name) => (
            <option key={users_name} value={users_name || ''}>
              {users_name || 'N/A'}
            </option>
          ))}
        </select>
      </div>

      {/* User Create */}
      <div>
        <label className="block text-sm font-medium text-gray-700">User Create</label>
        <select
          value={userCreateTicketFilter}
          onChange={(e) => setUserCreateTicketFilter(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base w-full"
          disabled={isExporting}
        >
          <option value="">User Create</option>
          {[
            ...new Set(tickets.map((ticket) => ticket.user_create_ticket)),
          ].map((userId) => (
            <option key={userId} value={userId || ''}>
              {userId || 'N/A'} {/* Replace with users_name if mapped */}
            </option>
          ))}
        </select>
      </div>

      {/* Issue Type ID */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Issue Type ID</label>
        <select
          value={issueTypeIdFilter}
          onChange={(e) => setIssueTypeIdFilter(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base w-full"
          disabled={isExporting}
        >
          <option value="">Issue Type ID</option>
          {[
            ...new Set(tickets.map((ticket) => ticket.issue_type_id)),
          ].map((id) => (
            <option key={id} value={id || ''}>
              {id || 'N/A'}
            </option>
          ))}
        </select>
      </div>

      {/* Date inputs */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Ticket Open From</label>
        <input
          type="date"
          value={ticketOpenFrom}
          onChange={(e) => setTicketOpenFrom(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base w-full"
          disabled={isExporting}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Ticket Open To</label>
        <input
          type="date"
          value={ticketOpenTo}
          onChange={(e) => setTicketOpenTo(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base w-full"
          disabled={isExporting}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Ticket Close From</label>
        <input
          type="date"
          value={ticketCloseFrom}
          onChange={(e) => setTicketCloseFrom(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base w-full"
          disabled={isExporting}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Ticket Close To</label>
        <input
          type="date"
          value={ticketCloseTo}
          onChange={(e) => setTicketCloseTo(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base w-full"
          disabled={isExporting}
        />
      </div>

      <button
        onClick={handleFilter}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm sm:text-base disabled:opacity-50"
        disabled={isExporting}
      >
        Filter
      </button>
      <button
        onClick={handleClearFilter}
        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm sm:text-base disabled:opacity-50"
        disabled={isExporting}
      >
        Clear
      </button>
    </div>
  </div>
)}
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[1200px]">
                  <thead>
                    <tr className="bg-gray-100 rounded-xl">
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">
                        ID
                      </th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">
                        Ticket ID
                      </th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">
                        Station ID
                      </th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">
                        Station Name
                      </th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">
                        Station Type
                      </th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">
                        Province
                      </th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">
                        Issue Description
                      </th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">
                        Issue Type
                      </th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">
                        Status
                      </th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">
                        Assign
                      </th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">
                        Opened
                      </th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">
                        On Hold
                      </th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">
                        In Progress
                      </th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">
                        Pending Vendor
                      </th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">
                        Closed
                      </th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">
                        Last Updated
                      </th>
                      <th className="text-left p-2 sm:p-3 font-bold text-gray-800">
                        Comment
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.length === 0 ? (
                      <tr>
                        <td
                          colSpan={17}
                          className="p-4 text-center text-gray-500"
                        >
                          No tickets found.
                        </td>
                      </tr>
                    ) : (
                      filteredTickets.map((ticket) => (
                        <tr
                          key={ticket.id}
                          className="border-b border-gray-200 hover:bg-gray-50"
                        >
                          <td className="p-2 sm:p-3 text-gray-700">
                            {ticket.id}
                          </td>
                          <td className="p-2 sm:p-3 text-gray-700">
                            {ticket.ticket_id}
                          </td>
                          <td className="p-2 sm:p-3 text-gray-700">
                            {ticket.station_id}
                          </td>
                          <td className="p-2 sm:p-3 text-gray-700">
                            {ticket.station_name || "N/A"}
                          </td>
                          <td className="p-2 sm:p-3 text-gray-700">
                            {ticket.station_type || "N/A"}
                          </td>
                          <td className="p-2 sm:p-3 text-gray-700">
                            {ticket.province || "N/A"}
                          </td>
                          <td className="p-2 sm:p-3 text-gray-700">
                            {ticket.issue_description}
                          </td>
                          <td className="p-2 sm:p-3 text-gray-700">
                            {ticket.issue_type}
                          </td>
                          <td className="p-2 sm:p-3 text-gray-700">
                            {ticket.status}
                          </td>
                          <td className="p-2 sm:p-3 text-gray-700">
                            {ticket.users_name || "N/A"}
                          </td>
                          <td className="p-2 sm:p-3 text-gray-700">
                            {ticket.ticket_open &&
                            ticket.ticket_open !== "0000-00-00 00:00:00"
                              ? new Date(ticket.ticket_open).toLocaleString()
                              : "N/A"}
                          </td>
                          <td className="p-2 sm:p-3 text-gray-700">
                            {ticket.ticket_on_hold &&
                            ticket.ticket_on_hold !== "0000-00-00 00:00:00"
                              ? new Date(ticket.ticket_on_hold).toLocaleString()
                              : "N/A"}
                          </td>
                          <td className="p-2 sm:p-3 text-gray-700">
                            {ticket.ticket_in_progress &&
                            ticket.ticket_in_progress !== "0000-00-00 00:00:00"
                              ? new Date(
                                  ticket.ticket_in_progress
                                ).toLocaleString()
                              : "N/A"}
                          </td>
                          <td className="p-2 sm:p-3 text-gray-700">
                            {ticket.ticket_pending_vendor &&
                            ticket.ticket_pending_vendor !==
                              "0000-00-00 00:00:00"
                              ? new Date(
                                  ticket.ticket_pending_vendor
                                ).toLocaleString()
                              : "N/A"}
                          </td>
                          <td className="p-2 sm:p-3 text-gray-700">
                            {ticket.ticket_close &&
                            ticket.ticket_close !== "0000-00-00 00:00:00"
                              ? new Date(ticket.ticket_close).toLocaleString()
                              : "N/A"}
                          </td>
                          <td className="p-2 sm:p-3 text-gray-700">
                            {ticket.ticket_time &&
                            ticket.ticket_time !== "0000-00-00 00:00:00"
                              ? new Date(ticket.ticket_time).toLocaleString()
                              : "N/A"}
                          </td>
                          <td className="p-2 sm:p-3 text-gray-700">
                            {ticket.comment || "N/A"}
                          </td>
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

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Ticket } from "../../../types/ticket"; // Adjust path as needed
import { fetchTickets } from "./action";
import HeaderWithSidebar from "@/app/components/common/Header/Headerwithsidebar";
import ControlsSection from "@/app/components/Ticket_components/ControlsSection/ControlsSection";
import FilterSection from "@/app/components/Ticket_components/FilterSection/FilterSection";
import TicketTable from "@/app/components/Ticket_components/TicketTable/TicketTable";

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

  // Filter states
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
  const [ticketPendingVendorFilter, setTicketPendingVendorFilter] = useState("");
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
      console.log("Loaded tickets:", tickets); // Debug log
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
    router.push("/pages/admin/ticket/add_ticket");
  };

  const handleFilterToggle = () => {
    setShowFilterInput((prev) => !prev);
    if (showFilterInput) {
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
      setUsersNameFilter("");
      setFilteredTickets(tickets);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    console.log(`handleFilterChange: ${key} = ${value}`); // Debug log
    switch (key) {
      case "stationIdFilter":
        setStationIdFilter(value);
        break;
      case "stationNameFilter":
        setStationNameFilter(value);
        break;
      case "stationTypeFilter":
        setStationTypeFilter(value);
        break;
      case "provinceFilter":
        setProvinceFilter(value);
        break;
      case "issueDescriptionFilter":
        setIssueDescriptionFilter(value);
        break;
      case "issueTypeFilter":
        setIssueTypeFilter(value);
        break;
      case "statusFilter":
        setStatusFilter(value);
        break;
      case "usersIdFilter":
        setUsersIdFilter(value);
        break;
      case "ticketOpenFrom":
        setTicketOpenFrom(value);
        break;
      case "ticketOpenTo":
        setTicketOpenTo(value);
        break;
      case "ticketCloseFrom":
        setTicketCloseFrom(value);
        break;
      case "ticketCloseTo":
        setTicketCloseTo(value);
        break;
      case "ticketOnHoldFilter":
        setTicketOnHoldFilter(value);
        break;
      case "ticketInProgressFilter":
        setTicketInProgressFilter(value);
        break;
      case "ticketPendingVendorFilter":
        setTicketPendingVendorFilter(value);
        break;
      case "ticketTimeFilter":
        setTicketTimeFilter(value);
        break;
      case "commentFilter":
        setCommentFilter(value);
        break;
      case "userCreateTicketFilter":
        setUserCreateTicketFilter(value);
        break;
      case "issueTypeIdFilter":
        setIssueTypeIdFilter(value);
        break;
      case "usersNameFilter":
        setUsersNameFilter(value);
        break;
    }
  };

  const handleFilter = () => {
    let result = [...tickets];

    console.log("Filtering with:", {
      stationIdFilter,
      stationNameFilter,
      stationTypeFilter,
      provinceFilter,
      issueTypeFilter,
      statusFilter,
      usersNameFilter,
      ticketOpenFrom,
      ticketOpenTo,
    }); // Debug log

    if (stationIdFilter) {
      result = result.filter((ticket) =>
        String(ticket.station_id || "").toLowerCase().includes(stationIdFilter.toLowerCase())
      );
    }
    if (stationNameFilter) {
      result = result.filter((ticket) =>
        String(ticket.station_name || "").toLowerCase().includes(stationNameFilter.toLowerCase())
      );
    }
    if (stationTypeFilter) {
      result = result.filter((ticket) =>
        String(ticket.station_type || "").toLowerCase().includes(stationTypeFilter.toLowerCase())
      );
    }
    if (provinceFilter) {
      result = result.filter((ticket) =>
        String(ticket.province || "").toLowerCase().includes(provinceFilter.toLowerCase())
      );
    }
    if (issueDescriptionFilter) {
      result = result.filter((ticket) =>
        String(ticket.issue_description || "").toLowerCase().includes(issueDescriptionFilter.toLowerCase())
      );
    }
    if (issueTypeFilter) {
      result = result.filter((ticket) =>
        String(ticket.issue_type || "").toLowerCase().includes(issueTypeFilter.toLowerCase())
      );
    }
    if (statusFilter) {
      result = result.filter((ticket) =>
        String(ticket.status || "").toLowerCase().includes(statusFilter.toLowerCase())
      );
    }
    if (usersIdFilter) {
      result = result.filter((ticket) =>
        String(ticket.users_id || "").toLowerCase().includes(usersIdFilter.toLowerCase())
      );
    }
    if (usersNameFilter) {
      result = result.filter((ticket) =>
        String(ticket.users_name || "").toLowerCase().includes(usersNameFilter.toLowerCase())
      );
    }
    if (ticketOpenFrom || ticketOpenTo) {
      result = result.filter((ticket) => {
        const ticketDate = new Date(ticket.ticket_open || "");
        const fromDate = ticketOpenFrom ? new Date(ticketOpenFrom) : null;
        const toDate = ticketOpenTo ? new Date(ticketOpenTo) : null;
        return (!fromDate || ticketDate >= fromDate) && (!toDate || ticketDate <= toDate);
      });
    }
    if (ticketCloseFrom || ticketCloseTo) {
      result = result.filter((ticket) => {
        const ticketDate = new Date(ticket.ticket_close || "");
        const fromDate = ticketCloseFrom ? new Date(ticketCloseFrom) : null;
        const toDate = ticketCloseTo ? new Date(ticketCloseTo) : null;
        return (!fromDate || ticketDate >= fromDate) && (!toDate || ticketDate <= toDate);
      });
    }
    if (ticketOnHoldFilter) {
      result = result.filter((ticket) =>
        ticket.ticket_on_hold
          ? new Date(ticket.ticket_on_hold).toISOString().includes(ticketOnHoldFilter)
          : false
      );
    }
    if (ticketInProgressFilter) {
      result = result.filter((ticket) =>
        ticket.ticket_in_progress
          ? new Date(ticket.ticket_in_progress).toISOString().includes(ticketInProgressFilter)
          : false
      );
    }
    if (ticketPendingVendorFilter) {
      result = result.filter((ticket) =>
        ticket.ticket_pending_vendor
          ? new Date(ticket.ticket_pending_vendor).toISOString().includes(ticketPendingVendorFilter)
          : false
      );
    }
    if (ticketTimeFilter) {
      result = result.filter((ticket) =>
        ticket.ticket_time
          ? new Date(ticket.ticket_time).toISOString().includes(ticketTimeFilter)
          : false
      );
    }
    if (commentFilter) {
      result = result.filter((ticket) =>
        String(ticket.comment || "").toLowerCase().includes(commentFilter.toLowerCase())
      );
    }
    if (userCreateTicketFilter) {
      result = result.filter((ticket) =>
        String(ticket.user_create_ticket || "").toLowerCase().includes(userCreateTicketFilter.toLowerCase())
      );
    }
    if (issueTypeIdFilter) {
      result = result.filter((ticket) =>
        String(ticket.issue_type_id || "").toLowerCase().includes(issueTypeIdFilter.toLowerCase())
      );
    }

    setFilteredTickets(result);
    console.log("Filtered results:", result); // Debug log
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
      <div className="min-h-screen bg-gray-50 pt-16">
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
      <HeaderWithSidebar />
      <main
        className={`flex-1 p-4 sm:p-6 lg:p-8 w-full transition-all duration-300 pt-16 ${
          isSidebarOpen ? "sm:ml-64" : "sm:ml-0"
        }`}
      >
        <div className="bg-white shadow rounded-lg p-4 mt-16">
          <h1 className="text-2xl font-bold text-gray-800">Tickets</h1>
        </div>
        <div className="mt-2">
          <ControlsSection
            onCreateTicket={handleCreateTicket}
            onFilterToggle={handleFilterToggle}
            onExportToggle={() => setShowExportOptions((prev) => !prev)}
            showExportOptions={showExportOptions}
            setShowExportOptions={setShowExportOptions}
            isExporting={isExporting}
            onExport={handleExport}
          />
          <FilterSection
            showFilterInput={showFilterInput}
            isExporting={isExporting}
            stationIdFilter={stationIdFilter}
            stationNameFilter={stationNameFilter}
            stationTypeFilter={stationTypeFilter}
            provinceFilter={provinceFilter}
            issueDescriptionFilter={issueDescriptionFilter}
            issueTypeFilter={issueTypeFilter}
            statusFilter={statusFilter}
            usersIdFilter={usersIdFilter}
            ticketOpenFrom={ticketOpenFrom}
            ticketOpenTo={ticketOpenTo}
            ticketCloseFrom={ticketCloseFrom}
            ticketCloseTo={ticketCloseTo}
            ticketOnHoldFilter={ticketOnHoldFilter}
            ticketInProgressFilter={ticketInProgressFilter}
            ticketPendingVendorFilter={ticketPendingVendorFilter}
            ticketTimeFilter={ticketTimeFilter}
            commentFilter={commentFilter}
            userCreateTicketFilter={userCreateTicketFilter}
            issueTypeIdFilter={issueTypeIdFilter}
            usersNameFilter={usersNameFilter}
            tickets={tickets}
            onFilterChange={handleFilterChange}
            onFilter={handleFilter}
            onClearFilter={handleClearFilter}
          />
          <TicketTable filteredTickets={filteredTickets} />
        </div>
      </main>
    </div>
  );
}
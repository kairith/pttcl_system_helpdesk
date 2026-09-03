
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Ticket } from "../../../../../backend/types/ticket";

import ControlsSection from "@/app/frontend/components/Users/User_Ticket_Components/ControlsSection/ControlsSection";
import FilterSection from "@/app/frontend/components/Users/User_Ticket_Components/FilterSection/FilterSection";
import TicketTable from "@/app/frontend/components/Users/User_Ticket_Components/TicketTable/TicketTable";
import { toast } from "react-toastify";
import LoadingScreen from "@/app/frontend/components/ui/loadingScreen";
import Card from "@/app/frontend/components/common/Card/Card";
import { useUserData } from "@/app/frontend/components/common/Header/UserDataProvider";

interface Permissions {
  tickets: {
    add: boolean;
    edit: boolean;
    delete: boolean;
    list: boolean;
    listAssign: boolean;
  };
}

export default function MyTickets() {
  const { user, rules, authLoading } = useUserData();
  const [tickets, setTickets] = useState<(Ticket & { users_name: string; creator_name: string })[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<(Ticket & { users_name: string; creator_name: string })[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showFilterInput, setShowFilterInput] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [usersId, setUsersId] = useState<number | null>(null);
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



  const permissions = useMemo<Permissions | null>(() => {
    if (!rules) return null;
    return {
      tickets: {
        add: !!rules.add_ticket_status,
        edit: !!rules.edit_ticket_status,
        delete: !!rules.delete_ticket_status,
        list: !!rules.list_ticket_status,
        listAssign: !!rules.list_ticket_assign,
      },
    };
  }, [rules]);

  useEffect(() => {
    setUsersId(user?.users_id ?? null);
  }, [user]);

  useEffect(() => {
    if (!permissions) return;
    const currentPermissions = permissions;

    async function loadData() {
      try {
        setIsLoading(true);
        if (currentPermissions.tickets.list) {
          const token = sessionStorage.getItem("token");
          if (!token) return;
          const ticketResponse = await fetch("/api/data/UserPage/ticket", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!ticketResponse.ok) {
            const data = await ticketResponse.json();
            throw new Error(data.error || "Failed to fetch tickets");
          }
          const { tickets } = await ticketResponse.json();
          setTickets(tickets || []);
          setFilteredTickets(tickets || []);
        } else {
          setError("You do not have permission to view tickets. Contact Admin for access.");
          toast.error("You do not have permission to view tickets. Contact Admin for access.");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        setError(errorMessage);
        toast.error(errorMessage);
        console.error("Error loading data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [permissions]);

  const handleTicketDeleted = (ticketId: string) => {
    setTickets((prev) => prev.filter((t) => t.ticket_id !== ticketId));
    setFilteredTickets((prev) => prev.filter((t) => t.ticket_id !== ticketId));
  };

  const handleCreateTicket = () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to create a ticket.");
      router.push("/");
      return;
    }
    if (!permissions?.tickets.add) {
      toast.error("You do not have permission to create tickets. Contact Admin for access.");
      return;
    }
    router.push("/pages/Users/ticket/add_ticket");
  };

  const handleFilterToggle = () => {
    if (!permissions?.tickets.list) {
      toast.error("You do not have permission to filter tickets. Contact Admin for access.");
      return;
    }
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
    console.log(`handleFilterChange: ${key} = ${value}`);
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
    if (!permissions?.tickets.list) {
      toast.error("You do not have permission to filter tickets. Contact Admin for access.");
      return;
    }
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
    });

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
    console.log("Filtered tickets:", result);
  };

  const handleClearFilter = () => {
    if (!permissions?.tickets.list) {
      toast.error("You do not have permission to clear filters. Contact Admin for access.");
      return;
    }
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
    setShowFilterInput(false);
    setFilteredTickets(tickets);
  };

  const handleExport = async (format: "xlsx" | "pdf" | "csv") => {
    if (!permissions?.tickets.list) {
      toast.error("You do not have permission to export tickets. Contact Admin for access.");
      return;
    }
    const token = sessionStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to export tickets.");
      router.push("/");
      return;
    }

    setIsExporting(true);
    try {
      const response = await fetch(`/api/data/UserPage/ticket?format=${format}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error?.includes("Invalid token")) {
          toast.error("Session expired. Please log in again.");
          router.push("/");
          return;
        }
        throw new Error(errorData.error || `Export to ${format} failed`);
      }

      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error("Export failed: Empty file received.");
      }

      const extensionMap: Record<string, string> = {
        xlsx: "xlsx",
        pdf: "pdf",
        csv: "csv",
      };
      const extension = extensionMap[format] || "bin";

      let fileName = `my_tickets_export.${extension}`;
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
      toast.success(`Successfully exported tickets to ${format.toUpperCase()}`);
      setShowExportOptions(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
      toast.error(errorMessage);
      console.error("Export error:", error);
    } finally {
      setIsExporting(false);
    }
  };

 if (authLoading || isLoading) {
    return (
        <LoadingScreen></LoadingScreen>
    );
  }

  if (error || !permissions) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="bg-white p-6 rounded-lg shadow-md text-center max-w-md w-full">
          <svg
            className="mx-auto h-12 w-12 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="mt-4 text-lg font-semibold text-red-600">{error || "Failed to load permissions"}</p>
        </div>
      </div>
    );
  }

  return (
    <Card className="p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-800">My Tickets</h1>
      {(permissions.tickets.add || permissions.tickets.list) && (
        <div className="mt-4 w-full max-w-full">
          <ControlsSection
            onCreateTicket={permissions.tickets.add ? handleCreateTicket : undefined}
            onFilterToggle={permissions.tickets.list ? handleFilterToggle : undefined}
            onExportToggle={
              permissions.tickets.list ? () => setShowExportOptions((prev) => !prev) : undefined
            }
            showExportOptions={showExportOptions}
            setShowExportOptions={setShowExportOptions}
            isExporting={isExporting}
            onExport={permissions.tickets.list ? handleExport : undefined}
          />
          {permissions.tickets.list && (
            <>
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
              <TicketTable
                filteredTickets={filteredTickets}
                permissions={permissions.tickets}
                onTicketDeleted={handleTicketDeleted}
              />
            </>
          )}
        </div>
      )}
    </Card>
  );
}

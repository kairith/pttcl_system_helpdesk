"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Ticket } from "../../../../backend/types/ticket";
import HeaderWithSidebar from "@/app/frontend/components/common/Header/Headerwithsidebar";
import ControlsSection from "@/app/frontend/components/User_Ticket_Components/ControlsSection/ControlsSection";
import FilterSection from "@/app/frontend/components/User_Ticket_Components/FilterSection/FilterSection";
import TicketTable from "@/app/frontend/components/User_Ticket_Components/TicketTable/TicketTable";
import { toast } from "react-toastify";

interface MyTicketsProps {
  isSidebarOpen: boolean;
}

interface Permissions {
  tickets: {
    add: boolean;
    edit: boolean;
    delete: boolean;
    list: boolean;
    listAssign: boolean;
  };
}

export default function MyTickets({ isSidebarOpen }: MyTicketsProps) {
  const [tickets, setTickets] = useState<(Ticket & { users_name: string; creator_name: string })[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<(Ticket & { users_name: string; creator_name: string })[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showFilterInput, setShowFilterInput] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [permissions, setPermissions] = useState<Permissions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [usersId, setUsersId] = useState<string | null>(null);
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
    async function loadData() {
      try {
        setIsLoading(true);
        const token = sessionStorage.getItem("token");
        if (!token) {
          toast.error("Please log in to access your tickets.");
          router.push("/");
          return;
        }
        console.log("Token:", token); // Debug token

        // Fetch user data and permissions
        const userResponse = await fetch("/api/data/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!userResponse.ok) {
          const data = await userResponse.json();
          if (data.error?.includes("Invalid token")) {
            toast.error("Session expired. Please log in again.");
            router.push("/");
            return;
          }
          throw new Error(data.error || "Failed to fetch user data");
        }
        const { users_id, rules } = await userResponse.json();
        console.log("User response:", { users_id, rules }); // Debug response
        setUsersId(users_id);
        const userPermissions: Permissions = {
          tickets: {
            add: !!rules.add_ticket_status,
            edit: !!rules.edit_ticket_status,
            delete: !!rules.delete_ticket_status,
            list: !!rules.list_ticket_status,
            listAssign: !!rules.list_ticket_assign,
          },
        };
        setPermissions(userPermissions);
        console.log("Permissions loaded:", userPermissions);
        console.log("Users ID:", users_id);

        // Fetch user's tickets only if list permission exists
        if (userPermissions.tickets.list) {
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
          console.log("Loaded tickets:", tickets);
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
  }, [router]);

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
    router.push("/pages/admin/ticket/add_ticket");
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HeaderWithSidebar />
        <div className="flex">
          <main
            className={`flex-1 p-4 sm:p-6 lg:p-8 w-full transition-all duration-300 ${
              isSidebarOpen ? "sm:ml-64" : "sm:ml-0"
            }`}
          >
            <div className="text-gray-500 text-center text-sm sm:text-base">
              Loading your tickets...
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error || !permissions) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HeaderWithSidebar />
        <div className="flex">
          <main
            className={`flex-1 p-4 sm:p-6 lg:p-8 w-full transition-all duration-300 ${
              isSidebarOpen ? "sm:ml-64" : "sm:ml-0"
            }`}
          >
            <div className="text-red-500 text-center text-sm sm:text-base">
              {error || "Failed to load permissions"}
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
        className={`flex-1 p-4 sm:p-6 mt-14 lg:p-8 w-full transition-all duration-300 ${
          isSidebarOpen ? "sm:ml-64" : "sm:ml-0"
        }`}
       >
        <div className="bg-white shadow rounded-lg p-4">
          <h1 className="text-2xl font-bold text-gray-800">My Tickets</h1>
        </div>
        {(permissions.tickets.add || permissions.tickets.list) && (
          <div className="mt-4">
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
                />
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
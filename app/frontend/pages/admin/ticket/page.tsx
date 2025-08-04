"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Ticket } from "../../../../backend/types/ticket";
import { fetchTickets } from "./action";
import HeaderResponsive from "@/app/frontend/components/common/Header/headerResponsive";
import ControlsSection from "@/app/frontend/components/Admin/Ticket_components/ControlsSection/ControlsSection";
import FilterSection from "@/app/frontend/components/Admin/Ticket_components/FilterSection/FilterSection";
import TicketTable from "@/app/frontend/components/Admin/Ticket_components/TicketTable/TicketTable";
import LoadingScreen from "@/app/frontend/components/ui/loadingScreen";

interface Permissions {
  tickets: {
    add: boolean;
    edit: boolean;
    delete: boolean;
    list: boolean;
    listAssign: boolean;
  };
}

interface Filters {
  stationId: string;
  stationName: string;
  stationType: string;
  province: string;
  issueDescription: string;
  issueType: string;
  status: string;
  usersId: string;
  ticketOpenFrom: string;
  ticketOpenTo: string;
  ticketCloseFrom: string;
  ticketCloseTo: string;
  ticketOnHold: string;
  ticketInProgress: string;
  ticketPendingVendor: string;
  ticketTime: string;
  comment: string;
  userCreateTicket: string;
  issueTypeId: string;
  usersName: string;
}

export default function Tickets() {
  const [tickets, setTickets] = useState<(Ticket & { users_name: string; creator_name: string })[]>([]);
  const [filters, setFilters] = useState<Filters>({
    stationId: "",
    stationName: "",
    stationType: "",
    province: "",
    issueDescription: "",
    issueType: "",
    status: "",
    usersId: "",
    ticketOpenFrom: "",
    ticketOpenTo: "",
    ticketCloseFrom: "",
    ticketCloseTo: "",
    ticketOnHold: "",
    ticketInProgress: "",
    ticketPendingVendor: "",
    ticketTime: "",
    comment: "",
    userCreateTicket: "",
    issueTypeId: "",
    usersName: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [showFilterInput, setShowFilterInput] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [permissions, setPermissions] = useState<Permissions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const token = sessionStorage.getItem("token");
        if (!token) {
          setError("Please log in to access tickets.");
          toast.error("Please log in to access tickets.");
          router.push("/");
          return;
        }

        const response = await fetch("/api/data/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          const data = await response.json();
          if (data.error?.includes("Invalid token")) {
            setError("Session expired. Please log in again.");
            toast.error("Session expired. Please log in again.");
            router.push("/");
            return;
          }
          throw new Error(data.error || "Failed to fetch permissions");
        }
        const { rules } = await response.json();
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

        if (userPermissions.tickets.list) {
          const { tickets, error } = await fetchTickets();
          if (error) {
            setError(error);
            toast.error(error);
          } else {
            setTickets(tickets || []);
          }
        } else {
          setError("You do not have permission to view tickets.");
          toast.error("You do not have permission to view tickets.");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [router]);

  const handleCreateTicket = useCallback(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to create a ticket.");
      router.push("/");
      return;
    }
    if (!permissions?.tickets.add) {
      toast.error("You do not have permission to create tickets.");
      return;
    }
    router.push("/pages/admin/ticket/add_ticket");
  }, [permissions, router]);

  const handleFilterToggle = useCallback(() => {
    if (!permissions?.tickets.list) {
      toast.error("You do not have permission to filter tickets.");
      return;
    }
    setShowFilterInput((prev) => !prev);
  }, [permissions]);

  const handleFilterChange = useCallback((key: string, value: string) => {
    if (Object.keys(filters).includes(key)) {
      setFilters((prev) => {
        if (prev[key as keyof Filters] === value) return prev;
        return { ...prev, [key]: value };
      });
    }
  }, [filters]);

  const filteredTickets = useMemo(() => {
    if (!permissions?.tickets.list) return tickets;

    return tickets.filter((ticket) => {
      const {
        stationId,
        stationName,
        stationType,
        province,
        issueDescription,
        issueType,
        status,
        usersId,
        ticketOpenFrom,
        ticketOpenTo,
        ticketCloseFrom,
        ticketCloseTo,
        ticketOnHold,
        ticketInProgress,
        ticketPendingVendor,
        ticketTime,
        comment,
        userCreateTicket,
        issueTypeId,
        usersName,
      } = filters;

      const ticketOpenDate = ticket.ticket_open ? new Date(ticket.ticket_open) : null;
      const ticketCloseDate = ticket.ticket_close ? new Date(ticket.ticket_close) : null;
      const ticketOnHoldDate = ticket.ticket_on_hold ? new Date(ticket.ticket_on_hold) : null;
      const ticketInProgressDate = ticket.ticket_in_progress ? new Date(ticket.ticket_in_progress) : null;
      const ticketPendingVendorDate = ticket.ticket_pending_vendor ? new Date(ticket.ticket_pending_vendor) : null;
      const ticketTimeDate = ticket.ticket_time ? new Date(ticket.ticket_time) : null;

      return (
        (!stationId || String(ticket.station_id || "").toLowerCase().includes(stationId.toLowerCase())) &&
        (!stationName || String(ticket.station_name || "").toLowerCase().includes(stationName.toLowerCase())) &&
        (!stationType || String(ticket.station_type || "").toLowerCase().includes(stationType.toLowerCase())) &&
        (!province || String(ticket.province || "").toLowerCase().includes(province.toLowerCase())) &&
        (!issueDescription || String(ticket.issue_description || "").toLowerCase().includes(issueDescription.toLowerCase())) &&
        (!issueType || String(ticket.issue_type || "").toLowerCase().includes(issueType.toLowerCase())) &&
        (!status || String(ticket.status || "").toLowerCase().includes(status.toLowerCase())) &&
        (!usersId || String(ticket.users_id || "").toLowerCase().includes(usersId.toLowerCase())) &&
        (!usersName || String(ticket.users_name || "").toLowerCase().includes(usersName.toLowerCase())) &&
        (!ticketOpenFrom || (ticketOpenDate && ticketOpenDate >= new Date(ticketOpenFrom))) &&
        (!ticketOpenTo || (ticketOpenDate && ticketOpenDate <= new Date(ticketOpenTo))) &&
        (!ticketCloseFrom || (ticketCloseDate && ticketCloseDate >= new Date(ticketCloseFrom))) &&
        (!ticketCloseTo || (ticketCloseDate && ticketCloseDate <= new Date(ticketCloseTo))) &&
        (!ticketOnHold || (ticketOnHoldDate && ticketOnHoldDate.toISOString().includes(ticketOnHold))) &&
        (!ticketInProgress || (ticketInProgressDate && ticketInProgressDate.toISOString().includes(ticketInProgress))) &&
        (!ticketPendingVendor || (ticketPendingVendorDate && ticketPendingVendorDate.toISOString().includes(ticketPendingVendor))) &&
        (!ticketTime || (ticketTimeDate && ticketTimeDate.toISOString().includes(ticketTime))) &&
        (!comment || String(ticket.comment || "").toLowerCase().includes(comment.toLowerCase())) &&
        (!userCreateTicket || String(ticket.user_create_ticket || "").toLowerCase().includes(userCreateTicket.toLowerCase())) &&
        (!issueTypeId || String(ticket.issue_type_id || "").toLowerCase().includes(issueTypeId.toLowerCase()))
      );
    });
  }, [filters, tickets, permissions]);

  const handleClearFilter = useCallback(() => {
    if (!permissions?.tickets.list) {
      toast.error("You do not have permission to clear filters.");
      return;
    }
    setFilters({
      stationId: "",
      stationName: "",
      stationType: "",
      province: "",
      issueDescription: "",
      issueType: "",
      status: "",
      usersId: "",
      ticketOpenFrom: "",
      ticketOpenTo: "",
      ticketCloseFrom: "",
      ticketCloseTo: "",
      ticketOnHold: "",
      ticketInProgress: "",
      ticketPendingVendor: "",
      ticketTime: "",
      comment: "",
      userCreateTicket: "",
      issueTypeId: "",
      usersName: "",
    });
    setShowFilterInput(false);
  }, [permissions]);

  const handleExport = useCallback(async (format: "xlsx" | "pdf" | "csv") => {
    if (!permissions?.tickets.list) {
      toast.error("You do not have permission to export tickets.");
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
      const response = await fetch(`/api/data/export-ticket?format=${format}`, {
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
      toast.success(`Successfully exported tickets to ${format.toUpperCase()}`);
      setShowExportOptions(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast.error(errorMessage);
    } finally {
      setIsExporting(false);
    }
  }, [permissions, router]);

  if (isLoading) {
    return (
      <HeaderResponsive>
        <LoadingScreen />
      </HeaderResponsive>
    );
  }

  if (error || !permissions) {
    return (
      <HeaderResponsive>
        <div className="flex w-full">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-full pt-16 transition-all duration-200">
            <div className="text-red-500 text-center text-sm sm:text-base">
              {error || "Failed to load permissions"}
            </div>
          </main>
        </div>
      </HeaderResponsive>
    );
  }

  return (
    <HeaderResponsive>
      <div className="flex w-full">
        <main className="flex-1 mt-17 sm:p-6 lg:p-8 w-full max-w-full pt-16 transition-all duration-200">
          <div className="bg-white shadow rounded-lg p-4 w-full max-w-full">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Tickets</h1>
          </div>
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
                    stationIdFilter={filters.stationId}
                    stationNameFilter={filters.stationName}
                    stationTypeFilter={filters.stationType}
                    provinceFilter={filters.province}
                    issueDescriptionFilter={filters.issueDescription}
                    issueTypeFilter={filters.issueType}
                    statusFilter={filters.status}
                    usersIdFilter={filters.usersId}
                    ticketOpenFrom={filters.ticketOpenFrom}
                    ticketOpenTo={filters.ticketOpenTo}
                    ticketCloseFrom={filters.ticketCloseFrom}
                    ticketCloseTo={filters.ticketCloseTo}
                    ticketOnHoldFilter={filters.ticketOnHold}
                    ticketInProgressFilter={filters.ticketInProgress}
                    ticketPendingVendorFilter={filters.ticketPendingVendor}
                    ticketTimeFilter={filters.ticketTime}
                    commentFilter={filters.comment}
                    userCreateTicketFilter={filters.userCreateTicket}
                    issueTypeIdFilter={filters.issueTypeId}
                    usersNameFilter={filters.usersName}
                    tickets={tickets}
                    onFilterChange={handleFilterChange}
                    onFilter={handleCreateTicket}
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
    </HeaderResponsive>
  );
}
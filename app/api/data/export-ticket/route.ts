import { NextRequest, NextResponse } from "next/server";
import { fetchTickets } from "@/app/pages/admin/ticket/action";
import { utils, write } from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface Ticket {
  id: string;
  ticket_id: string;
  station_name?: string;
  station_type: string;
  province: string;
  issue_description: string;
  issue_type: string;
  status: string;
  users_name?: string;
  ticket_open: string;
  ticket_on_hold?: string;
  ticket_in_progress?: string;
  ticket_pending_vendor?: string;
  ticket_close?: string;
  ticket_time: string;
  comment?: string;
  issue_type_id: string;
  creator_name: string;
}

interface FetchTicketsResponse {
  tickets: (Ticket & { users_name: string; creator_name: string })[];
  error?: string;
}

export async function GET(request: NextRequest) {
  try {
    // Extract and validate token
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized: No token provided" },
        { status: 401 }
      );
    }
    // Add token validation logic here, e.g.:
    // const decoded = await verifyToken(token);
    // if (!decoded) {
    //   return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    // }

    // Extract and validate format
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format")?.toLowerCase();
    const validFormats = ["xlsx", "pdf", "csv"];
    if (!format || !validFormats.includes(format)) {
      return NextResponse.json(
        { error: "Invalid format specified" },
        { status: 400 }
      );
    }

    // Fetch tickets data
    const { tickets, error } = (await fetchTickets()) as FetchTicketsResponse;
    if (error || !tickets) {
      return NextResponse.json(
        { error: error || "Failed to fetch tickets" },
        { status: 500 }
      );
    }

    // Validate and transform data for export
    const data = tickets.map((ticket) => {
      // Sanitize strings to prevent corruption
      const sanitize = (value: any): string => {
        const str = String(value || "N/A")
          .replace(/[\r\n\t]/g, " ")
          .replace(/"/g, '""');
        return str.length > 32767 ? str.substring(0, 32767) : str; // Excel cell limit
      };

      return {
        ID: sanitize(ticket.id),
        "Ticket ID": sanitize(ticket.ticket_id),
        "Station Name": sanitize(ticket.station_name),
        "Station Type": sanitize(ticket.station_type),
        Province: sanitize(ticket.province),
        "Issue Description": sanitize(ticket.issue_description),
        "Issue Type": sanitize(ticket.issue_type),
        Status: sanitize(ticket.status),
        Assign: sanitize(ticket.users_name),
        Opened: ticket.ticket_open
          ? new Date(ticket.ticket_open).toLocaleString()
          : "N/A",
        "On Hold": ticket.ticket_on_hold
          ? new Date(ticket.ticket_on_hold).toLocaleString()
          : "N/A",
        "In Progress": ticket.ticket_in_progress
          ? new Date(ticket.ticket_in_progress).toLocaleString()
          : "N/A",
        "Pending Vendor": ticket.ticket_pending_vendor
          ? new Date(ticket.ticket_pending_vendor).toLocaleString()
          : "N/A",
        Closed: ticket.ticket_close
          ? new Date(ticket.ticket_close).toLocaleString()
          : "N/A",
        "Last Updated": ticket.ticket_time
          ? new Date(ticket.ticket_time).toLocaleString()
          : "N/A",
        Comment: sanitize(ticket.comment),
        "Issue Type ID": sanitize(ticket.issue_type_id),
      };
    });

    // Initialize variables with default values
    let blob: Blob = new Blob([]);
    let contentType: string = "application/octet-stream";
    let fileName: string = "tickets_export";

    if (format === "xlsx") {
      // Generate Excel file
      const ws = utils.json_to_sheet(data);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, "Tickets");
      const buffer = write(wb, { bookType: "xlsx", type: "buffer" });
      blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      contentType =
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      fileName = "tickets_export.xlsx";
    } else if (format === "pdf") {
      // Generate PDF file in landscape mode for more width
      const doc = new jsPDF({ orientation: "landscape" });
      doc.setFontSize(12);
      doc.text("Tickets Export", 14, 20);
      autoTable(doc, {
        head: [Object.keys(data[0] || {})],
        body: data.map((ticket) => Object.values(ticket)),
        startY: 30,
        theme: "grid",
        styles: {
          fontSize: 5,
          cellPadding: 2,
          overflow: "linebreak",
          cellWidth: 16,
        }, // Default width for all columns
        headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0] },
        columnStyles: {
          0: { cellWidth: 15 }, // ID - Slightly narrower
          1: { cellWidth: 25 }, // Ticket ID - Wider for longer IDs
          5: { cellWidth: 40 }, // Issue Description - Wider for text
          15: { cellWidth: 40 }, // Comment - Wider for text
          // Add more indices if needed for other columns
        },
        tableWidth: "auto", // Adjusts to fit content within page width
        margin: { top: 30, left: 5, right: 5 }, // Reduced margins for more table space
        didDrawPage: (data) => {
          doc.setFontSize(8);
          doc.text(
            `Page ${doc.getNumberOfPages()}`,
            14,
            doc.internal.pageSize.height - 10
          );
        },
      });
      const buffer = doc.output("arraybuffer");
      blob = new Blob([buffer], { type: "application/pdf" });
      contentType = "application/pdf";
      fileName = "tickets_export.pdf";
    } else if (format === "csv") {
      // Manual CSV generation
      const headers = Object.keys(data[0] || {}).join(",");
      const rows = data.map((ticket) =>
        Object.values(ticket)
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      );
      const csvContent = [headers, ...rows].join("\n");
      blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
      contentType = "text/csv;charset=utf-8";
      fileName = "tickets_export.csv";
    }

    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during export" },
      { status: 500 }
    );
  }
}

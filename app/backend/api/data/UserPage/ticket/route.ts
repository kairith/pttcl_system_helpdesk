import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { utils, write } from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import jwt from "jsonwebtoken";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: "pttcl_helpdesk_nextjs",
  waitForConnections: true,
  connectionLimit: 10,
});

export async function GET(request: Request) {
  let connection;
  let usersId: string | undefined; // Declare usersId in the outer scope
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format");
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("Missing or invalid Authorization header");
      return NextResponse.json({ error: "Missing or invalid token." }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "");
      console.log("Decoded JWT:", { users_id: decoded.users_id, rules_id: decoded.rules_id });
    } catch (err) {
      console.error("JWT verification failed:", err);
      return NextResponse.json({ error: "Invalid or expired token." }, { status: 401 });
    }
    usersId = decoded.users_id;
    if (!usersId) {
      console.error("No users_id in JWT payload:", decoded);
      return NextResponse.json({ error: "Invalid user ID in token." }, { status: 401 });
    }
    const usersIdStr = String(usersId); // Convert to string for SQL
    console.log("Converted users_id to string:", usersIdStr);
    console.log("Converted users_id to string:", usersIdStr);

    // Fetch user permissions
    connection = await pool.getConnection();
    const [userRows] = await connection.execute(
      `SELECT rules.* 
       FROM tbl_users u 
       LEFT JOIN tbl_users_rules rules ON u.rules_id = rules.rules_id
       WHERE u.users_id = ?`,
      [usersIdStr]
    );
    const userRules = Array.isArray(userRows) && userRows.length > 0 ? userRows[0] as { list_ticket_status?: any } : null;
    if (!userRules) {
      console.error("No user or permissions found for users_id:", usersIdStr);
      return NextResponse.json({ error: "User not found or no permissions assigned." }, { status: 404 });
    }
    if (!userRules.list_ticket_status) {
      console.log("User lacks list_ticket_status permission for users_id:", usersIdStr);
      return NextResponse.json(
        { error: "You do not have permission to view tickets." },
        { status: 403 }
      );
    }

    // Fetch tickets
    const ticketQuery = `
      SELECT t.*, u.users_name, u2.users_name AS creator_name
      FROM tbl_ticket t
      LEFT JOIN tbl_users u ON t.users_id = u.users_id
      LEFT JOIN tbl_users u2 ON t.user_create_ticket = u2.users_id
      WHERE t.users_id = ?
    `;
    interface TicketRow {
      ticket_id?: string;
      station_id?: string;
      station_name?: string;
      issue_type?: string;
      status?: string;
      users_name?: string;
      creator_name?: string;
      [key: string]: any;
    }
    const [ticketRows] = await connection.execute(ticketQuery, [usersIdStr]);
    const tickets: TicketRow[] = Array.isArray(ticketRows) ? ticketRows as TicketRow[] : [];
    console.log("Fetched tickets for users_id:", usersIdStr, "Count:", tickets.length);

    if (!format) {
      return NextResponse.json({ tickets });
    }

    // Handle export
    if (format === "xlsx") {
      const worksheet = utils.json_to_sheet(tickets);
      const workbook = utils.book_new();
      utils.book_append_sheet(workbook, worksheet, "My Tickets");
      utils.sheet_add_aoa(worksheet, [
        ["Ticket ID", "Station ID", "Station Name", "Issue Type", "Status", "Assigned To", "Created By"],
      ], { origin: "A1" });
      const buffer = write(workbook, { bookType: "xlsx", type: "buffer" });
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="my_tickets_export_${usersIdStr}.xlsx"`,
        },
      });
    } else if (format === "pdf") {
      const doc = new jsPDF();
      autoTable(doc, {
        head: [["Ticket ID", "Station ID", "Station Name", "Issue Type", "Status", "Assigned To", "Created By"]],
        body: tickets.map((ticket) => [
          ticket.ticket_id || "N/A",
          ticket.station_id || "N/A",
          ticket.station_name || "N/A",
          ticket.issue_type || "N/A",
          ticket.status || "N/A",
          ticket.users_name || "N/A",
          ticket.creator_name || "N/A",
        ]),
        startY: 20,
        theme: "grid",
        headStyles: { fillColor: [0, 102, 204] },
      });
      doc.text("My Tickets", 14, 15);
      const buffer = doc.output("arraybuffer");
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="my_tickets_export_${usersIdStr}.pdf"`,
        },
      });
    } else if (format === "csv") {
      const csv = tickets.map((ticket) =>
        [
          ticket.ticket_id || "",
          ticket.station_id || "",
          ticket.station_name || "",
          ticket.issue_type || "",
          ticket.status || "",
          ticket.users_name || "",
          ticket.creator_name || "",
        ].map((field) => `"${String(field).replace(/"/g, '""')}"`).join(",")
      ).join("\n");
      const csvWithHeader = `"Ticket ID","Station ID","Station Name","Issue Type","Status","Assigned To","Created By"\n${csv}`;
      return new NextResponse(csvWithHeader, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="my_tickets_export_${usersIdStr}.csv"`,
        },
      });
    }

    console.error("Invalid export format:", format);
    return NextResponse.json({ error: "Invalid format" }, { status: 400 });
  } catch (error) {
    console.error("Error processing request for users_id:", usersId, "Error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  } finally {
    if (connection) {
      try {
        connection.release();
      } catch (releaseError) {
        console.error("Error releasing connection:", releaseError);
      }
    }
  }
}
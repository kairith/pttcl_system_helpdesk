import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";
import { dbConfig } from "@/app/database/db-config";



export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  let connection;
  try {
    const params = await context.params;
    const authHeader = request.headers.get("authorization");
    console.log("Authorization Header:", authHeader);
    if (!authHeader) {
      return NextResponse.json({ error: "No authorization header provided" }, { status: 401 });
    }

    const token = authHeader.startsWith("Bearer ") ? authHeader.replace("Bearer ", "") : authHeader;
    console.log("Extracted Token:", token);
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET is not set in environment variables");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const decoded = jwt.verify(token, secret) as any;
    console.log("Decoded Token:", decoded);
    const userId = decoded.users_id ?? decoded.userId ?? decoded.id ?? decoded.sub;
    if (!userId) {
      
      return NextResponse.json({ error: "Invalid token: userId missing" }, { status: 401 });
    }

    connection = await mysql.createConnection(dbConfig);

    // Fetch ticket details
    const [rows] = await connection.execute(
      "SELECT * FROM tbl_ticket WHERE id = ?",
      [params.id]
    );
    const ticket = (rows as any[])[0];

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Fetch available issue types from tbl_ticket
    const [issueTypesRows] = await connection.execute(
      "SELECT DISTINCT issue_type FROM tbl_ticket WHERE issue_type IS NOT NULL"
    );
    const availableIssueTypes = (issueTypesRows as any[]).map((type) => ({
      id: type.issue_type,
      name: type.issue_type,
    }));

    // Fetch available users for assignment
    const [usersRows] = await connection.execute(
      "SELECT users_id, users_name FROM tbl_users"
    );
    const availableUsers = (usersRows as any[]).map((user) => ({
      id: user.users_id,
      name: user.users_name,
    }));

    return NextResponse.json({ ticket, availableIssueTypes, availableUsers }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching ticket:", error);
    if (error.name === "JsonWebTokenError") {
      return NextResponse.json({ error: "Invalid or malformed token" }, { status: 401 });
    }
    return NextResponse.json({ error: `Failed to fetch ticket: ${error.message}` }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  let connection;
  try {
    const params = await context.params;
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "No authorization header provided" }, { status: 401 });
    }

    const token = authHeader.startsWith("Bearer ") ? authHeader.replace("Bearer ", "") : authHeader;
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const decoded = jwt.verify(token, secret) as any;
    const userId = decoded.users_id ?? decoded.userId ?? decoded.id ?? decoded.sub;
    if (!userId) {
     
      return NextResponse.json({ error: "Invalid token: userId missing" }, { status: 401 });
    }

    connection = await mysql.createConnection(dbConfig);

    const [ticketRows] = await connection.execute(
      "SELECT * FROM tbl_ticket WHERE id = ?",
      [params.id]
    );
    const ticket = (ticketRows as any[])[0];
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const formData = await request.json();
    const { station_id, station_name, users_name, issue_type, issue_description, comment, status } = formData;

    if (!station_id || !station_name || !issue_type || !issue_description || !status) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }
    if (!["open", "in progress", "close"].includes(status.toLowerCase())) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Validate issue_type against available options from tbl_ticket
    const [issueTypesRows] = await connection.execute(
      "SELECT DISTINCT issue_type FROM tbl_ticket WHERE issue_type IS NOT NULL"
    );
    const validIssueTypes = (issueTypesRows as any[]).map((type) => type.issue_type);
    if (!validIssueTypes.includes(issue_type)) {
      return NextResponse.json({ error: "Invalid issue type" }, { status: 400 });
    }

    // Look up users_id based on users_name
    let assignedUserId = null;
    if (users_name) {
      const [userRows] = await connection.execute(
        "SELECT users_id FROM tbl_users WHERE users_name = ?",
        [users_name]
      );
      const user = (userRows as any[])[0];
      if (user) {
        assignedUserId = user.users_id;
      } else {
        return NextResponse.json({ error: "Invalid user name" }, { status: 400 });
      }
    }

    await connection.beginTransaction();

    const updateQuery = `
      UPDATE tbl_ticket
      SET station_id = ?, station_name = ?, users_id = ?, issue_type = ?, issue_description = ?, comment = ?, status = ?, ticket_time = NOW()
      WHERE id = ?
    `;
    await connection.execute(updateQuery, [
      station_id,
      station_name,
      assignedUserId || ticket.users_id, // Use existing users_id if no new assignment
      issue_type,
      issue_description,
      comment,
      status,
      params.id,
    ]);

    await connection.commit();

    return NextResponse.json({ message: "Ticket updated successfully" }, { status: 200 });
  } catch (error: any) {
    if (connection) await connection.rollback();
    console.error("Error updating ticket:", error);
    if (error.name === "JsonWebTokenError") {
      return NextResponse.json({ error: "Invalid or malformed token" }, { status: 401 });
    }
    return NextResponse.json({ error: `Failed to update ticket: ${error.message}` }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}
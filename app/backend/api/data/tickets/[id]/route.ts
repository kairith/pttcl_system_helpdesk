import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";
import { dbConfig } from "@/app/database/db-config";

// check by id

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  let connection;
  try {
    const params = await context.params;
    const authHeader = request.headers.get("authorization");
    // console.log("Authorization Header:", authHeader);
    if (!authHeader) {
      return NextResponse.json({ error: "No authorization header provided" }, { status: 401 });
    }

    const token = authHeader.startsWith("Bearer ") ? authHeader.replace("Bearer ", "") : authHeader;
    // console.log("Extracted Token:", token);
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET is not set in environment variables");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const decoded = jwt.verify(token, secret) as any;
    // console.log("Decoded Token:", decoded);
    const userId = decoded.users_id ?? decoded.userId ?? decoded.id ?? decoded.sub;
    if (!userId) {
      
      return NextResponse.json({ error: "Invalid token: userId missing" }, { status: 401 });
    }

    connection = await mysql.createConnection(dbConfig);

    // Fetch ticket details, joined to the assignee's name (tbl_ticket only
    // stores users_id — without this join the edit form's Assign dropdown
    // has no way to know who's currently assigned).
    const [rows] = await connection.execute(
      `SELECT t.*, u.users_name AS users_name
       FROM tbl_ticket t
       LEFT JOIN tbl_users u ON t.users_id = u.users_id
       WHERE t.id = ?`,
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

    // Fetch available departments from tbl_departments
    const [departmentsRows] = await connection.execute(
      "SELECT department_name FROM tbl_departments ORDER BY department_name"
    );
    const availableDepartments = (departmentsRows as any[]).map((dept) => dept.department_name);

    // Fetch the requester's own assignment permissions, so the assignee list
    // (and the frontend's read-only/editable decision) reflect what they're
    // actually allowed to do: unrestricted, department-scoped, or not at all.
    const [requesterRows] = await connection.execute(
      `SELECT r.list_ticket_assign, r.scope_to_department, u.department_id
       FROM tbl_users u
       LEFT JOIN tbl_users_rules r ON u.rules_id = r.rules_id
       WHERE u.users_id = ?`,
      [userId]
    );
    const requester = (requesterRows as any[])[0] || {};
    const canAssign = !!requester.list_ticket_assign;
    const assignScopedToDepartment = !!requester.scope_to_department;

    // Fetch available users for assignment, scoped to the requester's own
    // department when their role restricts them to it.
    let usersRows;
    if (canAssign && assignScopedToDepartment && requester.department_id) {
      [usersRows] = await connection.execute(
        "SELECT users_id, users_name FROM tbl_users WHERE department_id = ?",
        [requester.department_id]
      );
    } else if (canAssign) {
      [usersRows] = await connection.execute("SELECT users_id, users_name FROM tbl_users");
    } else {
      usersRows = [];
    }
    const availableUsers = (usersRows as any[]).map((user) => ({
      id: user.users_id,
      name: user.users_name,
    }));

    return NextResponse.json(
      { ticket, availableIssueTypes, availableDepartments, availableUsers, canAssign },
      { status: 200 }
    );
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
    const { station_id, station_name, users_name, issue_type, issue_description, department, comment, status } = formData;

    if (!station_id || !station_name || !issue_type || !issue_description || !department || !status) {
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

    // Validate department against tbl_departments
    const [departmentRows] = await connection.execute(
      "SELECT department_name FROM tbl_departments WHERE department_name = ?",
      [department]
    );
    if ((departmentRows as any[]).length === 0) {
      return NextResponse.json({ error: "Invalid department" }, { status: 400 });
    }

    // Look up users_id (and department) based on users_name
    let assignedUserId = null;
    if (users_name) {
      const [userRows] = await connection.execute(
        "SELECT users_id, department_id FROM tbl_users WHERE users_name = ?",
        [users_name]
      );
      const user = (userRows as any[])[0];
      if (user) {
        assignedUserId = user.users_id;

        // Only enforce assignment rules if this is actually a reassignment.
        if (assignedUserId !== ticket.users_id) {
          const [requesterRows] = await connection.execute(
            `SELECT r.list_ticket_assign, r.scope_to_department, u.department_id
             FROM tbl_users u
             LEFT JOIN tbl_users_rules r ON u.rules_id = r.rules_id
             WHERE u.users_id = ?`,
            [userId]
          );
          const requester = (requesterRows as any[])[0];

          if (!requester || !requester.list_ticket_assign) {
            return NextResponse.json(
              { error: "You do not have permission to assign tickets." },
              { status: 403 }
            );
          }

          if (requester.scope_to_department) {
            if (!requester.department_id || user.department_id !== requester.department_id) {
              return NextResponse.json(
                { error: "You can only assign tickets to users in your own department." },
                { status: 403 }
              );
            }
          }
        }
      } else {
        return NextResponse.json({ error: "Invalid user name" }, { status: 400 });
      }
    }

    await connection.beginTransaction();

    const updateQuery = `
      UPDATE tbl_ticket
      SET station_id = ?, station_name = ?, users_id = ?, issue_type = ?, issue_description = ?, department = ?, comment = ?, status = ?, ticket_time = NOW()
      WHERE id = ?
    `;
    await connection.execute(updateQuery, [
      station_id,
      station_name,
      assignedUserId || ticket.users_id, // Use existing users_id if no new assignment
      issue_type,
      issue_description,
      department,
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
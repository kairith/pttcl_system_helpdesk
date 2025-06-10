import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";
import { dbConfig } from "@/app/database/db-config";

export async function POST(request: Request) {
  let connection;
  try {
    // Authenticate user
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required: No token provided" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default-secret") as any;
    console.log("Decoded JWT payload:", decoded);
    const userId = decoded.users_id ?? decoded.userId ?? decoded.id ?? decoded.sub;
    if (!userId) {
      return NextResponse.json(
        { error: "Invalid token: userId missing (tried users_id, userId, id, sub)" },
        { status: 401 }
      );
    }

    // Connect to database
    connection = await mysql.createConnection(dbConfig);

    // Verify user exists in tbl_users
    const [userRows] = await connection.execute(
      "SELECT users_id FROM tbl_users WHERE users_id = ?",
      [userId]
    );
    if ((userRows as any[]).length === 0) {
      return NextResponse.json(
        { error: "User not found: Invalid user_create_ticket ID" },
        { status: 400 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const stationId = formData.get("station_id") as string;
    const stationName = formData.get("station_name") as string;
    const stationType = formData.get("station_type") as string;
    const province = formData.get("province") as string;
    const issueOn = formData.get("issue_on") as string;
    const issueType = formData.get("issue_type") as string;
    const issueDescription = formData.get("issue_description") as string;
    const imagePath = formData.get("image") as string | null;

    // Validate inputs
    if (!stationId || !stationName || !stationType || !province || !issueOn || !issueType || !issueDescription) {
      return NextResponse.json({ error: "All fields (except image) are required" }, { status: 400 });
    }
    if (!["PTT_Digital", "Third_Party"].includes(issueOn)) {
      return NextResponse.json({ error: "Invalid issue_on: must be PTT_Digital or Third_Party" }, { status: 400 });
    }

    // Validate issue_type against tbl_issue_types
    const [issueTypeRows] = await connection.execute(
      "SELECT id FROM tbl_issue_types WHERE issue_type = ? AND category = ?",
      [issueType, issueOn]
    );
    const issueTypeRecord = (issueTypeRows as any[])[0];
    if (!issueTypeRecord) {
      const validIssueTypes = issueOn === "PTT_Digital" ? ["Software", "Hardware"] : ["ATG", "ABA", "Fleetcard", "Network", "Dispenser"];
      return NextResponse.json(
        { error: `Invalid issue_type: must be one of ${validIssueTypes.join(", ")} for category ${issueOn}` },
        { status: 400 }
      );
    }
    const issueTypeId = issueTypeRecord.id;

    // Validate image path
    if (imagePath && !imagePath.startsWith("/uploads/ticket_image/")) {
      return NextResponse.json({ error: "Invalid image path format" }, { status: 400 });
    }

    // Generate ticket_id with monthly sequence (POSYYMMXXXXX)
    const now = new Date();
    console.log("Current Date:", now.toISOString().split("T")[0]); // Log only date (e.g., 2025-06-10)
    const year = now.getFullYear().toString().slice(-2); // YY (e.g., 25)
    const month = (now.getMonth() + 1).toString().padStart(2, "0"); // MM (e.g., 06)
    console.log("Year:", year, "Month:", month); // Debug: Log year and month
    const prefix = `POS${year}${month}`; // e.g., POS2506
    console.log("Prefix:", prefix); // Debug: Log the prefix

    // Find the highest sequence number for the current month, ensuring 5-digit extraction
    const [maxRows] = await connection.execute(
      "SELECT MAX(CAST(RIGHT(ticket_id, 5) AS UNSIGNED)) as max_seq FROM tbl_ticket WHERE ticket_id LIKE ?",
      [`${prefix}%`]
    );
    const maxSeq = (maxRows as any[])[0].max_seq || 0;
    console.log("Max Sequence:", maxSeq); // Debug: Log the max sequence
    const sequence = (maxSeq + 1).toString().padStart(6, "0"); // XXXXX 0-1,1-2,2-3,3-4,4-5,5-6 (e.g., 00003)
    console.log("Sequence:", sequence); // Debug: Log the sequence
    const ticketId = `${prefix}${sequence}`; // e.g., POS2506000003
    console.log("Generated ticketId:", ticketId); // Debug: Log the final ticketId

    // Start transaction
    await connection.beginTransaction();

    // Insert ticket
    const ticketQuery = `
      INSERT INTO tbl_ticket (ticket_id, user_create_ticket, station_id, station_name, station_type, province, issue_description, issue_type, issue_type_id, ticket_open, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'Open')
    `;
    await connection.execute(ticketQuery, [
      ticketId,
      userId,
      stationId,
      stationName,
      stationType,
      province,
      issueDescription,
      issueType,
      issueTypeId,
    ]);

    // Insert image path if provided
    if (imagePath) {
      const imageQuery = `
        INSERT INTO tbl_ticket_images (ticket_id, image_path)
        VALUES (?, ?)
      `;
      await connection.execute(imageQuery, [ticketId, imagePath]);
    }

    // Commit transaction
    await connection.commit();

    return NextResponse.json(
      { message: "Ticket created successfully!", ticketId, imagePath: imagePath || null },
      { status: 201 }
    );
  } catch (error: any) {
    if (connection) await connection.rollback();
    console.error("Ticket creation error:", {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlMessage: error.sqlMessage,
      stack: error.stack,
    });
    if (error.name === "JsonWebTokenError") {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    if (error.code === "ER_NO_SUCH_TABLE") {
      return NextResponse.json({ error: `Table not found: ${error.sqlMessage}` }, { status: 500 });
    }
    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return NextResponse.json({ error: "Failed to create ticket: Invalid ticket_id reference" }, { status: 400 });
    }
    return NextResponse.json({ error: `Failed to create ticket: ${error.message}` }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}
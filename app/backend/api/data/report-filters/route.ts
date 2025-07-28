
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import mysql, { RowDataPacket } from "mysql2/promise";
import { dbConfig } from "@/app/database/db-config";

interface StatusRow extends RowDataPacket {
  status: string;
}

interface IssueTypeRow extends RowDataPacket {
  issue_type: string;
}

interface UserRow extends RowDataPacket {
  users_id: string;
  users_name: string;
}

export async function GET(request: Request) {
  let connection;
  try {
    console.log("GET: Fetching report filters");
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("GET: Unauthorized: Missing or invalid Authorization header");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      console.log("GET: Unauthorized: No token provided");
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("GET: JWT_SECRET is not configured");
      throw new Error("JWT_SECRET is not configured");
    }
    jwt.verify(token, secret); // Verify token

    connection = await mysql.createConnection(dbConfig);

    const [statusRows] = await connection.execute<StatusRow[]>(
      "SELECT DISTINCT status FROM tbl_ticket WHERE status IS NOT NULL AND status != '' ORDER BY status"
    );
    const [issueTypeRows] = await connection.execute<IssueTypeRow[]>(
      "SELECT DISTINCT issue_type FROM tbl_ticket WHERE issue_type IS NOT NULL AND issue_type != '' ORDER BY issue_type"
    );
    const [userRows] = await connection.execute<UserRow[]>(
      `SELECT u.users_id, u.users_name
       FROM tbl_users u
       ORDER BY u.users_name`
    );

    const statuses = statusRows.map((row) => row.status);
    const issueTypes = issueTypeRows.map((row) => row.issue_type);
    const users = userRows.map((row) => ({ users_id: String(row.users_id), users_name: row.users_name }));

    console.log("Raw statusRows:", statusRows);
    console.log("Raw issueTypeRows:", issueTypeRows);
    console.log("Raw userRows:", userRows);
    console.log(`GET: Fetched ${statuses.length} statuses, ${issueTypes.length} issue types, ${users.length} users`);

    return NextResponse.json({ statuses, issueTypes, users }, { status: 200 });
  } catch (error) {
    console.error("GET: Error fetching filters:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}

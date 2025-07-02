
// app/api/data/report-filters/route.ts
import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { dbConfig } from "@/app/database/db-config";
// route for filter in admin/report page
export async function GET(request: Request) {
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

    const connection = await mysql.createConnection(dbConfig);

    const [statusRows] = await connection.execute(
      "SELECT DISTINCT status FROM tbl_ticket WHERE status IS NOT NULL AND status != '' ORDER BY status"
    );
    const [issueTypeRows] = await connection.execute(
      "SELECT DISTINCT issue_type FROM tbl_ticket WHERE issue_type IS NOT NULL AND issue_type != '' ORDER BY issue_type"
    );
    const [userRows] = await connection.execute(
      `SELECT DISTINCT u.users_id, u.users_name
       FROM tbl_users u
       INNER JOIN tbl_ticket t ON u.users_id = t.users_id
       WHERE t.users_id IS NOT NULL AND t.users_id != ''
       ORDER BY u.users_name`
    );

    await connection.end();

    const statuses = (statusRows as any[]).map((row: any) => row.status);
    const issueTypes = (issueTypeRows as any[]).map((row: any) => row.issue_type);
    const users = (userRows as any[]).map((row: any) => ({ id: row.users_id, users_name: row.users_name }));

    console.log(`GET: Fetched ${statuses.length} statuses, ${issueTypes.length} issue types, ${users.length} users`);
    return NextResponse.json({ statuses, issueTypes, users }, { status: 200 });
  } catch (error) {
    console.error("GET: Error fetching filters:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

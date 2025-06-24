
// app/api/data/reports/route.ts
import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { dbConfig } from "@/app/database/db-config";
// display report
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as "status" | "issue_type";
  const status = searchParams.get("status") || "";
  const issue_type = searchParams.get("issue_type") || "";
  const sla_category = searchParams.get("sla_category") || "";
  const user_id = searchParams.get("user_id") || "";
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";

  try {
    console.log(`GET: Fetching report type=${type}, filters: status=${status}, issue_type=${issue_type}, sla_category=${sla_category}, user_id=${user_id}, start=${startDate}, end=${endDate}`);
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("GET: Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      console.log("GET: No token provided");
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const connection = await mysql.createConnection(dbConfig);

    let query = "";
    let params: any[] = [];

    if (type === "status") {
      query = `
        SELECT status AS label, COUNT(*) AS count
        FROM tbl_ticket
        WHERE 1=1
      `;
      if (status) {
        query += " AND status = ?";
        params.push(status);
      }
      if (issue_type) {
        query += " AND issue_type = ?";
        params.push(issue_type);
      }
      if (sla_category) {
        query += " AND SLA_category = ?";
        params.push(sla_category);
      }
      if (user_id) {
        query += " AND users_id = ?";
        params.push(user_id);
      }
      if (startDate) {
        query += " AND ticket_open >= ?";
        params.push(startDate);
      }
      if (endDate) {
        query += " AND ticket_open <= ?";
        params.push(`${endDate} 23:59:59`);
      }
      query += " GROUP BY status ORDER BY status";
    } else if (type === "issue_type") {
      query = `
        SELECT issue_type AS label, COUNT(*) AS count
        FROM tbl_ticket
        WHERE 1=1
      `;
      if (status) {
        query += " AND status = ?";
        params.push(status);
      }
      if (issue_type) {
        query += " AND issue_type = ?";
        params.push(issue_type);
      }
      if (sla_category) {
        query += " AND SLA_category = ?";
        params.push(sla_category);
      }
      if (user_id) {
        query += " AND users_id = ?";
        params.push(user_id);
      }
      if (startDate) {
        query += " AND ticket_open >= ?";
        params.push(startDate);
      }
      if (endDate) {
        query += " AND ticket_open <= ?";
        params.push(`${endDate} 23:59:59`);
      }
      query += " GROUP BY issue_type ORDER BY issue_type";
    } else {
      await connection.end();
      return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
    }

    const [rows] = await connection.execute<any[]>(query, params);
    await connection.end();

    const data = rows.map((row: any) => ({
      label: row.label,
      count: parseInt(row.count, 10),
    }));

    console.log(`GET: Fetched ${data.length} rows`);
    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("GET: Error fetching report:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

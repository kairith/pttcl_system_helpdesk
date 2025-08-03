
// app/api/data/reports-pivot/route.ts
import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { dbConfig } from "@/app/database/db-config";
// pivot chart in report
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as "status" | "issue_type";
  const status = searchParams.get("status") || "";
  const issue_type = searchParams.get("issue_type") || "";
  const user_id = searchParams.get("user_id") || "";
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";

  try {
    // console.log(`GET: Fetching pivot report type=${type}, filters: status=${status}, issue_type=${issue_type}, user_id=${user_id}, start=${startDate}, end=${endDate}`);
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // console.log("GET: Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      // console.log("GET: No token provided");
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const connection = await mysql.createConnection(dbConfig);

    let query = "";
    let params: any[] = [];

    if (type === "status") {
      query = `
        SELECT t.status AS x_label, t.issue_type AS stack_label, COUNT(*) AS count
        FROM tbl_ticket t
        WHERE 1=1
      `;
    } else if (type === "issue_type") {
      query = `
        SELECT t.issue_type AS x_label, t.status AS stack_label, COUNT(*) AS count
        FROM tbl_ticket t
        WHERE 1=1
      `;
    } else {
      await connection.end();
      return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
    }

    if (status) {
      query += " AND t.status = ?";
      params.push(status);
    }
    if (issue_type) {
      query += " AND t.issue_type = ?";
      params.push(issue_type);
    }
    if (user_id) {
      query += " AND t.users_id = ?";
      params.push(user_id);
    }
    if (startDate) {
      query += " AND t.ticket_open >= ?";
      params.push(startDate);
    }
    if (endDate) {
      query += " AND t.ticket_open <= ?";
      params.push(`${endDate} 23:59:59`);
    }

    query += " GROUP BY x_label, stack_label ORDER BY x_label, stack_label";

    const [rows] = await connection.execute(query, params);
    await connection.end();

    // Ensure rows is typed as an array of objects
    const typedRows = rows as Array<{ x_label: string; stack_label: string; count: number }>;

    // Process data for stacked bar chart
    const xLabels = [...new Set(typedRows.map((row) => row.x_label))].sort();
    const stackLabels = [...new Set(typedRows.map((row) => row.stack_label))].sort();
    const colors = [
      { bg: "#3b82f6", border: "#2563eb" },
      { bg: "#10b981", border: "#059669" },
      { bg: "#f59e0b", border: "#d97706" },
      { bg: "#ef4444", border: "#dc2626" },
      { bg: "#8b5cf6", border: "#7c3aed" },
    ];

    const datasets = stackLabels.map((stack, index) => {
      const data = xLabels.map((xLabel) => {
        const row = typedRows.find(
          (r: any) => r.x_label === xLabel && r.stack_label === stack
        );
        return row ? row.count : 0;
      });
      return {
        label: stack,
        data,
        backgroundColor: colors[index % colors.length].bg,
        borderColor: colors[index % colors.length].border,
        borderWidth: 0.5,
      };
    });

    const data = { labels: xLabels, datasets };

    // console.log(`GET: Fetched pivot data with ${xLabels.length} labels and ${datasets.length} stacks`);
    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("GET: Error fetching pivot report:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

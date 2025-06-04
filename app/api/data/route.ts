import { NextResponse } from "next/server";
import { RowDataPacket } from "mysql2";
import { getConnection } from "@/app/lib/db";
import { TicketCount } from "@/app/lib/types";

export async function GET() {
  try {
    const connection = await getConnection();
    const [rows] = await connection.execute<RowDataPacket[]>(
      `
      WITH months AS (
        SELECT 'Jan' AS month, 1 AS month_num
        UNION SELECT 'Feb', 2
        UNION SELECT 'Mar', 3
        UNION SELECT 'Apr', 4
        UNION SELECT 'May', 5
        UNION SELECT 'Jun', 6
        UNION SELECT 'Jul', 7
        UNION SELECT 'Aug', 8
        UNION SELECT 'Sep', 9
        UNION SELECT 'Oct', 10
        UNION SELECT 'Nov', 11
        UNION SELECT 'Dec', 12
      )
      SELECT 
        months.month AS month,
        COALESCE(COUNT(tbl_ticket.ticket_open), 0) AS value
      FROM months
      LEFT JOIN tbl_ticket 
        ON DATE_FORMAT(tbl_ticket.ticket_open, '%b') = months.month
        AND YEAR(tbl_ticket.ticket_open) = 2024
      GROUP BY months.month, months.month_num
      ORDER BY months.month_num
      `,
      []
    );
    await connection.end();
    return NextResponse.json(rows as TicketCount[]);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Failed to fetch chart data" }, { status: 500 });
  }
}
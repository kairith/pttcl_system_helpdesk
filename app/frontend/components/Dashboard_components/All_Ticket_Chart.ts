"use server";

import mysql from "mysql2/promise";
import { RowDataPacket } from "mysql2";
import { dbConfig } from "@/app/database/db-config";

export interface TicketData { // Added 'export'
  id: number;
  ticket_id: string;
  province: string;
  status?: string;
  station_id: string;
  station_type: string;
  issue_description: string;
  issue_type: string;
  ticket_open?: string;
  users_name?: string;
}

interface ChartData {
  month: string;
  value: number;
}

interface BarChartData {
  issue_type: string;
  count: number;
}

interface DoughnutChartData {
  provider: string;
  percentage: number;
}

interface StatsData {
  open: number;
  on_hold: number;
  in_progress: number;
  close: number;
}

export async function fetchTicketsCount(undefined: undefined, selectedYear: string) {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const whereClause = " WHERE ticket_open IS NOT NULL";
    const params: string[] = [];

    const [rows] = await connection.execute<RowDataPacket[]>(
      `SELECT 
         SUM(CASE WHEN LOWER(status) = 'open' THEN 1 ELSE 0 END) AS open,
         SUM(CASE WHEN LOWER(status) = 'on hold' THEN 1 ELSE 0 END) AS on_hold,
         SUM(CASE WHEN LOWER(status) = 'in progress' THEN 1 ELSE 0 END) AS in_progress,
         SUM(CASE WHEN LOWER(status) = 'close' THEN 1 ELSE 0 END) AS status_close
       FROM tbl_ticket${whereClause}`,
      params
    );

    await connection.end();

    console.log(`fetchTicketsCount:`, rows[0]);

    return {
      stats: {
        open: rows[0].open || 0,
        on_hold: rows[0].on_hold || 0,
        in_progress: rows[0].in_progress || 0,
        close: rows[0].status_close || 0,
      },
      error: null,
    };
  } catch (err) {
    const errorMessage = `Error fetching ticket counts: ${(err as Error).message}`;
    console.error(errorMessage);
    return {
      stats: { open: 0, on_hold: 0, in_progress: 0, close: 0 },
      error: errorMessage,
    };
  }
}

export async function fetchDashboardData(period?: string, selectedYear?: string, limit: number = 1000) {
  try {
    const connection = await mysql.createConnection(dbConfig);
    let whereClause = " WHERE ticket_open IS NOT NULL";
    const params: string[] = [];
    if (selectedYear && selectedYear !== "ALL") {
      whereClause += " AND YEAR(ticket_open) = ?";
      params.push(selectedYear);
    } else if (selectedYear === "ALL") {
      whereClause += " AND YEAR(ticket_open) IN (2024, 2025)";
    }
    if (period) {
      whereClause += " AND DATE_FORMAT(ticket_open, '%M') = ?";
      params.push(period);
    }

    const [tickets] = await connection.execute<RowDataPacket[]>(
      `SELECT 
         t.id, t.ticket_id, t.province, t.status, t.station_id, t.station_type, 
         t.issue_description, t.issue_type, t.ticket_open,
         COALESCE(u.users_name, 'Not Assigned') AS users_name
       FROM tbl_ticket t
       LEFT JOIN tbl_users u ON t.users_id = u.users_id
       ${whereClause}
       ORDER BY t.ticket_open DESC
       LIMIT ?`,
      [...params, limit.toString()]
    );

    const [totalCount] = await connection.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS total FROM tbl_ticket${whereClause}`,
      params
    );

    const [chartData] = await connection.execute<RowDataPacket[]>(
      `SELECT 
         DATE_FORMAT(ticket_open, '%b') AS month, 
         COUNT(*) AS value 
       FROM tbl_ticket 
       ${whereClause}
       GROUP BY month
       ORDER BY FIELD(month, 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                           'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec')`,
      params
    );

    const [barChartData] = await connection.execute<RowDataPacket[]>(
      `SELECT COALESCE(issue_type, 'Unknown') AS issue_type, COUNT(*) AS count
       FROM tbl_ticket
       ${whereClause}
       GROUP BY issue_type
       ORDER BY FIELD(UPPER(issue_type), 'SOFTWARE', 'HARDWARE', 'NETWORK', 'DISPENSER', 'ABA', 'ATG', 'FLEETCARD', 'POWER')`,
      params
    );

    const [doughnutChartData] = await connection.execute<RowDataPacket[]>(
      `SELECT 
         CASE 
           WHEN UPPER(issue_type) IN ('HARDWARE', 'SOFTWARE') THEN 'PTT_Digital'
           WHEN UPPER(issue_type) IN ('DISPENSER', 'ABA', 'NETWORK', 'ATG', 'FLEETCARD', 'POWER') THEN 'Third_Party'
           ELSE 'Unknown'
         END AS provider,
         ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) AS percentage
       FROM tbl_ticket
       ${whereClause}
       GROUP BY CASE 
         WHEN UPPER(issue_type) IN ('HARDWARE', 'SOFTWARE') THEN 'PTT_Digital'
         WHEN UPPER(issue_type) IN ('DISPENSER', 'ABA', 'NETWORK', 'ATG', 'FLEETCARD', 'POWER') THEN 'Third_Party'
         ELSE 'Unknown'
       END`,
      params
    );

    await connection.end();

    console.log(`fetchDashboardData (year: ${selectedYear || "ALL"}, period: ${period || "none"}, limit: ${limit}) - Total: ${totalCount[0].total}, Tickets: ${tickets.length}, BarChart: ${barChartData.length}, DoughnutChart: ${doughnutChartData.length}`);

    return {
      ticketData: tickets as TicketData[],
      chartData: chartData as ChartData[],
      barChartData: barChartData as BarChartData[],
      doughnutChartData: doughnutChartData as DoughnutChartData[],
      error: null,
    };
  } catch (err) {
    const errorMessage = `Error fetching dashboard data (year: ${selectedYear || "ALL"}, period: ${period || "none"}, limit: ${limit}): ${(err as Error).message}`;
    console.error(errorMessage);
    return {
      ticketData: [],
      chartData: [],
      barChartData: [],
      doughnutChartData: [],
      error: errorMessage,
    };
  }
}
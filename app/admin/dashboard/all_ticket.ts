// actions/tickets.ts
"use server";

import mysql from "mysql2/promise";
import { RowDataPacket } from "mysql2";

interface TicketData {
  id: number;
  ticket_id: string;
  province: string;
  station_id: string;
  station_type: string;
  issue_description: string;
  issue_type: string;
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

// Fetch ticket counts for stats cards
export async function fetchTicketsCount(period?: string) {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "1122",
      database: process.env.DB_DATABASE || "pttcl_helpdesk_nextjs",
    });

    let whereClause = "";
    const params: string[] = [];
    // Temporarily disable period filtering to fetch all data
    // if (period) {
    //   whereClause = ' WHERE DATE_FORMAT(ticket_time, "%M") = ?';
    //   params.push(period);
    // }

    // Use status column instead of timestamps
    const [rows] = await connection.execute<RowDataPacket[]>(
      `SELECT 
         SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) AS open,
         SUM(CASE WHEN status = 'on_hold' THEN 1 ELSE 0 END) AS on_hold,
         SUM(CASE WHEN status = 'in progress' THEN 1 ELSE 0 END) AS in_progress,
         SUM(CASE WHEN status = 'Close' THEN 1 ELSE 0 END) AS close
       FROM tbl_ticket${whereClause}`,
      params
    );

    console.log("fetchTicketsCount results:", rows);

    await connection.end();

    return {
      stats: {
        open: rows[0].open || 0,
        on_hold: rows[0].on_hold || 0,
        in_progress: rows[0].in_progress || 0,
        close: rows[0].close || 0,
      },
      error: null,
    };
  } catch (err) {
    const errorMessage = `Error fetching stats: ${(err as Error).message}`;
    console.error(errorMessage);
    return {
      stats: { open: 0, on_hold: 0, in_progress: 0, close: 0 },
      error: errorMessage,
    };
  }
}

// Fetch tickets, chart data, bar chart data, and doughnut chart data
export async function fetchDashboardData(period?: string) {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "1122",
      database: process.env.DB_DATABASE || "pttcl_helpdesk_nextjs",
    });

    let whereClause = "";
    const params: string[] = [];
    // Temporarily disable period filtering
    // if (period) {
    //   whereClause = ' WHERE DATE_FORMAT(ticket_time, "%M") = ?';
    //   params.push(period);
    // }

    // Fetch all tickets
    const [tickets] = await connection.execute<RowDataPacket[]>(
      `SELECT id, ticket_id, status, station_id, station_type, issue_description, issue_type 
       FROM tbl_ticket${whereClause}`,
      params
    );

    // Fetch chart data (handle NULL ticket_time)
const [chartData] = await connection.execute<RowDataPacket[]>(
  `SELECT 
     COALESCE(DATE_FORMAT(ticket_time, '%b'), 'All') AS month, 
     COUNT(*) AS value 
   FROM tbl_ticket 
   GROUP BY COALESCE(DATE_FORMAT(ticket_time, '%b'), 'All') 
   ORDER BY MIN(COALESCE(ticket_time, NOW()))`,
  []
);


    // Fetch bar chart data (handle NULL issue_type) // no filter, or only filters that allow NULLs

const [barChartData] = await connection.execute<RowDataPacket[]>(`
  SELECT COALESCE(issue_type, 'Unknown') AS issue_type, COUNT(*) AS count
  FROM tbl_ticket
  ${whereClause}
  GROUP BY issue_type
  ORDER BY FIELD(issue_type, 'software', 'hardware', 'network', 'dispenser', 'ABA', 'ATG', 'Fleetcard')
`);


    // Fetch doughnut chart data (PTT_Digital vs Third_Party)
    const [doughnutChartData] = await connection.execute<RowDataPacket[]>(
      `SELECT 
     CASE 
       WHEN issue_type IN ('Hardware', 'Software') THEN 'PTT_Digital'
       WHEN issue_type IN ('Dispenser', 'ABA', 'Network', 'ATG', 'Fleetcard') THEN 'Third_Party'
       ELSE 'Unknown'
     END AS provider,
     ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) AS percentage
   FROM tbl_ticket
   GROUP BY provider`
    );

    console.log("fetchDashboardData results:", {
      tickets,
      chartData,
      barChartData,
      doughnutChartData,
    });

    await connection.end();

    return {
      tickets: tickets as TicketData[],
      chartData: chartData as ChartData[],
      barChartData: barChartData as BarChartData[],
      doughnutChartData: doughnutChartData as DoughnutChartData[],
      error: null,
    };
  } catch (err) {
    const errorMessage = `Error fetching dashboard data: ${
      (err as Error).message
    }`;
    console.error(errorMessage);
    return {
      tickets: [],
      chartData: [],
      barChartData: [],
      doughnutChartData: [],
      error: errorMessage,
    };
  }
}

import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { RowDataPacket } from "mysql2";
import { utils, write } from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { dbConfig } from "@/app/database/db-config"; // Adjust path to your dbConfig file
// export file for station table
interface Station extends RowDataPacket {
  id: number;
  station_id: string;
  station_name: string;
  station_type: string;
  province: string;
}

export async function GET(request: NextRequest) {
  let connection;
  try {
    // Extract token from Authorization header
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized: No token provided" }, { status: 401 });
    }

    // Validate token (replace with your actual authentication logic)
    // Example: const decoded = verifyToken(token);
    // if (!decoded) {
    //   return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    // }

    // Extract format from query parameters
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format");

    // Database connection using dbConfig
    connection = await mysql.createConnection(dbConfig);

    // Fetch stations data
    const [rows] = await connection.execute<Station[]>("SELECT * FROM tbl_station");
    // console.log("Fetched stations:", rows); // Debug: Log the fetched data
    await connection.end();

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "No stations found" }, { status: 404 });
    }

    // Prepare data for export
    const data = rows.map((station) => ({
      "ID": station.id,
      "Station ID": station.station_id,
      "Station Name": station.station_name,
      "Province": station.province,
      "Station Type": station.station_type,
    }));

    let blob: Blob;
    let contentType: string;
    let fileName: string;

    if (format === "xlsx" || format === "excel") {
      // Generate Excel file
      const ws = utils.json_to_sheet(data);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, "Stations");
      const buffer = write(wb, { bookType: "xlsx", type: "buffer" });
      blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      fileName = "stations_export.xlsx";
    } else if (format === "pdf") {
      // Generate PDF file with a table
      const doc = new jsPDF();
      doc.setFontSize(12);
      doc.text("Stations Export", 14, 20);

      autoTable(doc, {
        head: [["ID", "Station ID", "Station Name", "Province", "Station Type"]],
        body: data.map((station) => [
          station["ID"],
          station["Station ID"],
          station["Station Name"],
          station["Province"],
          station["Station Type"],
        ]),
        startY: 30,
        theme: "grid",
        styles: { fontSize: 8 },
        headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0] },
      });

      const buffer = doc.output("arraybuffer");
      blob = new Blob([buffer], { type: "application/pdf" });
      contentType = "application/pdf";
      fileName = "stations_export.pdf";
    } else if (format === "csv") {
      // Generate CSV file
      const headers = ["ID,Station ID,Station Name,Province,Station Type"];
      const rows = data.map((station) =>
        [
          station["ID"],
          `"${station["Station Name"].replace(/"/g, '""')}"`,
          `"${station["Station ID"].replace(/"/g, '""')}"`,
          station["Province"],
          station["Station Type"],
        ].join(",")
      );
      const csvContent = [...headers, ...rows].join("\n");
      blob = new Blob([csvContent], { type: "text/csv" });
      contentType = "text/csv";
      fileName = "stations_export.csv";
    } else {
      return NextResponse.json({ error: "Invalid format specified" }, { status: 400 });
    }

    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    if (connection) await connection.end();
    console.error("Export error:", error);
    return NextResponse.json(
      { error: `Failed to export stations: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}
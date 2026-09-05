import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { RowDataPacket } from "mysql2";
import { utils, write } from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { dbConfig } from "@/app/database/db-config"; // Adjust path to your dbConfig file
// export file for department table
interface Department extends RowDataPacket {
  id: number;
  department_name: string;
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

    // Fetch departments data
    const [rows] = await connection.execute<Department[]>("SELECT * FROM tbl_departments");
    // console.log("Fetched departments:", rows); // Debug: Log the fetched data
    await connection.end();

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "No departments found" }, { status: 404 });
    }

    // Prepare data for export
    const data = rows.map((department) => ({
      "ID": department.id,
      "Department Name": department.department_name,
    }));

    let blob: Blob;
    let contentType: string;
    let fileName: string;

    if (format === "xlsx" || format === "excel") {
      // Generate Excel file
      const ws = utils.json_to_sheet(data);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, "Departments");
      const buffer = write(wb, { bookType: "xlsx", type: "buffer" });
      blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      fileName = "departments_export.xlsx";
    } else if (format === "pdf") {
      // Generate PDF file with a table
      const doc = new jsPDF();
      doc.setFontSize(12);
      doc.text("Departments Export", 14, 20);

      autoTable(doc, {
        head: [["ID", "Department Name"]],
        body: data.map((department) => [
          department["ID"],
          department["Department Name"],
        ]),
        startY: 30,
        theme: "grid",
        styles: { fontSize: 8 },
        headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0] },
      });

      const buffer = doc.output("arraybuffer");
      blob = new Blob([buffer], { type: "application/pdf" });
      contentType = "application/pdf";
      fileName = "departments_export.pdf";
    } else if (format === "csv") {
      // Generate CSV file
      const headers = ["ID,Department Name"];
      const rows = data.map((department) =>
        [
          department["ID"],
          `"${department["Department Name"].replace(/"/g, '""')}"`,
        ].join(",")
      );
      const csvContent = [...headers, ...rows].join("\n");
      blob = new Blob([csvContent], { type: "text/csv" });
      contentType = "text/csv";
      fileName = "departments_export.csv";
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
      { error: `Failed to export departments: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}

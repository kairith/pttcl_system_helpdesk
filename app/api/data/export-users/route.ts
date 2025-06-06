
import { NextRequest, NextResponse } from "next/server";
import { fetchUsers } from "@/app/admin/user/action"; // Adjust path to your fetchUsers function
import { utils, write } from "xlsx"; // Use named imports for xlsx
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export async function GET(request: NextRequest) {
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

    // Fetch users data
    const { users, error } = await fetchUsers();
    if (error || !users) {
      return NextResponse.json({ error: error || "Failed to fetch users" }, { status: 500 });
    }

    // Prepare data in the same format as filteredUsers
    const data = users.map((user) => ({
      "User ID": user.users_id,
      Name: user.users_name,
      Email: user.email,
      Verified: user.code === 0 ? "Verified" : "Not Verified",
      Status: user.status ? "Active" : "Inactive",
      Rules: user.rules_name || "None",
      Company: user.company,
    }));

    let blob: Blob;
    let contentType: string;
    let fileName: string;

    if (format === "excel") {
      // Generate Excel file
      const ws = utils.json_to_sheet(data);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, "Users");
      const buffer = write(wb, { bookType: "xlsx", type: "buffer" });
      blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      fileName = "users_export.xlsx";
    } else if (format === "pdf") {
      // Generate PDF file with a table
      const doc = new jsPDF();
      doc.setFontSize(12);
      doc.text("Users Export", 14, 20);

      autoTable(doc, {
        head: [["User ID", "Name", "Email", "Verified", "Status", "Rules", "Company"]],
        body: data.map((user) => [
          user["User ID"],
          user.Name,
          user.Email,
          user.Verified,
          user.Status,
          user.Rules,
          user.Company,
        ]),
        startY: 30,
        theme: "grid",
        styles: { fontSize: 8 },
        headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0] },
      });

      const buffer = doc.output("arraybuffer");
      blob = new Blob([buffer], { type: "application/pdf" });
      contentType = "application/pdf";
      fileName = "users_export.pdf";
    } else if (format === "csv") {
      // Generate CSV file
      const headers = ["User ID,Name,Email,Verified,Status,Rules,Company"];
      const rows = data.map((user) =>
        [
          user["User ID"],
          `"${user.Name.replace(/"/g, '""')}"`,
          `"${user.Email.replace(/"/g, '""')}"`,
          user.Verified,
          user.Status,
          `"${user.Rules.replace(/"/g, '""')}"`,
          `"${user.Company.replace(/"/g, '""')}"`,
        ].join(",")
      );
      const csvContent = [...headers, ...rows].join("\n");
      blob = new Blob([csvContent], { type: "text/csv" });
      contentType = "text/csv";
      fileName = "users_export.csv";
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
    console.error("Export error:", error);
    return NextResponse.json(
      { error: `Failed to export users: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}
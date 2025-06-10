import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { dbConfig } from "@/app/database/db-config";

interface Permissions {
  users: { add: boolean; edit: boolean; delete: boolean; list: boolean };
  tickets: { add: boolean; edit: boolean; delete: boolean; list: boolean; listAssign: boolean };
  stations: { add: boolean; edit: boolean; delete: boolean; list: boolean };
  userRules: { add: boolean; edit: boolean; delete: boolean; list: boolean };
}

interface RequestBody {
  roleName: string;
  permissions?: Partial<Permissions>;
}

export async function POST(request: Request) {
  let connection;
  try {
    // Read the body as text once
    const rawBody = await request.text();
    console.log("Raw body:", rawBody);

    // Parse JSON manually to avoid multiple reads
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (parseError) {
      console.log("Failed to parse JSON:", parseError);
      return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 });
    }
    console.log("Parsed body:", body);

    // Destructure with explicit default for permissions
    const { roleName } = body;
    const permissionsFromBody = body.permissions || {};

    // Provide default permissions
    const defaultPermissions: Permissions = {
      users: { add: false, edit: false, delete: false, list: false },
      tickets: { add: false, edit: false, delete: false, list: false, listAssign: false },
      stations: { add: false, edit: false, delete: false, list: false },
      userRules: { add: false, edit: false, delete: false, list: false },
    };
    const safePermissions: Permissions = {
      users: { ...defaultPermissions.users, ...permissionsFromBody.users },
      tickets: { ...defaultPermissions.tickets, ...permissionsFromBody.tickets },
      stations: { ...defaultPermissions.stations, ...permissionsFromBody.stations },
      userRules: { ...defaultPermissions.userRules, ...permissionsFromBody.userRules },
    };

    // Input validation
    if (!roleName || typeof roleName !== "string" || roleName.trim() === "") {
      return NextResponse.json({ error: "Role name is required" }, { status: 400 });
    }

    // Connect to database
    connection = await mysql.createConnection(dbConfig);

    // Start transaction
    await connection.beginTransaction();

    // Use auto-increment for rules_id
    const rulesQuery = `
      INSERT INTO tbl_users_rules (
        rules_name,
        add_user_status, edit_user_status, delete_user_status, list_user_status,
        add_ticket_status, edit_ticket_status, delete_ticket_status, list_ticket_status, list_ticket_assign,
        add_user_rules, edit_user_rules, delete_user_rules, list_user_rules,
        add_station, edit_station, delete_station, list_station
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await connection.execute(rulesQuery, [
      roleName,
      safePermissions.users.add ? 1 : 0, safePermissions.users.edit ? 1 : 0, safePermissions.users.delete ? 1 : 0, safePermissions.users.list ? 1 : 0,
      safePermissions.tickets.add ? 1 : 0, safePermissions.tickets.edit ? 1 : 0, safePermissions.tickets.delete ? 1 : 0, safePermissions.tickets.list ? 1 : 0, safePermissions.tickets.listAssign ? 1 : 0,
      safePermissions.userRules.add ? 1 : 0, safePermissions.userRules.edit ? 1 : 0, safePermissions.userRules.delete ? 1 : 0, safePermissions.userRules.list ? 1 : 0,
      safePermissions.stations.add ? 1 : 0, safePermissions.stations.edit ? 1 : 0, safePermissions.stations.delete ? 1 : 0, safePermissions.stations.list ? 1 : 0,
    ]);

    // Get the last inserted rules_id
    const [result] = await connection.execute("SELECT LAST_INSERT_ID() as rulesId");
    const rulesId = (result as any[])[0].rulesId;

    // Commit transaction
    await connection.commit();

    return NextResponse.json({ message: "Role added successfully", rulesId }, { status: 201 });
  } catch (error: any) {
    if (connection) await connection.rollback();
    console.error("Error adding role:", {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlMessage: error.sqlMessage,
      stack: error.stack,
    });
    if (error.code === "ER_NO_SUCH_TABLE") {
      return NextResponse.json({ error: `Table not found: ${error.sqlMessage}` }, { status: 500 });
    }
    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json({ error: "Role name already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: `Failed to add role: ${error.message}` }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}
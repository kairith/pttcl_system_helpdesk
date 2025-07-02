import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { dbConfig } from "@/app/database/db-config";

export async function POST(request: Request) {
  let connection;
  try {
    const { roleName, permissions } = await request.json();
    if (!roleName || !permissions) {
      return NextResponse.json({ error: "Missing roleName or permissions" }, { status: 400 });
    }

    connection = await mysql.createConnection(dbConfig);

    const [result] = await connection.execute(
      `
      INSERT INTO tbl_users_rules (
        rules_name,
        add_user_status, edit_user_status, delete_user_status, list_user_status,
        add_ticket_status, edit_ticket_status, delete_ticket_status, list_ticket_status, list_ticket_assign,
        add_user_rules, edit_user_rules, delete_user_rules, list_user_rules,
        add_station, edit_station, delete_station, list_station
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        roleName,
        permissions.users.add ? 1 : 0,
        permissions.users.edit ? 1 : 0,
        permissions.users.delete ? 1 : 0,
        permissions.users.list ? 1 : 0,
        
        permissions.tickets.add ? 1 : 0,
        permissions.tickets.edit ? 1 : 0,
        permissions.tickets.delete ? 1 : 0,
        permissions.tickets.list ? 1 : 0,
        permissions.tickets.listAssign ? 1 : 0,

        permissions.userRules.add ? 1 : 0,
        permissions.userRules.edit ? 1 : 0,
        permissions.userRules.delete ? 1 : 0,
        permissions.userRules.list ? 1 : 0,

        permissions.stations.add ? 1 : 0,
        permissions.stations.edit ? 1 : 0,
        permissions.stations.delete ? 1 : 0,
        permissions.stations.list ? 1 : 0,
      ]
    );

    return NextResponse.json({ message: "Role added successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error adding role:", error);
    return NextResponse.json({ error: "Failed to add role" }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}
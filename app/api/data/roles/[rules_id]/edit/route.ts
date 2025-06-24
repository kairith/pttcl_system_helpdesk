import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { dbConfig } from '@/app/database/db-config';

// Create a connection pool
const pool = mysql.createPool(dbConfig);

// PATCH: Update a rule's name and permissions
export async function PATCH(request: Request, { params }: { params: { rules_id: string } }) {
  let connection;
  try {
    const body = await request.json();
    const { rules_name, permissions } = body;

    // Validate rules_name
    if (!rules_name || typeof rules_name !== 'string' || !rules_name.trim()) {
      return NextResponse.json({ error: 'Rule name is required' }, { status: 400 });
    }

    // Validate permissions
    if (!permissions || typeof permissions !== 'object') {
      return NextResponse.json({ error: 'Permissions are required' }, { status: 400 });
    }

    const rules_id = parseInt(params.rules_id, 10);
    if (isNaN(rules_id)) {
      return NextResponse.json({ error: 'Invalid rule ID' }, { status: 400 });
    }

    connection = await pool.getConnection();
    const [result] = await connection.execute(
      `UPDATE tbl_users_rules SET 
        rules_name = ?, 
        add_user_status = ?, edit_user_status = ?, delete_user_status = ?, list_user_status = ?,
        add_ticket_status = ?, edit_ticket_status = ?, delete_ticket_status = ?, list_ticket_status = ?, list_ticket_assign = ?,
        add_user_rules = ?, edit_user_rules = ?, delete_user_rules = ?, list_user_rules = ?,
        add_station = ?, edit_station = ?, delete_station = ?, list_station = ?
      WHERE rules_id = ?`,
      [
        rules_name,
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
        rules_id,
      ]
    );

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: 'Rule not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Rule updated successfully' }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error updating rule:', error.message);
    } else {
      console.error('Error updating rule:', error);
    }
    return NextResponse.json({ error: 'Failed to update rule' }, { status: 500 });
  } finally {
    if (connection) connection.release();
  }
}
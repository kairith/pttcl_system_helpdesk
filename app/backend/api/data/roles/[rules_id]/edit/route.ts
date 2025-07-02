import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { dbConfig } from '@/app/database/db-config';

const pool = mysql.createPool(dbConfig);

export async function PATCH(request: Request, { params }: { params: Promise<{ rules_id: string }> }) {
  let connection;
  try {
    const { rules_id } = await params;
    console.log('PATCH request for rules_id:', rules_id);
    const ruleId = parseInt(rules_id, 10);
    if (isNaN(ruleId)) {
      console.error('Invalid rule ID:', rules_id);
      return NextResponse.json({ error: 'Invalid rule ID' }, { status: 400 });
    }

    const body = await request.json();
    console.log('PATCH request body:', JSON.stringify(body, null, 2));
    const { rules_name, permissions } = body;

    // Validate rules_name
    if (!rules_name || typeof rules_name !== 'string' || !rules_name.trim()) {
      console.error('Missing or invalid rules_name:', rules_name);
      return NextResponse.json({ error: 'Rule name is required' }, { status: 400 });
    }

    // Validate permissions
    if (!permissions || typeof permissions !== 'object') {
      console.error('Invalid permissions:', permissions);
      return NextResponse.json({ error: 'Permissions are required' }, { status: 400 });
    }

    connection = await pool.getConnection();
    
    // Log current rule state
    const [currentRows] = await connection.execute(
      `SELECT * FROM tbl_users_rules WHERE rules_id = ?`,
      [ruleId]
    );
    console.log('Current rule state:', currentRows);

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
        permissions.users?.add ? 1 : 0,
        permissions.users?.edit ? 1 : 0,
        permissions.users?.delete ? 1 : 0,
        permissions.users?.list ? 1 : 0,
        permissions.tickets?.add ? 1 : 0,
        permissions.tickets?.edit ? 1 : 0,
        permissions.tickets?.delete ? 1 : 0,
        permissions.tickets?.list ? 1 : 0,
        permissions.tickets?.listAssign ? 1 : 0,
        permissions.userRules?.add ? 1 : 0,
        permissions.userRules?.edit ? 1 : 0,
        permissions.userRules?.delete ? 1 : 0,
        permissions.userRules?.list ? 1 : 0,
        permissions.stations?.add ? 1 : 0,
        permissions.stations?.edit ? 1 : 0,
        permissions.stations?.delete ? 1 : 0,
        permissions.stations?.list ? 1 : 0,
        ruleId,
      ]
    );

    if ((result as any).affectedRows === 0) {
      console.error('No rule found with rules_id:', ruleId);
      return NextResponse.json({ error: 'Rule not found' }, { status: 404 });
    }

    // Log updated rule state
    const [updatedRows] = await connection.execute<mysql.RowDataPacket[]>(
      `SELECT * FROM tbl_users_rules WHERE rules_id = ?`,
      [ruleId]
    );
    console.log('Updated rule state:', updatedRows);

    console.log('Rule updated successfully:', { rules_id: ruleId });
    return NextResponse.json({ message: 'Rule updated successfully', updatedRule: (updatedRows as mysql.RowDataPacket[])[0] }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error updating rule:', error.message, error.stack);
    } else {
      console.error('Error updating rule:', error);
    }
    return NextResponse.json({ error: 'Failed to update rule' }, { status: 500 });
  } finally {
    if (connection) {
      connection.release();
      console.log('Database connection released');
    }
  }
}
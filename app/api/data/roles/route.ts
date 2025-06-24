import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { dbConfig } from '@/app/database/db-config';

// Create a connection pool
const pool = mysql.createPool(dbConfig);

// GET: Fetch all rules with permissions
export async function GET() {
  let connection;
  try {
    console.log('Attempting to connect to database with config:', dbConfig);
    connection = await pool.getConnection();
    console.log('Database connection established');
    const [rows] = await connection.execute(`
      SELECT rules_id, rules_name, 
             add_user_status, edit_user_status, delete_user_status, list_user_status,
             add_ticket_status, edit_ticket_status, delete_ticket_status, list_ticket_status, list_ticket_assign,
             add_user_rules, edit_user_rules, delete_user_rules, list_user_rules,
             add_station, edit_station, delete_station, list_station
      FROM tbl_users_rules
    `);
    if (Array.isArray(rows)) {
      console.log('Query executed, rows fetched:', rows.length);
    } else {
      console.log('Query executed, but rows is not an array:', rows);
    }
    const rules = (rows as any[]).map((row) => ({
      rules_id: Number(row.rules_id),
      rules_name: String(row.rules_name),
      add_user_status: Number(row.add_user_status || 0),
      edit_user_status: Number(row.edit_user_status || 0),
      delete_user_status: Number(row.delete_user_status || 0),
      list_user_status: Number(row.list_user_status || 0),
      add_ticket_status: Number(row.add_ticket_status || 0),
      edit_ticket_status: Number(row.edit_ticket_status || 0),
      delete_ticket_status: Number(row.delete_ticket_status || 0),
      list_ticket_status: Number(row.list_ticket_status || 0),
      list_ticket_assign: Number(row.list_ticket_assign || 0),
      add_user_rules: Number(row.add_user_rules || 0),
      edit_user_rules: Number(row.edit_user_rules || 0),
      delete_user_rules: Number(row.delete_user_rules || 0),
      list_user_rules: Number(row.list_user_rules || 0),
      add_station: Number(row.add_station || 0),
      edit_station: Number(row.edit_station || 0),
      delete_station: Number(row.delete_station || 0),
      list_station: Number(row.list_station || 0),
    }));
    return NextResponse.json({ rules, error: null }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching rules:', error.message, error.stack);
      return NextResponse.json({ rules: [], error: `Failed to fetch rules: ${error.message}` }, { status: 500 });
    } else {
      console.error('Error fetching rules:', error);
      return NextResponse.json({ rules: [], error: 'Failed to fetch rules: Unknown error' }, { status: 500 });
    }
  } finally {
    if (connection) {
      console.log('Releasing database connection');
      connection.release();
    }
  }
}

// Cache the GET request for 1 hour
export const revalidate = 3600;
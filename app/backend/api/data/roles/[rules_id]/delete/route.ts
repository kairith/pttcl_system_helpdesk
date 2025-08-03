import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { dbConfig } from '@/app/database/db-config';

// Create a connection pool
const pool = mysql.createPool(dbConfig);

// DELETE: Remove a rule by its ID
export async function DELETE(request: Request, { params }: { params: Promise<{ rules_id: string }> }) {
  let connection;
  try {
    // console.log('Processing DELETE request for rules_id:', params);
    const { rules_id } = await params; // Await params
    const ruleId = parseInt(rules_id, 10);
    if (isNaN(ruleId)) {
      console.error('Validation failed: Invalid rule ID:', rules_id);
      return NextResponse.json({ error: 'Invalid rule ID' }, { status: 400 });
    }

    connection = await pool.getConnection();
    // console.log('Database connection established for DELETE rule:', ruleId);
    const [result] = await connection.execute('DELETE FROM tbl_users_rules WHERE rules_id = ?', [ruleId]);

    if ((result as any).affectedRows === 0) {
      console.error('No rows affected: Rule not found for ID:', ruleId);
      return NextResponse.json({ error: 'Rule not found' }, { status: 404 });
    }

    // console.log('Rule deleted successfully:', ruleId);
    return NextResponse.json({ message: 'Rule deleted successfully' }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error deleting rule:', error.message, error.stack);
      return NextResponse.json({ error: `Failed to delete rule: ${error.message}` }, { status: 500 });
    } else {
      console.error('Error deleting rule:', error);
      return NextResponse.json({ error: 'Failed to delete rule: Unknown error' }, { status: 500 });
    }
  } finally {
    if (connection) {
      // console.log('Releasing database connection');
      connection.release();
    }
  }
}
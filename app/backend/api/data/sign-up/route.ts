import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import { dbConfig } from '@/app/database/db-config';
// testing sign up but system not use for normal user sign up
export async function POST(request: { json: () => any }) {
  let connection;
  try {
    const body = await request.json();
    const { usersName, email, password, rulesId } = body;

    // Validate input
    if (!usersName || !email || !password || !rulesId) {
      return NextResponse.json({ error: 'All fields are required, including role.' }, { status: 400 });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email format.' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    // Connect to the database
    connection = await mysql.createConnection(dbConfig);

    // Check for duplicate email
    const [existingUsers] = await connection.execute('SELECT email FROM tbl_users WHERE email = ?', [email]);
    if ((existingUsers as any[]).length > 0) {
      return NextResponse.json({ error: 'Email already exists.' }, { status: 409 });
    }

    // Validate rules_id
    const [rules] = await connection.execute('SELECT rules_id FROM tbl_users_rules WHERE rules_id = ?', [rulesId]);
    if ((rules as any[]).length === 0) {
      return NextResponse.json({ error: 'Invalid role selected.' }, { status: 400 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user
    const query = `
      INSERT INTO tbl_users (users_name, email, password, code, status, rules_id, company)
      VALUES (?, ?, ?, 0, 1, ?, 'PTT Cambodia')
    `;
    await connection.execute(query, [usersName, email, hashedPassword, rulesId]);

    return NextResponse.json({ message: 'User registered successfully!' }, { status: 201 });
  } catch (error) {
    console.error('Error during signup:', error);
    return NextResponse.json({ error: 'An error occurred during signup.' }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';
import { dbConfig } from '@/app/lib/db-config';

export async function POST(request: Request) {
  let connection;
  try {
    // Authenticate admin
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as { isAdmin: boolean; rules_id: number };
    if (!decoded.isAdmin || decoded.rules_id !== 1461) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { usersName, email, password, company, status, rulesId } = body;

    // Validate inputs
    if (!usersName || !email || !password || !company || status === undefined || !rulesId) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email format.' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }
    if (![0, 1].includes(Number(status))) {
      return NextResponse.json({ error: 'Status must be 0 (Inactive) or 1 (Active).' }, { status: 400 });
    }
    if (![1461, 1472].includes(Number(rulesId))) {
      return NextResponse.json({ error: 'Invalid role selected.' }, { status: 400 });
    }

    // Connect to database
    connection = await mysql.createConnection(dbConfig);

    // Check duplicate email
    const [existingUsers] = await connection.execute('SELECT email FROM tbl_users WHERE email = ?', [email]);
    if ((existingUsers as any[]).length > 0) {
      return NextResponse.json({ error: 'Email already registered.' }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Hashed password for new user:', hashedPassword);

    // Insert user with exact attributes
    const query = `
      INSERT INTO tbl_users (users_name, email, password, code, status, rules_id, company)
      VALUES (?, ?, ?, 0, ?, ?, ?)
    `;
    await connection.execute(query, [usersName, email, hashedPassword, Number(status), Number(rulesId), company]);

    return NextResponse.json({ message: 'User created successfully!' }, { status: 201 });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: 'An error occurred while creating the user.' }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';
import { dbConfig } from '@/app/database/db-config';

export async function POST(request: Request) {
  let connection;
  try {
    // Authenticate admin
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Authentication required: No token provided' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as { isAdmin: boolean; rules_id: number };
    if (!decoded.isAdmin || decoded.rules_id !== 1461) {
      return NextResponse.json({ error: 'Admin access required: Invalid role or permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { usersName, email, password, company, status, rulesId, imagePath } = body;

    // Validate inputs
    if (!usersName || !email || !password || !company || status === undefined || !rulesId) {
      return NextResponse.json({ error: 'All fields (except imagePath) are required' }, { status: 400 });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }
    if (![0, 1].includes(Number(status))) {
      return NextResponse.json({ error: 'Status must be 0 (Inactive) or 1 (Active)' }, { status: 400 });
    }
    if (![1461, 1472].includes(Number(rulesId))) {
      return NextResponse.json({ error: 'Invalid role selected: rulesId must be 1461 or 1472' }, { status: 400 });
    }
    if (imagePath && typeof imagePath !== 'string') {
      return NextResponse.json({ error: 'imagePath must be a string' }, { status: 400 });
    }

    // Connect to database
    try {
      connection = await mysql.createConnection(dbConfig);
    } catch (err) {
      console.error('Database connection error:', err);
      return NextResponse.json({ error: 'Failed to connect to database' }, { status: 500 });
    }

    // Check duplicate email
    const [existingUsers] = await connection.execute('SELECT email FROM tbl_users WHERE email = ?', [email]);
    if ((existingUsers as any[]).length > 0) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Hashed password for new user:', hashedPassword);

    // Start transaction
    await connection.beginTransaction();

    // Insert user into tbl_users
    const userQuery = `
      INSERT INTO tbl_users (users_name, email, password, code, status, rules_id, company)
      VALUES (?, ?, ?, 0, ?, ?, ?)
    `;
    const [userResult] = await connection.execute(userQuery, [usersName, email, hashedPassword, Number(status), Number(rulesId), company]);
    const userId = (userResult as any).insertId;

    // Insert image path into tbl_user_image if provided
    if (imagePath) {
      const imageQuery = `
        INSERT INTO tbl_user_image (users_id, image_path)
        VALUES (?, ?)
      `;
      await connection.execute(imageQuery, [userId, imagePath]);
    }

    // Commit transaction
    await connection.commit();

    return NextResponse.json({ message: 'User created successfully!', userId, imagePath: imagePath || null }, { status: 201 });
  } catch (error: any) {
    if (connection) await connection.rollback();
    console.error('Create user error:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlMessage: error.sqlMessage,
      stack: error.stack,
    });
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return NextResponse.json({ error: `Table not found: ${error.sqlMessage}` }, { status: 500 });
    }
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Duplicate entry detected' }, { status: 409 });
    }
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return NextResponse.json({ error: 'Invalid rules_id: Role does not exist' }, { status: 400 });
    }
    return NextResponse.json({ error: `An error occurred while creating the user: ${error.message}` }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';
import { dbConfig } from '@/app/database/db-config';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { ensureDirectoryExistence } from '@/app/lib/utils';

export async function POST(request: Request) {
  let connection;
  try {
    // Authenticate user
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Authentication required: No token provided' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as { userId: number; isAdmin: boolean; rules_id: number };
    const userId = decoded.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token: userId missing' }, { status: 401 });
    }

    // Connect to database
    connection = await mysql.createConnection(dbConfig);

    // Verify user exists in tbl_users
    const [userRows] = await connection.execute('SELECT users_id FROM tbl_users WHERE users_id = ?', [userId]);
    if ((userRows as any[]).length === 0) {
      return NextResponse.json({ error: 'User not found: Invalid user_create_ticket ID' }, { status: 400 });
    }

    // Parse form data
    const formData = await request.formData();
    const stationId = formData.get('station_id') as string;
    const stationName = formData.get('station_name') as string;
    const stationType = formData.get('station_type') as string;
    const province = formData.get('province') as string;
    const issueOn = formData.get('issue_on') as string;
    const issueType = formData.get('issue_type') as string;
    const issueDescription = formData.get('issue_description') as string;
    const image = formData.get('image') as File | null;

    // Validate inputs
    if (!stationId || !stationName || !stationType || !province || !issueOn || !issueType || !issueDescription) {
      return NextResponse.json({ error: 'All fields (except image) are required' }, { status: 400 });
    }
    if (!['PTTDigital', 'Third Party'].includes(issueOn)) {
      return NextResponse.json({ error: 'Invalid issue_on: must be PTTDigital or Third Party' }, { status: 400 });
    }
    const validIssueTypes = issueOn === 'PTTDigital' ? ['Software', 'Hardware'] : ['ATG', 'ABA', 'Fleetcard', 'Network', 'Dispenser'];
    if (!validIssueTypes.includes(issueType)) {
      return NextResponse.json({ error: `Invalid issue_type: must be one of ${validIssueTypes.join(', ')}` }, { status: 400 });
    }

    // Handle image upload
    let imagePath = '';
    if (image) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(image.type)) {
        return NextResponse.json({ error: 'Invalid file type: Only JPEG, PNG, or GIF allowed' }, { status: 400 });
      }
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (image.size > maxSize) {
        return NextResponse.json({ error: 'File size exceeds 5MB limit' }, { status: 400 });
      }

      const timestamp = Date.now();
      const fileExtension = image.name.split('.').pop();
      const fileName = `ticket_${timestamp}.${fileExtension}`;
      const uploadDir = join(process.cwd(), 'public/uploads/ticket_image');
      const filePath = join(uploadDir, fileName);

      await ensureDirectoryExistence(uploadDir);
      const buffer = Buffer.from(await image.arrayBuffer());
      await writeFile(filePath, buffer);
      imagePath = `/uploads/ticket_image/${fileName}`;
    }

    // Start transaction
    await connection.beginTransaction();

    // Insert ticket
    const ticketQuery = `
      INSERT INTO tbl_ticket (user_create_ticket, station_id, station_name, station_type, province, issue_on, issue_type, issue_description, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    const [ticketResult] = await connection.execute(ticketQuery, [
      userId,
      stationId,
      stationName,
      stationType,
      province,
      issueOn,
      issueType,
      issueDescription,
    ]);
    const ticketId = (ticketResult as any).insertId;

    // Insert image path if provided
    if (imagePath) {
      const imageQuery = `
        INSERT INTO tbl_ticket_image (ticket_id, image_path)
        VALUES (?, ?)
      `;
      await connection.execute(imageQuery, [ticketId, imagePath]);
    }

    // Commit transaction
    await connection.commit();

    return NextResponse.json({ message: 'Ticket created successfully!', ticketId, imagePath: imagePath || null }, { status: 201 });
  } catch (error: any) {
    if (connection) await connection.rollback();
    console.error('Create ticket error:', {
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
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return NextResponse.json({ error: 'Invalid user_create_ticket: User does not exist' }, { status: 400 });
    }
    return NextResponse.json({ error: `Failed to create ticket: ${error.message}` }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}
// app/api/data/ticket_images/bulk/route.ts
// boost performance by fetching multiple ticket images in a single request
import { NextResponse } from 'next/server';
import { dbConfig } from '@/app/database/db-config';
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';

const db = mysql.createPool(dbConfig);

export async function POST(request: Request) {
  // Validate Authorization token
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) {
    console.error('Missing Authorization token');
    return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    if (!decoded) {
      console.error('Invalid or expired token');
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // Parse ticket_ids from request body
    const { ticket_ids } = await request.json();
    if (!Array.isArray(ticket_ids) || ticket_ids.length === 0) {
      console.error('Missing or invalid ticket_ids');
      return NextResponse.json({ error: 'Missing or invalid ticket_ids' }, { status: 400 });
    }

    // Query tbl_ticket_images for multiple ticket_ids
    const [rows] = await db.query(
      'SELECT id, ticket_id, image_path FROM tbl_ticket_images WHERE ticket_id IN (?)',
      [ticket_ids]
    );

    // console.log(`Images found for ticket_ids ${ticket_ids.join(', ')}:`, rows);
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 });
  }
}
// app/api/data/ticket_images/[ticket_id]/route.ts
import { NextResponse } from 'next/server';
import { dbConfig } from '@/app/database/db-config';
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';

const db = mysql.createPool(dbConfig);

export async function GET(request: Request, context: { params: Promise<{ ticket_id: string }> }) {
  const { ticket_id } = await context.params;

  if (!ticket_id) {
    console.error('Missing ticket_id in route parameters');
    return NextResponse.json({ error: 'Missing ticket ID' }, { status: 400 });
  }

  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) {
    console.error('Missing Authorization token');
    return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    if (!decoded) {
      console.error('Invalid or expired token');
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const [rows] = await db.query(
      'SELECT id, ticket_id, image_path FROM tbl_ticket_images WHERE ticket_id = ?',
      [ticket_id]
    );

    console.log(`Images found for ticket_id ${ticket_id}:`, rows);
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error(`Error fetching images for ticket ${ticket_id}:`, error);
    return NextResponse.json({ error: `Failed to fetch images for ticket ${ticket_id}` }, { status: 500 });
  }
}
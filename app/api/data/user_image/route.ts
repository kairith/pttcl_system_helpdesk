import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import sanitizeFilename from 'sanitize-filename';
import mime from 'mime-types';
import { getConnection } from '@/app/lib/db';

export async function POST(request: Request) {
  let connection;
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File | null;
    const usersId = formData.get('users_id') as string | null;

    console.log('POST - users_id:', usersId, 'file:', file?.name);

    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'No valid file uploaded.' }, { status: 400 });
    }
    if (!usersId || isNaN(parseInt(usersId))) {
      return NextResponse.json({ error: 'Invalid or missing users_id.' }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPEG, PNG, or GIF allowed.' }, { status: 400 });
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size exceeds 5MB.' }, { status: 400 });
    }

    const extension = mime.extension(file.type);
    if (!extension) {
      return NextResponse.json({ error: 'Invalid file type.' }, { status: 400 });
    }

    const fileName = `user_${uuidv4()}.${extension}`;
    const uploadDir = join(process.cwd(), 'public/uploads/user_image');
    const filePath = join(uploadDir, sanitizeFilename(fileName));

    await writeFile(filePath, Buffer.from(await file.arrayBuffer()));

    const relativePath = `/uploads/user_image/${fileName}`;
    connection = await getConnection();
    await connection.execute(
      'INSERT INTO tbl_user_image (users_id, image_path) VALUES (?, ?)',
      [parseInt(usersId), relativePath]
    );

    console.log('Uploaded:', relativePath, 'for users_id:', usersId);

    return NextResponse.json(
      { imagePath: relativePath, usersId: parseInt(usersId) },
      { status: 200 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload image.' }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

export async function GET(request: Request) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const usersId = searchParams.get('users_id');

    console.log('GET - users_id:', usersId);

    if (!usersId || isNaN(parseInt(usersId))) {
      console.log('Invalid users_id:', usersId);
      return NextResponse.json({ error: 'Invalid or missing users_id.' }, { status: 400 });
    }

    const parsedUsersId = parseInt(usersId);
    connection = await getConnection();
    const [rows] = await connection.execute(
      'SELECT id, users_id, image_path FROM tbl_user_image WHERE users_id = ? ORDER BY id DESC LIMIT 1',
      [parsedUsersId]
    );

    console.log('Query result:', rows);

    if (!Array.isArray(rows) || rows.length === 0) {
      console.log('No image for users_id:', parsedUsersId);
      return NextResponse.json(
        { imagePath: '/Uploads/user_image/Default-avatar.jpg', usersId: parsedUsersId },
        { status: 200 }
      );
    }

    const userImage = rows[0] as { id: number; users_id: number; image_path: string };
    console.log('Found image:', userImage.image_path);

    return NextResponse.json(
      { imagePath: userImage.image_path.toLowerCase(), usersId: userImage.users_id },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch image.' }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}
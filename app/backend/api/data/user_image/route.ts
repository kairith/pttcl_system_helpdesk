import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import mime from 'mime-types';
import { getConnection } from '@/app/backend/lib/db';
import { uploadToMinio, DEFAULT_AVATAR_URL } from '@/app/backend/lib/minio';

export async function POST(request: Request) {
  let connection;
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File | null;
    const usersId = formData.get('users_id') as string | null;

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

    const objectKey = `user-images/user_${uuidv4()}.${extension}`;
    const imagePath = await uploadToMinio(
      Buffer.from(await file.arrayBuffer()),
      objectKey,
      file.type
    );

    connection = await getConnection();
    await connection.execute(
      'INSERT INTO tbl_user_image (users_id, image_path) VALUES (?, ?)',
      [parseInt(usersId), imagePath]
    );

    return NextResponse.json(
      { imagePath, usersId: parseInt(usersId) },
      { status: 200 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload image.' }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

export async function GET(request: Request) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const usersId = searchParams.get('users_id');

    if (!usersId || isNaN(parseInt(usersId))) {
      return NextResponse.json({ error: 'Invalid or missing users_id.' }, { status: 400 });
    }

    const parsedUsersId = parseInt(usersId);
    connection = await getConnection();
    const [rows] = await connection.execute(
      'SELECT id, users_id, image_path FROM tbl_user_image WHERE users_id = ? ORDER BY id DESC LIMIT 1',
      [parsedUsersId]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { imagePath: DEFAULT_AVATAR_URL, usersId: parsedUsersId },
        { status: 200 }
      );
    }

    const userImage = rows[0] as { id: number; users_id: number; image_path: string };

    return NextResponse.json(
      { imagePath: userImage.image_path, usersId: userImage.users_id },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch image.' }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

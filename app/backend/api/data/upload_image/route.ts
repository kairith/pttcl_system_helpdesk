// app/api/data/upload_image/route.ts
import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File | null;
    if (!file) {
      console.error('No file uploaded');
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `ticket_${timestamp}.${fileExtension}`;
    const uploadDir = join(process.cwd(), 'public/uploads/ticket_image');
    const filePath = join(uploadDir, fileName);

    await ensureDirectoryExistence(uploadDir);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const relativePath = `/uploads/ticket_image/${fileName}`;
    // console.log('Uploaded image:', relativePath);
    return NextResponse.json({ imagePath: relativePath }, { status: 200 });
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}

async function ensureDirectoryExistence(dirPath: string) {
  const { mkdir } = await import('fs/promises');
  await mkdir(dirPath, { recursive: true });
}
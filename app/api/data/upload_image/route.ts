import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { ensureDirectoryExistence } from '@/app/lib/utils';
// Ticket uplaod image
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, JPG  or GIF allowed.' }, { status: 400 });
    }

    

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size exceeds 5MB limit.' }, { status: 400 });
    }

    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `ticket_${timestamp}.${fileExtension}`; // Use 'ticket_' prefix for tickets
    const uploadDir = join(process.cwd(), 'public/uploads/ticket_image');
    const filePath = join(uploadDir, fileName);

    await ensureDirectoryExistence(uploadDir);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const relativePath = `/uploads/ticket_image/${fileName}`;
    return NextResponse.json({ imagePath: relativePath }, { status: 200 });
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json({ error: 'Failed to upload image.' }, { status: 500 });
  }
}
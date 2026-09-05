// app/api/data/upload_image/route.ts
import { NextResponse } from 'next/server';
import { uploadToMinio } from '@/app/backend/lib/minio';

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
    const objectKey = `ticket-images/ticket_${timestamp}.${fileExtension}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const imagePath = await uploadToMinio(buffer, objectKey, file.type || 'application/octet-stream');

    return NextResponse.json({ imagePath }, { status: 200 });
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}

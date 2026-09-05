import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { uploadToMinio } from '@/app/backend/lib/minio';
// user upload image
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

    const fileExtension = file.name.split('.').pop();
    const objectKey = `user-images/user_${uuidv4()}.${fileExtension}`;

    const imagePath = await uploadToMinio(
      Buffer.from(await file.arrayBuffer()),
      objectKey,
      file.type
    );

    return NextResponse.json({ imagePath }, { status: 200 });
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json({ error: 'Failed to upload image.' }, { status: 500 });
  }
}

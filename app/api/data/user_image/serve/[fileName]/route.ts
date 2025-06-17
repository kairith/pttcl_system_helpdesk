import { NextResponse } from 'next/server';
import { join } from 'path';
import { readFile } from 'fs/promises';
import mime from 'mime-types';

export async function GET(request: Request, { params }: { params: { fileName: string } }) {
  try {
    const fileName = params.fileName;
    const filePath = join(process.cwd(), 'private/uploads/user_image', fileName);
    const contentType = mime.contentType(fileName) || 'application/octet-stream';

    const fileBuffer = await readFile(filePath);
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving image:', error);
    // Serve default image if file not found
    const defaultPath = join(process.cwd(), 'public/uploads/user_image/Default-avatar.jpg');
    const contentType = mime.contentType('Default-avatar.jpg') || 'image/jpeg';
    try {
      const defaultBuffer = await readFile(defaultPath);
      return new NextResponse(defaultBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    } catch {
      return NextResponse.json({ error: 'Image not found.' }, { status: 404 });
    }
  }
}
import { NextRequest, NextResponse } from 'next/server';
// the endpoint that check the page that not having route in the website for 404 not found
export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      error: 'API route not found',
      message: 'The requested API endpoint under /api/data does not exist.',
    },
    { status: 404 }
  );
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      error: 'API route not found',
      message: 'The requested API endpoint under /api/data does not exist.',
    },
    { status: 404 }
  );
}
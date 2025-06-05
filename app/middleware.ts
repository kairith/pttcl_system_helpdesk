import { NextResponse, NextRequest } from 'next/server';
   import { verify } from 'jsonwebtoken';

   export function middleware(request: NextRequest) {
     const token = request.headers.get('Authorization')?.replace('Bearer ', '');

     if (!token) {
       return NextResponse.redirect(new URL('/login', request.url));
     }

     try {
       const payload = verify(token, process.env.JWT_SECRET || 'b9e8d7c6f5a4b3e2d1c0b9a8e7d6c5f4b3a2e1d0c9b8a7e6d5c4f3b2a1e0d');
       const { isAdmin } = payload as { isAdmin: boolean };

       // Restrict /admin/dashboard to admins
       if (request.nextUrl.pathname.startsWith('/admin/dashboard') && !isAdmin) {
         return NextResponse.redirect(new URL('/dashboard', request.url));
       }

       return NextResponse.next();
     } catch (error) {
       return NextResponse.redirect(new URL('/login', request.url));
     }
   }

   export const config = {
     matcher: ['/dashboard/:path*', '/admin/dashboard/:path*'],
   };
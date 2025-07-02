import { NextResponse, NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import mysql from 'mysql2/promise';
import { dbConfig } from '@/app/database/db-config';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  console.log('Middleware triggered for path:', path);

  // Define protected routes
  const protectedRoutes = [
    '/pages/admin/users',
    '/pages/admin/user/add_user',
    '/pages/admin/user_rules',
    '/pages/admin/tickets',
    '/pages/admin/stations',
  ];

  if (!protectedRoutes.some((route) => path.startsWith(route))) {
    console.log('Path not protected, proceeding:', path);
    return NextResponse.next();
  }

  // Get token from cookies or Authorization header
  const token = request.cookies.get('token')?.value || request.headers.get('Authorization')?.replace('Bearer ', '');
  console.log('Token in middleware:', token ? '[token present]' : '[no token]');

  if (!token) {
    console.error('No token provided for protected route:', path);
    return NextResponse.redirect(new URL('/', request.url));
  }

  let connection;
  try {
    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'b9e8d7c6f5a4b3e2d1c0b9a8e7d6c5f4b3a2e1d0c9b8a7e6d5c4f3b2a1e0d') as {
      users_id: number;
      rules_id: number;
      isAdmin: boolean;
    };
    console.log('JWT decoded:', { users_id: decoded.users_id, rules_id: decoded.rules_id, isAdmin: decoded.isAdmin });

    // Connect to database
    connection = await mysql.createConnection(dbConfig);
    console.log('Middleware database connected');

    // Fetch permissions
    const [rows] = await connection.execute(
      `SELECT rules_id, rules_name, 
              add_user_status, edit_user_status, delete_user_status, list_user_status,
              add_ticket_status, edit_ticket_status, delete_ticket_status, list_ticket_status, list_ticket_assign,
              add_station, edit_station, delete_station, list_station,
              add_user_rules, edit_user_rules, delete_user_rules, list_user_rules
       FROM tbl_users_rules WHERE rules_id = ?`,
      [decoded.rules_id]
    );
    const rule = (rows as any[])[0];
    if (!rule) {
      console.error('No rule found for rules_id:', decoded.rules_id);
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Construct permissions object
    const permissions = {
      users: {
        add: !!rule.add_user_status,
        edit: !!rule.edit_user_status,
        delete: !!rule.delete_user_status,
        list: !!rule.list_user_status,
      },
      tickets: {
        add: !!rule.add_ticket_status,
        edit: !!rule.edit_ticket_status,
        delete: !!rule.delete_ticket_status,
        list: !!rule.list_ticket_status,
        listAssign: !!rule.list_ticket_assign,
      },
      stations: {
        add: !!rule.add_station,
        edit: !!rule.edit_station,
        delete: !!rule.delete_station,
        list: !!rule.list_station,
      },
      userRules: {
        add: !!rule.add_user_rules,
        edit: !!rule.edit_user_rules,
        delete: !!rule.delete_user_rules,
        list: !!rule.list_user_rules,
      },
    };
    console.log('Permissions set for route:', path, permissions);

    // Add permissions to request headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-permissions', JSON.stringify(permissions));

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error: any) {
    console.error('Middleware error:', error.message, error.stack);
    return NextResponse.redirect(new URL('/', request.url));
  } finally {
    if (connection) {
      await connection.end();
      console.log('Middleware database connection closed');
    }
  }
}

export const config = {
  matcher: ['/pages/admin/:path*'],
};
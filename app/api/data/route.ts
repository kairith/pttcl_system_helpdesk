// app/api/test-connection/route.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/app/database/company_data'; // Adjust the import path as necessary

export async function GET(req: NextApiRequest, res: NextApiResponse) {
    try {
        await db.getConnection(); // Attempt to get a connection
        return new Response(JSON.stringify({ message: 'Database connection successful!' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Database connection failed' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
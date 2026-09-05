import { NextResponse } from "next/server";
import { createPool, Pool, RowDataPacket } from "mysql2/promise";
import { verify } from "jsonwebtoken";
import { dbConfig } from "@/app/database/db-config";

// Define the user interface for the response
interface DbUser {
  users_id: string;
  users_name: string;
  email: string;
  status: number;
  code: number;
  rules_id?: number;
  company?: string;
}

// Create MySQL connection pool
const pool: Pool = createPool(dbConfig);

// Middleware to verify JWT
const authMiddleware = async (req: Request): Promise<{ user?: any; error?: string }> => {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return { error: "No authentication token provided" };
  }

  try {
    const secret = process.env.JWT_SECRET || "your_jwt_secret";
    const decoded = verify(token, secret);
    return { user: decoded };
  } catch (error) {
    return { error: "Invalid or expired token" };
  }
};

// GET /api/data/users
// Consumed only by the ticket-assignment dropdown (edit_ticket pages). The
// list returned is scoped to what the requester is actually allowed to
// assign tickets to: unrestricted for a global-assign role, their own
// department only for a department-scoped role, or empty if they can't
// assign tickets at all (the real enforcement lives in the PUT handler on
// /api/data/tickets/[id] — this just keeps the dropdown from offering
// choices that would be rejected anyway).
export async function GET(req: Request) {
  const authResult = await authMiddleware(req);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }

  try {
    const requesterId =
      authResult.user?.users_id ?? authResult.user?.userId ?? authResult.user?.id ?? authResult.user?.sub;

    const [requesterRows] = await pool.query<RowDataPacket[]>(
      `SELECT r.list_ticket_assign, r.scope_to_department, u.department_id
       FROM tbl_users u
       LEFT JOIN tbl_users_rules r ON u.rules_id = r.rules_id
       WHERE u.users_id = ?`,
      [requesterId]
    );
    const requester = requesterRows[0] || {};
    const canAssign = !!requester.list_ticket_assign;
    const scopedToDepartment = !!requester.scope_to_department;

    let rows: RowDataPacket[] = [];
    if (canAssign && scopedToDepartment && requester.department_id) {
      [rows] = await pool.query<RowDataPacket[]>(
        `SELECT users_id, users_name, email, status, code, rules_id, company
         FROM tbl_users
         WHERE (status = 1 OR code = 0) AND department_id = ?`,
        [requester.department_id]
      );
    } else if (canAssign) {
      [rows] = await pool.query<RowDataPacket[]>(`
        SELECT users_id, users_name, email, status, code, rules_id, company
        FROM tbl_users
        WHERE status = 1 OR code = 0
      `);
    }

    // Map RowDataPacket[] to DbUser[]
    const users: DbUser[] = rows.map((row) => ({
      users_id: String(row.users_id),
      users_name: String(row.users_name),
      email: String(row.email),
      status: Number(row.status),
      code: Number(row.code),
      rules_id: row.rules_id !== undefined ? Number(row.rules_id) : undefined,
      company: row.company !== undefined ? String(row.company) : undefined,
    }));

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
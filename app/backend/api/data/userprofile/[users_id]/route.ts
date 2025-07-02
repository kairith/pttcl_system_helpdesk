import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { dbConfig } from "@/app/database/db-config";
// display user profile but not so important 
// Database connection configuration
const pool = mysql.createPool(dbConfig);

const dbQuery = async (sql: string, params: any[]): Promise<any[]> => {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows as any[];
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
};

export async function GET(
  request: Request,
  context: { params: Promise<{ users_id: string }> }
) {
  const params = await context.params;
  const { users_id } = params;

  if (!users_id || isNaN(Number(users_id))) {
    return NextResponse.json(
      { error: "User ID not provided or invalid" },
      { status: 400 }
    );
  }

  try {
    const [userResult] = await dbQuery(
      `
        SELECT u.users_id, u.users_name, u.email, u.company, i.image_path AS user_image
        FROM tbl_users u
        LEFT JOIN tbl_user_image i ON u.users_id = i.users_id
        WHERE u.users_id = ?
      `,
      [users_id]
    );

    if (!userResult) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch tickets assigned to this user with additional details
    const ticketsResult = await dbQuery(
      `
  SELECT id AS ticket_id, station_name, station_type, issue_description, status, users_id
  FROM tbl_ticket
  WHERE users_id = ?
`,
      [users_id]
    );

    const userData = {
      users_id: userResult.users_id,
      users_name: userResult.users_name,
      email: userResult.email,
      company: userResult.company || null,
      user_image:
        userResult.user_image || "/Uploads/user_image/Default-avatar.jpg",
    };

    return NextResponse.json({ user: userData, tickets: ticketsResult }, { status: 200 });

  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

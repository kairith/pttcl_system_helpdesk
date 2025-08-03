
import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import jwt, { JwtPayload } from "jsonwebtoken";
import { dbConfig } from "@/app/database/db-config";

interface CustomJwtPayload extends JwtPayload {
  users_id?: string;
  sub?: string;
  userId?: string;
  id?: string;
}

const pool = mysql.createPool(dbConfig);

const getDbConnection = async () => {
  try {
    return await pool.getConnection();
  } catch (error: any) {
    console.error("Database connection error:", error);
    throw new Error("Failed to connect to database");
  }
};

const verifyToken = (authHeader: string | null): string | null => {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.error("Missing or invalid Authorization header");
    return null;
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret") as CustomJwtPayload;
    const userId = decoded.users_id || decoded.sub || decoded.userId || decoded.id || null;
    if (!userId) {
      console.error("No user ID found in JWT payload");
    }
    return userId;
  } catch (error) {
    console.error("JWT verification error:", error);
    return null;
  }
};

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const userId = verifyToken(authHeader);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized: Invalid or missing token" }, { status: 401 });
  }

  let connection;
  try {
    connection = await getDbConnection();
    const [rows] = await connection.execute(
      `SELECT id, group_id AS chatId, group_name AS groupName 
       FROM tbl_telegramgroups`
    );

    const groups = (rows as any[]).map((row) => ({
      id: Number(row.id),
      chatId: String(row.chatId),
      groupName: String(row.groupName || "Unnamed"),
    }));

    // console.log("GET /api/data/telegram_groups: Fetched groups:", groups);
    return NextResponse.json(groups, { headers: { 'Cache-Control': 'no-cache' }, status: 200 });
  } catch (error: any) {
    console.error("GET /api/data/telegram_groups error:", error);
    return NextResponse.json(
      { error: `Failed to fetch Telegram groups: ${error.message || "Unknown error"}` },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const userId = verifyToken(authHeader);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized: Invalid or missing token" }, { status: 401 });
  }

  let connection;
  try {
    const body = await request.json();
    const { chatId, groupName } = body;

    if (!chatId || !groupName) {
      console.error("POST /api/data/telegram_groups: Missing chatId or groupName", { body });
      return NextResponse.json(
        { error: "Chat ID and Group Name are required" },
        { status: 400 }
      );
    }

    if (!/^-?\d+$/.test(chatId)) {
      console.error("POST /api/data/telegram_groups: Invalid chatId format", { chatId });
      return NextResponse.json(
        { error: "Chat ID must be a valid integer (e.g., -123456789)" },
        { status: 400 }
      );
    }

    connection = await getDbConnection();
    await connection.execute(
      "INSERT INTO tbl_telegramgroups (group_id, group_name) VALUES (?, ?)",
      [chatId, groupName]
    );

    // console.log("POST /api/data/telegram_groups: Added group:", { chatId, groupName });
    return NextResponse.json(
      { message: "Group added successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("POST /api/data/telegram_groups error:", error);
    return NextResponse.json(
      { error: `Failed to add group: ${error.message || "Unknown error"}` },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}

export async function PUT(request: Request) {
  const authHeader = request.headers.get("authorization");
  const userId = verifyToken(authHeader);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized: Invalid or missing token" }, { status: 401 });
  }

  let connection;
  try {
    const body = await request.json();
    const { id, chatId, groupName } = body;

    if (!id || !chatId || !groupName) {
      console.error("PUT /api/data/telegram_groups: Missing id, chatId, or groupName", { body });
      return NextResponse.json(
        { error: "ID, Chat ID, and Group Name are required" },
        { status: 400 }
      );
    }

    if (!/^-?\d+$/.test(chatId)) {
      console.error("PUT /api/data/telegram_groups: Invalid chatId format", { chatId });
      return NextResponse.json(
        { error: "Chat ID must be a valid integer (e.g., -123456789)" },
        { status: 400 }
      );
    }

    connection = await getDbConnection();
    const [result] = await connection.execute(
      "UPDATE tbl_telegramgroups SET group_id = ?, group_name = ? WHERE id = ?",
      [chatId, groupName, id]
    );

    if ((result as any).affectedRows === 0) {
      console.warn("PUT /api/data/telegram_groups: No group found with id", { id });
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // console.log("PUT /api/data/telegram_groups: Updated group:", { id, chatId, groupName });
    return NextResponse.json(
      { message: "Group updated successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("PUT /api/data/telegram_groups error:", error);
    return NextResponse.json(
      { error: `Failed to update group: ${error.message || "Unknown error"}` },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}

export async function DELETE(request: Request) {
  const authHeader = request.headers.get("authorization");
  const userId = verifyToken(authHeader);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized: Invalid or missing token" }, { status: 401 });
  }

  let connection;
  try {
    const body = await request.json();
    const { chatId } = body;

    if (!chatId) {
      console.error("DELETE /api/data/telegram_groups: Missing chatId", { body });
      return NextResponse.json({ error: "Chat ID is required" }, { status: 400 });
    }

    connection = await getDbConnection();
    const [result] = await connection.execute(
      "DELETE FROM tbl_telegramgroups WHERE group_id = ?",
      [chatId]
    );

    if ((result as any).affectedRows === 0) {
      console.warn("DELETE /api/data/telegram_groups: No group found with chatId", { chatId });
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // console.log("DELETE /api/data/telegram_groups: Deleted group:", { chatId });
    return NextResponse.json({ message: "Group deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("DELETE /api/data/telegram_groups error:", error);
    return NextResponse.json(
      { error: `Failed to delete group: ${error.message || "Unknown error"}` },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}

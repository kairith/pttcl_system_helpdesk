
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
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET environment variable is not set");
    }
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    ) as CustomJwtPayload;
    const userId =
      decoded.users_id || decoded.sub || decoded.userId || decoded.id || null;
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
    return NextResponse.json(
      { error: "Unauthorized: Invalid or missing token" },
      { status: 401 }
    );
  }

  let connection;
  try {
    connection = await getDbConnection();
    const [rows] = await connection.execute(
      `SELECT 
         u.users_id, 
         u.users_name, 
         tg.group_id AS chatId,
         tg.group_name AS groupName
       FROM tbl_user_groups ug
       JOIN tbl_users u ON ug.users_id = u.users_id
       JOIN tbl_telegramgroups tg ON ug.group_id = tg.group_id`
    );

    const userGroups = (
      rows as {
        users_id: number;
        users_name: string;
        chatId: string;
        groupName: string;
      }[]
    ).map((row) => ({
      users_id: String(row.users_id),
      username: row.users_name,
      chatId: String(row.chatId),
      groupName: row.groupName,
    }));

    // console.log("GET /api/data/user_groups: Fetched user groups:", userGroups);
    return NextResponse.json(userGroups, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/data/user_groups error:", error);
    return NextResponse.json(
      {
        error: `Failed to fetch user-group associations: ${
          error.message || "Unknown error"
        }`,
      },
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
    return NextResponse.json(
      { error: "Unauthorized: Invalid or missing token" },
      { status: 401 }
    );
  }

  let connection;
  try {
    const body = await request.json();
    const { users_id, chatId } = body;

    if (!users_id || !chatId) {
      console.error("POST /api/data/user_groups: Missing users_id or chatId", {
        body,
      });
      return NextResponse.json(
        { error: "User ID and Chat ID are required" },
        { status: 400 }
      );
    }

    // Validate chatId as a negative integer (e.g., -123456789, -1002819438719, -4853473398)
    if (!/^-\d+$/.test(chatId)) {
      console.error("POST /api/data/user_groups: Invalid chatId format", {
        chatId,
      });
      return NextResponse.json(
        {
          error:
            "Chat ID must be a negative integer (e.g., -123456789, -1002819438719)",
        },
        { status: 400 }
      );
    }

    connection = await getDbConnection();

    // Check if the users_id exists in tbl_users
    const [userRows] = await connection.execute(
      "SELECT 1 FROM tbl_users WHERE users_id = ?",
      [users_id]
    );
    if ((userRows as any[]).length === 0) {
      console.error("POST /api/data/user_groups: Invalid users_id", {
        users_id,
      });
      return NextResponse.json(
        { error: `User ID '${users_id}' not found in tbl_users` },
        { status: 400 }
      );
    }

    // Check if the chatId exists in tbl_telegramgroups
    const [groupRows] = await connection.execute(
      "SELECT 1 FROM tbl_telegramgroups WHERE group_id = ?",
      [chatId]
    );
    if ((groupRows as any[]).length === 0) {
      console.error("POST /api/data/user_groups: Invalid chatId", {
        chatId,
      });
      return NextResponse.json(
        { error: `Chat ID '${chatId}' not found in tbl_telegramgroups` },
        { status: 400 }
      );
    }

    // Check for existing association
    const [existing] = await connection.execute(
      "SELECT 1 FROM tbl_user_groups WHERE users_id = ?",
      [users_id]
    );
    if ((existing as any[]).length > 0) {
      // Update existing association
      await connection.execute(
        "UPDATE tbl_user_groups SET group_id = ? WHERE users_id = ?",
        [chatId, users_id]
      );
    } else {
      // Insert new association
      await connection.execute(
        "INSERT INTO tbl_user_groups (users_id, group_id) VALUES (?, ?)",
        [users_id, chatId]
      );
    }

    console.info("POST /api/data/user_groups: Saved user-group association", {
      users_id,
      chatId,
      userId,
    });
    return NextResponse.json(
      { message: "User-group association saved successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("POST /api/data/user_groups error:", error);
    return NextResponse.json(
      {
        error: `Failed to save user-group association: ${
          error.message || "Unknown error"
        }`,
      },
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
    return NextResponse.json(
      { error: "Unauthorized: Invalid or missing token" },
      { status: 401 }
    );
  }

  let connection;
  try {
    const body = await request.json();
    const { users_id, chatId } = body;

    if (!users_id || !chatId) {
      console.error("PUT /api/data/user_groups: Missing users_id or chatId", {
        body,
      });
      return NextResponse.json(
        { error: "User ID and Chat ID are required" },
        { status: 400 }
      );
    }

    // Validate chatId as a negative integer (e.g., -123456789, -1002819438719)
    if (!/^-\d+$/.test(chatId)) {
      console.error("PUT /api/data/user_groups: Invalid chatId format", {
        chatId,
      });
      return NextResponse.json(
        {
          error:
            "Chat ID must be a negative integer (e.g., -123456789, -1002819438719)",
        },
        { status: 400 }
      );
    }

    connection = await getDbConnection();

    // Check if the users_id exists in tbl_users
    const [userRows] = await connection.execute(
      "SELECT 1 FROM tbl_users WHERE users_id = ?",
      [users_id]
    );
    if ((userRows as any[]).length === 0) {
      console.error("PUT /api/data/user_groups: Invalid users_id", {
        users_id,
      });
      return NextResponse.json(
        { error: `User ID '${users_id}' not found in tbl_users` },
        { status: 400 }
      );
    }

    // Check if the chatId exists in tbl_telegramgroups
    const [groupRows] = await connection.execute(
      "SELECT 1 FROM tbl_telegramgroups WHERE group_id = ?",
      [chatId]
    );
    if ((groupRows as any[]).length === 0) {
      console.error("PUT /api/data/user_groups: Invalid chatId", {
        chatId,
      });
      return NextResponse.json(
        { error: `Chat ID '${chatId}' not found in tbl_telegramgroups` },
        { status: 400 }
      );
    }

    // Check if the association exists
    const [existing] = await connection.execute(
      "SELECT 1 FROM tbl_user_groups WHERE users_id = ?",
      [users_id]
    );
    if ((existing as any[]).length === 0) {
      console.warn("PUT /api/data/user_groups: No association found for users_id", {
        users_id,
      });
      return NextResponse.json(
        { error: `No association found for User ID '${users_id}'` },
        { status: 404 }
      );
    }

    // Update the association
    const [result] = await connection.execute(
      "UPDATE tbl_user_groups SET group_id = ? WHERE users_id = ?",
      [chatId, users_id]
    );

    if ((result as any).affectedRows === 0) {
      console.warn("PUT /api/data/user_groups: No association updated for users_id", {
        users_id,
      });
      return NextResponse.json(
        { error: `No association updated for User ID '${users_id}'` },
        { status: 404 }
      );
    }

    console.info("PUT /api/data/user_groups: Updated user-group association", {
      users_id,
      chatId,
      userId,
    });
    return NextResponse.json(
      { message: "User-group association updated successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("PUT /api/data/user_groups error:", error);
    return NextResponse.json(
      {
        error: `Failed to update user-group association: ${
          error.message || "Unknown error"
        }`,
      },
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
    return NextResponse.json(
      { error: "Unauthorized: Invalid or missing token" },
      { status: 401 }
    );
  }

  let connection;
  try {
    const body = await request.json();
    const { users_id, chatId } = body;

    if (!users_id || !chatId) {
      console.error("DELETE /api/data/user_groups: Missing users_id or chatId", {
        body,
      });
      return NextResponse.json(
        { error: "User ID and Chat ID are required" },
        { status: 400 }
      );
    }

    connection = await getDbConnection();

    // Check if the association exists
    const [existing] = await connection.execute(
      "SELECT 1 FROM tbl_user_groups WHERE users_id = ? AND group_id = ?",
      [users_id, chatId]
    );
    if ((existing as any[]).length === 0) {
      console.warn("DELETE /api/data/user_groups: No association found", {
        users_id,
        chatId,
      });
      return NextResponse.json(
        { error: `No association found for User ID '${users_id}' and Chat ID '${chatId}'` },
        { status: 404 }
      );
    }

    // Delete the association
    const [result] = await connection.execute(
      "DELETE FROM tbl_user_groups WHERE users_id = ? AND group_id = ?",
      [users_id, chatId]
    );

    if ((result as any).affectedRows === 0) {
      console.warn("DELETE /api/data/user_groups: No association deleted", {
        users_id,
        chatId,
      });
      return NextResponse.json(
        { error: `No association deleted for User ID '${users_id}' and Chat ID '${chatId}'` },
        { status: 404 }
      );
    }

    console.info("DELETE /api/data/user_groups: Deleted user-group association", {
      users_id,
      chatId,
      userId,
    });
    return NextResponse.json(
      { message: "User-group association deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("DELETE /api/data/user_groups error:", error);
    return NextResponse.json(
      {
        error: `Failed to delete user-group association: ${
          error.message || "Unknown error"
        }`,
      },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}

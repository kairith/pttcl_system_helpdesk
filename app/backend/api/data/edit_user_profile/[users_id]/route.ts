import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import { dbConfig } from "@/app/database/db-config";
import { v4 as uuidv4 } from "uuid";
import { uploadToMinio, deleteFromMinio } from "@/app/backend/lib/minio";
// route for update profile

export async function GET(request: Request, { params }: { params: Promise<{ users_id: string }> }) {
  const paramsData = await params;
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  // console.log("Fetching user with ID:", paramsData.users_id);
  // console.log("Received token:", token);

  const connection = await mysql.createConnection(dbConfig);
  try {
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      `SELECT u.users_id, u.users_name, u.email, u.company, i.image_path AS user_image
       FROM tbl_users u
       LEFT JOIN tbl_user_image i ON u.users_id = i.users_id
       WHERE u.users_id = ?`,
      [paramsData.users_id]
    );
    if (Array.isArray(rows) && rows.length > 0) {
      const user = rows[0];
      return NextResponse.json({
        users_id: user.users_id,
        users_name: user.users_name,
        email: user.email,
        company: user.company || null,
        user_image: user.user_image || null,
      });
    }
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  } finally {
    await connection.end();
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ users_id: string }> }) {
  const paramsData = await params;
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  // console.log("Received token:", token);

  if (!token) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const clonedRequest = request.clone();
    const formData = await clonedRequest.formData();
    const users_name = formData.get("users_name")?.toString()?.trim();
    const email = formData.get("email")?.toString()?.trim();
    const password = formData.get("password")?.toString();
    const company = formData.get("company")?.toString()?.trim() || null;
    const user_image = formData.get("user_image") as File | null;
    const remove_image = formData.get("remove_image")?.toString() === "true";

    if (!users_name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const connection = await mysql.createConnection(dbConfig);
    try {
      const [userRows] = await connection.execute<mysql.RowDataPacket[]>(
        "SELECT password FROM tbl_users WHERE users_id = ?",
        [paramsData.users_id]
      );
      if (!Array.isArray(userRows) || userRows.length === 0) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      let updatePassword = userRows[0].password;
      if (password) {
        updatePassword = await bcrypt.hash(password, 10);
      }

      await connection.beginTransaction();

      await connection.execute(
        "UPDATE tbl_users SET users_name = ?, email = ?, password = ?, company = ? WHERE users_id = ?",
        [users_name, email, updatePassword, company, paramsData.users_id]
      );

      if (user_image) {
        const fileExtension = user_image.name.split(".").pop();
        const objectKey = `user-images/user_${uuidv4()}.${fileExtension}`;
        const imagePath = await uploadToMinio(
          Buffer.from(await user_image.arrayBuffer()),
          objectKey,
          user_image.type || "application/octet-stream"
        );

        await connection.execute(
          `INSERT INTO tbl_user_image (users_id, image_path)
           VALUES (?, ?)
           ON DUPLICATE KEY UPDATE image_path = ?`,
          [paramsData.users_id, imagePath, imagePath]
        );
      } else if (remove_image) {
        const [imageRows] = await connection.execute<mysql.RowDataPacket[]>(
          "SELECT image_path FROM tbl_user_image WHERE users_id = ?",
          [paramsData.users_id]
        );
        if (imageRows.length > 0 && imageRows[0].image_path) {
          await deleteFromMinio(imageRows[0].image_path);
        }
        await connection.execute("DELETE FROM tbl_user_image WHERE users_id = ?", [
          paramsData.users_id,
        ]);
      }

      await connection.commit();
      return NextResponse.json({ message: "User updated successfully" });
    } catch (error) {
      await connection.rollback();
      console.error("PUT error:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error("FormData error:", error);
    return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
  }
}
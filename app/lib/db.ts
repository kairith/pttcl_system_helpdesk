import mysql from "mysql2/promise";

   export async function getConnection() {
     try {
       const connection = await mysql.createConnection({
         host: process.env.DATABASE_HOST || "localhost",
         port: 3306, // Default MySQL port
         user: process.env.DATABASE_USER || "root",
         password: process.env.DATABASE_PASSWORD || "1122",
         database: process.env.DATABASE_NAME || "pttcl_helpdesk_nextjs",
       });
       console.log("Database connection established");
       return connection;
     } catch (error: any) {
       console.error("Database connection error:", error.message);
       throw error;
     }
   }
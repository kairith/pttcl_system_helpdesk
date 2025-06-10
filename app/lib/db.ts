import mysql from "mysql2/promise";
import { dbConfig } from "../database/db-config";

   export async function getConnection() {
     try {
       const connection = await mysql.createConnection(dbConfig);
       console.log("Database connection established");
       return connection;
     } catch (error: any) {
       console.error("Database connection error:", error.message);
       throw error;
     }
   }
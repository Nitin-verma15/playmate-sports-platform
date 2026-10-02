import fs from "fs";
import path from "path";
import { pool } from "../config/database";

async function initDB() {
  try {
    const schemaPath = path.resolve(__dirname, "../../../database/schema.sql");
    const sql = fs.readFileSync(schemaPath, "utf-8");

    console.log("Initializing database tables...");
    await pool.query(sql);
    console.log("Database initialized successfully.");
  } catch (err) {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initDB();

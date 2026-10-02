import cors from "cors";
import express from "express";
import { pool } from "./config/database";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", async (_request, response) => {
  try {
    const result = await pool.query<{ database_time: Date }>(
      "SELECT NOW() AS database_time"
    );

    response.status(200).json({
      status: "ok",
      database: "connected",
      databaseTime: result.rows[0].database_time,
    });
  } catch (error) {
    console.error("Database health check failed:", error);
    response.status(503).json({
      status: "error",
      database: "disconnected",
    });
  }
});

export default app;

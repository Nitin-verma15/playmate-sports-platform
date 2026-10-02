import cors from "cors";
import express from "express";
import { pool } from "./config/database";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS current_time");
    res.json({
      status: "ok",
      database: "connected",
      time: result.rows[0].current_time,
    });
  } catch (err) {
    console.error("Database health check error:", err);
    res.status(500).json({
      status: "error",
      database: "disconnected",
    });
  }
});

export default app;

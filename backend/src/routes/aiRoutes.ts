import { Router, Request, Response, NextFunction } from "express";
import { searchGames } from "../services/aiService";

const router = Router();

router.post("/search", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      res.status(400).json({
        error: { message: "Query is required", code: "MISSING_QUERY" },
      });
      return;
    }

    const result = await searchGames(query.trim());
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

export default router;

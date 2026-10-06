import { Request, Response, NextFunction } from "express";
import * as gameService from "../services/gameService";
import { getGamesQuerySchema } from "../validators/gameSchemas";

export async function createGame(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: {
          message: "Unauthorized",
          code: "UNAUTHORIZED",
        },
      });
    }

    const game = await gameService.createGame(req.user.uid, req.body);

    if (!game) {
      return res.status(404).json({
        error: {
          message: "User profile not found. Please complete profile first.",
          code: "USER_NOT_FOUND",
        },
      });
    }

    return res.status(201).json({ game });
  } catch (err) {
    next(err);
  }
}

export async function getGames(req: Request, res: Response, next: NextFunction) {
  try {
    const parseResult = getGamesQuerySchema.safeParse(req.query);

    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0];
      return res.status(400).json({
        error: {
          message: firstIssue ? firstIssue.message : "Invalid query parameters",
          code: "INVALID_QUERY",
        },
      });
    }

    const games = await gameService.getGames(parseResult.data);
    return res.status(200).json({ games, count: games.length });
  } catch (err) {
    next(err);
  }
}

export async function getGameById(req: Request, res: Response, next: NextFunction) {
  try {
    const gameId = parseInt(String(req.params.id), 10);

    if (isNaN(gameId)) {
      return res.status(400).json({
        error: {
          message: "Invalid game ID",
          code: "INVALID_ID",
        },
      });
    }

    const game = await gameService.getGameById(gameId);

    if (!game) {
      return res.status(404).json({
        error: {
          message: "Game not found",
          code: "GAME_NOT_FOUND",
        },
      });
    }

    return res.status(200).json({ game });
  } catch (err) {
    next(err);
  }
}

export async function updateGame(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: {
          message: "Unauthorized",
          code: "UNAUTHORIZED",
        },
      });
    }

    const gameId = parseInt(String(req.params.id), 10);
    if (isNaN(gameId)) {
      return res.status(400).json({
        error: {
          message: "Invalid game ID",
          code: "INVALID_ID",
        },
      });
    }

    const result = await gameService.updateGame(gameId, req.user.uid, req.body);

    if (result.error === "GAME_NOT_FOUND") {
      return res.status(404).json({
        error: {
          message: "Game not found",
          code: "GAME_NOT_FOUND",
        },
      });
    }

    if (result.error === "FORBIDDEN") {
      return res.status(403).json({
        error: {
          message: "Only the organizer can edit this game",
          code: "FORBIDDEN",
        },
      });
    }

    return res.status(200).json({ game: result.game });
  } catch (err) {
    next(err);
  }
}

export async function cancelGame(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: {
          message: "Unauthorized",
          code: "UNAUTHORIZED",
        },
      });
    }

    const gameId = parseInt(String(req.params.id), 10);
    if (isNaN(gameId)) {
      return res.status(400).json({
        error: {
          message: "Invalid game ID",
          code: "INVALID_ID",
        },
      });
    }

    const result = await gameService.cancelGame(gameId, req.user.uid);

    if (result.error === "GAME_NOT_FOUND") {
      return res.status(404).json({
        error: {
          message: "Game not found",
          code: "GAME_NOT_FOUND",
        },
      });
    }

    if (result.error === "FORBIDDEN") {
      return res.status(403).json({
        error: {
          message: "Only the organizer can cancel this game",
          code: "FORBIDDEN",
        },
      });
    }

    return res.status(200).json({
      message: "Game cancelled successfully",
      game: result.game,
    });
  } catch (err) {
    next(err);
  }
}

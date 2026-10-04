import { Request, Response, NextFunction } from "express";
import * as userService from "../services/userService";

export async function createProfile(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: {
          message: "Unauthorized",
          code: "UNAUTHORIZED",
        },
      });
    }

    const user = await userService.createUser(
      req.user.uid,
      req.user.email || "",
      req.body
    );
    return res.status(201).json({ user });
  } catch (err: any) {
    if (err.code === "23505") {
      return res.status(409).json({
        error: {
          message: "User profile already exists",
          code: "USER_ALREADY_EXISTS",
        },
      });
    }
    next(err);
  }
}

export async function getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: {
          message: "Unauthorized",
          code: "UNAUTHORIZED",
        },
      });
    }

    const user = await userService.getUserByFirebaseUid(req.user.uid);

    if (!user) {
      return res.status(404).json({
        error: {
          message: "User profile not found",
          code: "USER_NOT_FOUND",
        },
      });
    }

    return res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: {
          message: "Unauthorized",
          code: "UNAUTHORIZED",
        },
      });
    }

    const user = await userService.updateUser(req.user.uid, req.body);

    if (!user) {
      return res.status(404).json({
        error: {
          message: "User profile not found",
          code: "USER_NOT_FOUND",
        },
      });
    }

    return res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
}

export async function updateSports(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: {
          message: "Unauthorized",
          code: "UNAUTHORIZED",
        },
      });
    }

    const sports = await userService.setUserSports(req.user.uid, req.body.sports);

    if (!sports) {
      return res.status(404).json({
        error: {
          message: "User profile not found",
          code: "USER_NOT_FOUND",
        },
      });
    }

    return res.status(200).json({ sports });
  } catch (err) {
    next(err);
  }
}

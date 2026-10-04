import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode: number = 500, code: string = "INTERNAL_SERVER_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        message: err.message,
        code: err.code,
      },
    });
  }

  console.error(err);

  return res.status(500).json({
    error: {
      message: "Internal server error",
      code: "INTERNAL_SERVER_ERROR",
    },
  });
}

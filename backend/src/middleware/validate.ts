import { Request, Response, NextFunction } from "express";
import { ZodTypeAny } from "zod";

export function validate(schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return res.status(400).json({
        error: {
          message: firstIssue ? firstIssue.message : "Validation failed",
          code: "VALIDATION_ERROR",
        },
      });
    }

    req.body = result.data;
    next();
  };
}

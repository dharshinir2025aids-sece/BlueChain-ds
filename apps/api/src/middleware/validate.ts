import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodTypeAny } from "zod";
import { AppError } from "./errorHandler";

/**
 * Validates and replaces `req.body` with the parsed result of the given schema.
 * Throws a 422 AppError when validation fails.
 */
export function validateBody(schema: ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const message = err.errors
          .map((e) => `${e.path.join(".") || "body"}: ${e.message}`)
          .join("; ");
        next(new AppError(422, "VALIDATION_ERROR", message));
        return;
      }
      next(err);
    }
  };
}

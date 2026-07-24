import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../lib/jwt";
import { AppError } from "./errorHandler";

/**
 * Requires a valid `Authorization: Bearer <token>` header.
 * Attaches the decoded payload to `req.user`.
 */
export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    throw new AppError(401, "UNAUTHORIZED", "Missing or malformed Authorization header");
  }

  const token = header.slice("Bearer ".length).trim();

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    throw new AppError(401, "UNAUTHORIZED", "Invalid or expired token");
  }
}

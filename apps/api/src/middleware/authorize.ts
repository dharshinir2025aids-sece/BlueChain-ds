import type { NextFunction, Request, Response } from "express";
import type { Role } from "@bluechain/shared";
import { AppError } from "./errorHandler";

/**
 * Restricts a route to the given roles. Must run after `authenticate`.
 */
export function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError(401, "UNAUTHORIZED", "Authentication required");
    }
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      throw new AppError(403, "FORBIDDEN", "Insufficient role permissions");
    }
    next();
  };
}

import type { Request, Response } from "express";
import { AppError } from "../../middleware/errorHandler";
import * as authService from "./auth.service";

export async function register(req: Request, res: Response) {
  const result = await authService.register(req.body);
  res.status(201).json({ success: true, data: result });
}

export async function createUser(req: Request, res: Response) {
  const user = await authService.adminCreateUser(req.body);
  res.status(201).json({ success: true, data: user });
}

export async function login(req: Request, res: Response) {
  const result = await authService.login(req.body);
  res.status(200).json({ success: true, data: result });
}

export async function me(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  }
  const user = await authService.getProfile(req.user.sub);
  res.status(200).json({ success: true, data: user });
}

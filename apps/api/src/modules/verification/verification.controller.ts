import type { Request, Response } from "express";
import { AppError } from "../../middleware/errorHandler";
import { listVerificationQuerySchema, decideVerificationSchema } from "./verification.validation";
import * as verificationService from "./verification.service";

/** GET /v1/verification */
export async function listVerificationPackages(req: Request, res: Response) {
  if (!req.user) throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  const query = listVerificationQuerySchema.parse(req.query);
  const result = await verificationService.listVerificationPackages(query, req.user);
  res.status(200).json({ success: true, data: result });
}

/** GET /v1/verification/:id */
export async function getVerificationPackage(req: Request, res: Response) {
  if (!req.user) throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  const { id } = req.params as { id: string };
  const vp = await verificationService.getVerificationPackage(id, req.user);
  res.status(200).json({ success: true, data: vp });
}

/** POST /v1/verification/:id/decide */
export async function decideVerification(req: Request, res: Response) {
  if (!req.user) throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  const { id } = req.params as { id: string };
  const vp = await verificationService.decideVerification(id, req.body, req.user);
  res.status(200).json({ success: true, data: vp });
}

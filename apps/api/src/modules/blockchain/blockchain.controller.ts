import type { Request, Response } from "express";
import { AppError } from "../../middleware/errorHandler";
import { listCreditsQuerySchema } from "./blockchain.validation";
import * as blockchainService from "./blockchain.service";

// ─── Anchor handlers ──────────────────────────────────────────────────────────

/** GET /v1/blockchain/:reportId */
export async function getAnchor(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  }
  const { reportId } = req.params as { reportId: string };
  const anchor = await blockchainService.getAnchorByReport(reportId, req.user);
  res.status(200).json({ success: true, data: anchor });
}

/** GET /v1/blockchain/:reportId/status */
export async function getAnchorStatus(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  }
  const { reportId } = req.params as { reportId: string };
  const status = await blockchainService.getAnchorStatus(reportId, req.user);
  res.status(200).json({ success: true, data: status });
}

/** POST /v1/blockchain/:reportId/anchor */
export async function anchorReport(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  }
  const { reportId } = req.params as { reportId: string };
  const anchor = await blockchainService.anchorReport(reportId, req.body, req.user);
  res.status(201).json({ success: true, data: anchor });
}

/** POST /v1/blockchain/:reportId/confirm */
export async function confirmAnchor(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  }
  const { reportId } = req.params as { reportId: string };
  const anchor = await blockchainService.confirmAnchor(reportId, req.body, req.user);
  res.status(200).json({ success: true, data: anchor });
}

// ─── Credit handlers ──────────────────────────────────────────────────────────

/** POST /v1/blockchain/credits */
export async function mintCredit(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  }
  const credit = await blockchainService.mintCredit(req.body, req.user);
  res.status(201).json({ success: true, data: credit });
}

/** GET /v1/blockchain/credits */
export async function listCredits(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  }
  const query = listCreditsQuerySchema.parse(req.query);
  const result = await blockchainService.listCredits(query, req.user);
  res.status(200).json({ success: true, data: result });
}

/** GET /v1/blockchain/credits/:id */
export async function getCredit(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  }
  const { id } = req.params as { id: string };
  const credit = await blockchainService.getCreditById(id, req.user);
  res.status(200).json({ success: true, data: credit });
}

/** POST /v1/blockchain/credits/:id/transfer */
export async function transferCredit(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  }
  const { id } = req.params as { id: string };
  const transfer = await blockchainService.transferCredit(id, req.body, req.user);
  res.status(201).json({ success: true, data: transfer });
}

/** POST /v1/blockchain/credits/:id/retire */
export async function retireCredit(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  }
  const { id } = req.params as { id: string };
  const retirement = await blockchainService.retireCredit(id, req.body, req.user);
  res.status(201).json({ success: true, data: retirement });
}

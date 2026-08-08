import type { Request, Response } from "express";
import { AppError } from "../../middleware/errorHandler";
import { listListingsQuerySchema } from "./marketplace.validation";
import * as marketplaceService from "./marketplace.service";

// ─── Listing handlers ─────────────────────────────────────────────────────────

/** GET /v1/marketplace/listings */
export async function listListings(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  }
  const query = listListingsQuerySchema.parse(req.query);
  const result = await marketplaceService.listListings(query, req.user);
  res.status(200).json({ success: true, data: result });
}

/** GET /v1/marketplace/listings/:id */
export async function getListing(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  }
  const { id } = req.params as { id: string };
  const listing = await marketplaceService.getListingById(id, req.user);
  res.status(200).json({ success: true, data: listing });
}

/** POST /v1/marketplace/listings */
export async function createListing(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  }
  const listing = await marketplaceService.createListing(req.body, req.user);
  res.status(201).json({ success: true, data: listing });
}

/** PUT /v1/marketplace/listings/:id */
export async function updateListing(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  }
  const { id } = req.params as { id: string };
  const listing = await marketplaceService.updateListing(id, req.body, req.user);
  res.status(200).json({ success: true, data: listing });
}

/** DELETE /v1/marketplace/listings/:id */
export async function cancelListing(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  }
  const { id } = req.params as { id: string };
  await marketplaceService.cancelListing(id, req.user);
  res.status(200).json({ success: true, data: null });
}

// ─── Purchase handler ─────────────────────────────────────────────────────────

/** POST /v1/marketplace/listings/:id/purchase */
export async function purchaseListing(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  }
  const { id } = req.params as { id: string };
  const result = await marketplaceService.purchaseListing(id, req.body, req.user);
  res.status(201).json({ success: true, data: result });
}

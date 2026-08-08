import { Router, type Router as RouterType } from "express";
import { Role } from "@bluechain/shared";
import { asyncHandler } from "../../lib/asyncHandler";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { validateBody } from "../../middleware/validate";
import * as marketplaceController from "./marketplace.controller";
import {
  createListingSchema,
  updateListingSchema,
  purchaseListingSchema,
} from "./marketplace.validation";

export const marketplaceRouter: RouterType = Router();

// ─── Authorization summary ────────────────────────────────────────────────────
//
// Browse/read  — all authenticated roles
// Create listing — credit owner: NGO_MANAGER, NCCR_ADMIN, SUPER_ADMIN
//                  (CORPORATE_BUYER may list credits they own)
// Update/cancel  — seller (credit owner) or NCCR_ADMIN / SUPER_ADMIN
// Purchase       — CORPORATE_BUYER, NGO_MANAGER, NCCR_ADMIN, SUPER_ADMIN
//                  (enforcement of owner ≠ buyer is in the service layer)
//
// FIELD_WORKER — read-only; cannot create, update, cancel, or purchase.

// ─── Read routes (all authenticated) ─────────────────────────────────────────

marketplaceRouter.get(
  "/listings",
  authenticate,
  asyncHandler(marketplaceController.listListings),
);

marketplaceRouter.get(
  "/listings/:id",
  authenticate,
  asyncHandler(marketplaceController.getListing),
);

// ─── Create listing ───────────────────────────────────────────────────────────
// Any role that can own a credit may list it.
// FIELD_WORKER cannot own credits, so is excluded.

marketplaceRouter.post(
  "/listings",
  authenticate,
  authorize(
    Role.CORPORATE_BUYER,
    Role.NGO_MANAGER,
    Role.NCCR_ADMIN,
    Role.SUPER_ADMIN,
  ),
  validateBody(createListingSchema),
  asyncHandler(marketplaceController.createListing),
);

// ─── Update listing ───────────────────────────────────────────────────────────

marketplaceRouter.put(
  "/listings/:id",
  authenticate,
  authorize(
    Role.CORPORATE_BUYER,
    Role.NGO_MANAGER,
    Role.NCCR_ADMIN,
    Role.SUPER_ADMIN,
  ),
  validateBody(updateListingSchema),
  asyncHandler(marketplaceController.updateListing),
);

// ─── Cancel listing ───────────────────────────────────────────────────────────

marketplaceRouter.delete(
  "/listings/:id",
  authenticate,
  authorize(
    Role.CORPORATE_BUYER,
    Role.NGO_MANAGER,
    Role.NCCR_ADMIN,
    Role.SUPER_ADMIN,
  ),
  asyncHandler(marketplaceController.cancelListing),
);

// ─── Purchase listing ─────────────────────────────────────────────────────────
// Any authenticated role that is not the seller may purchase.
// Self-purchase enforcement is in the service layer.

marketplaceRouter.post(
  "/listings/:id/purchase",
  authenticate,
  authorize(
    Role.CORPORATE_BUYER,
    Role.NGO_MANAGER,
    Role.NCCR_ADMIN,
    Role.SUPER_ADMIN,
  ),
  validateBody(purchaseListingSchema),
  asyncHandler(marketplaceController.purchaseListing),
);

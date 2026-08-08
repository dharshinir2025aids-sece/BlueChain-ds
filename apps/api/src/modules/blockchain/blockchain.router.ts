import { Router, type Router as RouterType } from "express";
import { Role } from "@bluechain/shared";
import { asyncHandler } from "../../lib/asyncHandler";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { validateBody } from "../../middleware/validate";
import * as blockchainController from "./blockchain.controller";
import {
  anchorReportSchema,
  confirmAnchorSchema,
  mintCreditSchema,
  transferCreditSchema,
  retireCreditSchema,
} from "./blockchain.validation";

export const blockchainRouter: RouterType = Router();

// ─── Anchor routes ─────────────────────────────────────────────────────────────
//
// GET    /v1/blockchain/:reportId          — retrieve anchor record
// GET    /v1/blockchain/:reportId/status   — check anchored/confirmed status
// POST   /v1/blockchain/:reportId/anchor   — anchor an APPROVED report
// POST   /v1/blockchain/:reportId/confirm  — confirm txHash/blockNumber
//
// Read:  all authenticated roles (service layer applies org-scoping)
// Write: NGO_MANAGER (own org), NCCR_ADMIN, SUPER_ADMIN

// ─── Credit routes must come BEFORE :reportId to avoid param shadowing ────────

// GET  /v1/blockchain/credits
blockchainRouter.get(
  "/credits",
  authenticate,
  asyncHandler(blockchainController.listCredits),
);

// GET  /v1/blockchain/credits/:id
blockchainRouter.get(
  "/credits/:id",
  authenticate,
  asyncHandler(blockchainController.getCredit),
);

// POST /v1/blockchain/credits
blockchainRouter.post(
  "/credits",
  authenticate,
  authorize(Role.NCCR_ADMIN, Role.SUPER_ADMIN),
  validateBody(mintCreditSchema),
  asyncHandler(blockchainController.mintCredit),
);

// POST /v1/blockchain/credits/:id/transfer
blockchainRouter.post(
  "/credits/:id/transfer",
  authenticate,
  authorize(Role.NCCR_ADMIN, Role.SUPER_ADMIN),
  validateBody(transferCreditSchema),
  asyncHandler(blockchainController.transferCredit),
);

// POST /v1/blockchain/credits/:id/retire
// CORPORATE_BUYER may retire their own; NCCR_ADMIN / SUPER_ADMIN any.
blockchainRouter.post(
  "/credits/:id/retire",
  authenticate,
  authorize(Role.CORPORATE_BUYER, Role.NCCR_ADMIN, Role.SUPER_ADMIN),
  validateBody(retireCreditSchema),
  asyncHandler(blockchainController.retireCredit),
);

// ─── Anchor routes (keyed by :reportId) ───────────────────────────────────────

// GET /v1/blockchain/:reportId
blockchainRouter.get(
  "/:reportId",
  authenticate,
  asyncHandler(blockchainController.getAnchor),
);

// GET /v1/blockchain/:reportId/status
blockchainRouter.get(
  "/:reportId/status",
  authenticate,
  asyncHandler(blockchainController.getAnchorStatus),
);

// POST /v1/blockchain/:reportId/anchor
blockchainRouter.post(
  "/:reportId/anchor",
  authenticate,
  authorize(Role.NGO_MANAGER, Role.NCCR_ADMIN, Role.SUPER_ADMIN),
  validateBody(anchorReportSchema),
  asyncHandler(blockchainController.anchorReport),
);

// POST /v1/blockchain/:reportId/confirm
blockchainRouter.post(
  "/:reportId/confirm",
  authenticate,
  authorize(Role.NGO_MANAGER, Role.NCCR_ADMIN, Role.SUPER_ADMIN),
  validateBody(confirmAnchorSchema),
  asyncHandler(blockchainController.confirmAnchor),
);

import { Router, type Router as RouterType } from "express";
import { Role } from "@bluechain/shared";
import { asyncHandler } from "../../lib/asyncHandler";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { validateBody } from "../../middleware/validate";
import * as verificationController from "./verification.controller";
import { decideVerificationSchema } from "./verification.validation";

export const verificationRouter: RouterType = Router();

// ─── Read ─────────────────────────────────────────────────────────────────────
// VERIFIER   — sees packages assigned to them + unassigned PENDING ones.
// NGO_MANAGER — sees packages for their org's reports.
// NCCR_ADMIN / SUPER_ADMIN — unrestricted.

verificationRouter.get(
  "/",
  authenticate,
  asyncHandler(verificationController.listVerificationPackages),
);

verificationRouter.get(
  "/:id",
  authenticate,
  asyncHandler(verificationController.getVerificationPackage),
);

// ─── Decide — VERIFIER, NCCR_ADMIN, SUPER_ADMIN ───────────────────────────────

verificationRouter.post(
  "/:id/decide",
  authenticate,
  authorize(Role.VERIFIER, Role.NCCR_ADMIN, Role.SUPER_ADMIN),
  validateBody(decideVerificationSchema),
  asyncHandler(verificationController.decideVerification),
);

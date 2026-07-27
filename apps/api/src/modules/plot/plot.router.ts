import { Router, type Router as RouterType } from "express";
import { Role } from "@bluechain/shared";
import { asyncHandler } from "../../lib/asyncHandler";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { validateBody } from "../../middleware/validate";
import * as plotController from "./plot.controller";
import { createPlotSchema, updatePlotSchema } from "./plot.validation";

export const plotRouter: RouterType = Router();

// ─── Read — all authenticated roles ──────────────────────────────────────────
// FIELD_WORKER, VERIFIER, NCCR_ADMIN, SUPER_ADMIN, NGO_MANAGER, CORPORATE_BUYER

plotRouter.get(
  "/",
  authenticate,
  asyncHandler(plotController.listPlots),
);

plotRouter.get(
  "/:id",
  authenticate,
  asyncHandler(plotController.getPlot),
);

// ─── Create — NGO_MANAGER only ────────────────────────────────────────────────

plotRouter.post(
  "/",
  authenticate,
  authorize(Role.NGO_MANAGER),
  validateBody(createPlotSchema),
  asyncHandler(plotController.createPlot),
);

// ─── Update — NGO_MANAGER (own org) + NCCR_ADMIN + SUPER_ADMIN ───────────────

plotRouter.put(
  "/:id",
  authenticate,
  authorize(Role.NGO_MANAGER, Role.NCCR_ADMIN, Role.SUPER_ADMIN),
  validateBody(updatePlotSchema),
  asyncHandler(plotController.updatePlot),
);

// ─── Delete — NGO_MANAGER only (ownership enforced in service) ────────────────

plotRouter.delete(
  "/:id",
  authenticate,
  authorize(Role.NGO_MANAGER),
  asyncHandler(plotController.deletePlot),
);

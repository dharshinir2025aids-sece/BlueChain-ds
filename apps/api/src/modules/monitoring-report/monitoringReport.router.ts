import { Router, type Router as RouterType } from "express";
import { Role } from "@bluechain/shared";
import { asyncHandler } from "../../lib/asyncHandler";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { validateBody } from "../../middleware/validate";
import * as reportController from "./monitoringReport.controller";
import {
  createMonitoringReportSchema,
  updateMonitoringReportSchema,
} from "./monitoringReport.validation";

export const monitoringReportRouter: RouterType = Router();

// ─── Read ─────────────────────────────────────────────────────────────────────
// All authenticated roles may read reports.
// Service layer applies org-scoping for NGO_MANAGER.

monitoringReportRouter.get(
  "/",
  authenticate,
  asyncHandler(reportController.listMonitoringReports),
);

monitoringReportRouter.get(
  "/:id",
  authenticate,
  asyncHandler(reportController.getMonitoringReport),
);

// ─── Create — NGO_MANAGER, NCCR_ADMIN, SUPER_ADMIN ───────────────────────────
// FIELD_WORKER does not create monitoring reports (they create observations).

monitoringReportRouter.post(
  "/",
  authenticate,
  authorize(Role.NGO_MANAGER, Role.NCCR_ADMIN, Role.SUPER_ADMIN),
  validateBody(createMonitoringReportSchema),
  asyncHandler(reportController.createMonitoringReport),
);

// ─── Update — NGO_MANAGER (own org), NCCR_ADMIN, SUPER_ADMIN ─────────────────
// Ownership and status-transition guards are in the service layer.

monitoringReportRouter.put(
  "/:id",
  authenticate,
  authorize(Role.NGO_MANAGER, Role.NCCR_ADMIN, Role.SUPER_ADMIN),
  validateBody(updateMonitoringReportSchema),
  asyncHandler(reportController.updateMonitoringReport),
);

// ─── Delete — DRAFT only; NGO_MANAGER (own org), NCCR_ADMIN, SUPER_ADMIN ─────

monitoringReportRouter.delete(
  "/:id",
  authenticate,
  authorize(Role.NGO_MANAGER, Role.NCCR_ADMIN, Role.SUPER_ADMIN),
  asyncHandler(reportController.deleteMonitoringReport),
);

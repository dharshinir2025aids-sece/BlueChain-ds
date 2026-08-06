import { Router, type Router as RouterType } from "express";
import { Role } from "@bluechain/shared";
import { asyncHandler } from "../../lib/asyncHandler";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { validateBody } from "../../middleware/validate";
import * as observationController from "./observation.controller";
import {
  createObservationSchema,
  updateObservationSchema,
} from "./observation.validation";

export const observationRouter: RouterType = Router();

// ─── Read — all authenticated roles ──────────────────────────────────────────
// Service layer scopes FIELD_WORKER results to their own records.

observationRouter.get(
  "/",
  authenticate,
  asyncHandler(observationController.listObservations),
);

observationRouter.get(
  "/:id",
  authenticate,
  asyncHandler(observationController.getObservation),
);

// ─── Create — FIELD_WORKER, NGO_MANAGER, NCCR_ADMIN, SUPER_ADMIN ─────────────

observationRouter.post(
  "/",
  authenticate,
  authorize(
    Role.FIELD_WORKER,
    Role.NGO_MANAGER,
    Role.NCCR_ADMIN,
    Role.SUPER_ADMIN,
  ),
  validateBody(createObservationSchema),
  asyncHandler(observationController.createObservation),
);

// ─── Update — FIELD_WORKER (own), NGO_MANAGER (own org), NCCR_ADMIN, SUPER_ADMIN

observationRouter.put(
  "/:id",
  authenticate,
  authorize(
    Role.FIELD_WORKER,
    Role.NGO_MANAGER,
    Role.NCCR_ADMIN,
    Role.SUPER_ADMIN,
  ),
  validateBody(updateObservationSchema),
  asyncHandler(observationController.updateObservation),
);

// ─── Delete — FIELD_WORKER (own), NGO_MANAGER (own org), NCCR_ADMIN, SUPER_ADMIN

observationRouter.delete(
  "/:id",
  authenticate,
  authorize(
    Role.FIELD_WORKER,
    Role.NGO_MANAGER,
    Role.NCCR_ADMIN,
    Role.SUPER_ADMIN,
  ),
  asyncHandler(observationController.deleteObservation),
);

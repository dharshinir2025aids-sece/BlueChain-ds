import { Router, type Router as RouterType } from "express";
import { Role } from "@bluechain/shared";
import { asyncHandler } from "../../lib/asyncHandler";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { validateBody } from "../../middleware/validate";
import * as projectController from "./project.controller";
import {
  createProjectSchema,
  updateProjectSchema,
} from "./project.validation";

export const projectRouter: RouterType = Router();

// ─── All authenticated users can view projects ────────────────────────────────

projectRouter.get(
  "/",
  authenticate,
  asyncHandler(projectController.listProjects),
);

projectRouter.get(
  "/:id",
  authenticate,
  asyncHandler(projectController.getProject),
);

// ─── NGO_MANAGER only — create ────────────────────────────────────────────────

projectRouter.post(
  "/",
  authenticate,
  authorize(Role.NGO_MANAGER),
  validateBody(createProjectSchema),
  asyncHandler(projectController.createProject),
);

// ─── NGO_MANAGER + admins — update (status transitions need admin access) ─────

projectRouter.put(
  "/:id",
  authenticate,
  authorize(Role.NGO_MANAGER, Role.NCCR_ADMIN, Role.SUPER_ADMIN),
  validateBody(updateProjectSchema),
  asyncHandler(projectController.updateProject),
);

// ─── NGO_MANAGER only — delete (DRAFT only, enforced in service) ──────────────

projectRouter.delete(
  "/:id",
  authenticate,
  authorize(Role.NGO_MANAGER),
  asyncHandler(projectController.deleteProject),
);

import { Router, type Router as RouterType } from "express";
import { Role } from "@bluechain/shared";
import { asyncHandler } from "../../lib/asyncHandler";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { validateBody } from "../../middleware/validate";
import * as authController from "./auth.controller";
import {
  adminCreateUserSchema,
  loginSchema,
  registerSchema,
} from "./auth.validation";

export const authRouter: RouterType = Router();

// Public
authRouter.post(
  "/register",
  validateBody(registerSchema),
  asyncHandler(authController.register),
);

authRouter.post(
  "/login",
  validateBody(loginSchema),
  asyncHandler(authController.login),
);

// Protected — requires a valid JWT
authRouter.get("/me", authenticate, asyncHandler(authController.me));

// SUPER_ADMIN only — create users with any role (incl. privileged roles)
authRouter.post(
  "/users",
  authenticate,
  authorize(Role.SUPER_ADMIN),
  validateBody(adminCreateUserSchema),
  asyncHandler(authController.createUser),
);

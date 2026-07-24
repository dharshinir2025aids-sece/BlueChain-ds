import { Router, type Router as RouterType } from "express";
import { asyncHandler } from "../../lib/asyncHandler";
import { authenticate } from "../../middleware/authenticate";
import { validateBody } from "../../middleware/validate";
import * as authController from "./auth.controller";
import { loginSchema, registerSchema } from "./auth.validation";

export const authRouter: RouterType = Router();

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

authRouter.get("/me", authenticate, asyncHandler(authController.me));
